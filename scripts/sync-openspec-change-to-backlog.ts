#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const BACKLOG_TASKS_DIR = '.backlog/tasks';
const BACKLOG_ARCHIVE_DIR = '.backlog/archive';
const OPENSPEC_CHANGES_DIR = 'openspec/changes';
const OPENSPEC_MARKER = 'openspec-backlog-task-sync';

interface OpenspecChange {
  name: string;
  dir: string;
}

function getOpenspecChanges(): OpenspecChange[] {
  if (!existsSync(OPENSPEC_CHANGES_DIR)) return [];
  return readdirSync(OPENSPEC_CHANGES_DIR)
    .filter(name => {
      const dir = join(OPENSPEC_CHANGES_DIR, name);
      return statSync(dir).isDirectory() && existsSync(join(dir, 'proposal.md'));
    })
    .map(name => ({ name, dir: join(OPENSPEC_CHANGES_DIR, name) }));
}

function findChangeByDir(changeDir: string): OpenspecChange | null {
  const name = changeDir.split('/').pop() || '';
  if (existsSync(changeDir) && existsSync(join(changeDir, 'proposal.md'))) {
    return { name, dir: changeDir };
  }
  return null;
}

function getExistingTaskId(): string {
  if (!existsSync(BACKLOG_TASKS_DIR)) return 'task-001';
  const files = readdirSync(BACKLOG_TASKS_DIR).filter(f => f.endsWith('.md'));
  if (files.length === 0) return 'task-001';

  const ids = files
    .map(f => f.match(/^(task-\d+)/)?.[1])
    .filter(Boolean);

  if (ids.length === 0) return 'task-001';
  const maxNum = Math.max(...ids.map(id => parseInt(id.replace('task-', ''), 10)));
  return `task-${String(maxNum + 1).padStart(3, '0')}`;
}

function findExistingTaskForChange(changeName: string): string | null {
  if (!existsSync(BACKLOG_TASKS_DIR)) return null;
  for (const file of readdirSync(BACKLOG_TASKS_DIR).filter(f => f.endsWith('.md'))) {
    const content = readFileSync(join(BACKLOG_TASKS_DIR, file), 'utf-8');
    if (content.includes(`title: ${changeName}`)) return file;
  }
  return null;
}

function buildFrontmatter(taskId: string, title: string, status: string): string {
  return [
    '---',
    `id: ${taskId}`,
    `title: ${title}`,
    `status: ${status}`,
    'labels: ["openspec", "sync"]',
    'references: []',
    'documentation: []',
    `generated-by: ${OPENSPEC_MARKER}`,
    '---',
    '',
  ].join('\n');
}

const SECTION_MAP: Record<string, { label: string; marker: string }> = {
  proposal: { label: 'Description', marker: 'SECTION:DESCRIPTION' },
  design: { label: 'Discussion', marker: 'SECTION:DISCUSSION' },
  tasks: { label: 'Acceptance Criteria', marker: 'AC' },
  plan: { label: 'Implementation Plan', marker: 'SECTION:PLAN' },
  verify: { label: 'Notes', marker: 'SECTION:NOTES' },
  'specs-summary': { label: 'Specifications', marker: 'SECTION:SPECIFICATIONS' },
};

function embedSnapshot(content: string, sectionName: string): string {
  const config = SECTION_MAP[sectionName] || { label: sectionName, marker: sectionName.toUpperCase() };
  const header = `## ${config.label}\n*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*\n`;
  return `${header}<!-- ${config.marker}:BEGIN -->\n${content}\n<!-- ${config.marker}:END -->`;
}

function parseTaskChecklist(tasksMdPath: string): { total: number; checked: number } {
  if (!existsSync(tasksMdPath)) return { total: 0, checked: 0 };
  const items = readFileSync(tasksMdPath, 'utf-8').match(/^- \[([ x])\]/g) || [];
  return { total: items.length, checked: items.filter(m => m.includes('[x]')).length };
}

function deriveBacklogStatus(progress: { total: number; checked: number }): string {
  if (progress.total === 0 || progress.checked === 0) return 'To Do';
  if (progress.checked === progress.total) return 'Done';
  return 'In Progress';
}

function generateTaskBody(changeDir: string): string {
  const artifacts = [
    { name: 'proposal', path: join(changeDir, 'proposal.md') },
    { name: 'design', path: join(changeDir, 'design.md') },
    { name: 'tasks', path: join(changeDir, 'tasks.md') },
    { name: 'plan', path: join(changeDir, 'plan.md') },
  ];

  const verifyPath = join(changeDir, 'verify.md');
  if (existsSync(verifyPath)) artifacts.push({ name: 'verify', path: verifyPath });

  const specsDir = join(changeDir, 'specs');
  if (existsSync(specsDir)) {
    const specFiles = readdirSync(specsDir).filter(f => f.endsWith('/spec.md'));
    if (specFiles.length > 0) {
      artifacts.push({ name: 'specs-summary', path: '', content: specFiles.map(f => readFileSync(join(specsDir, f), 'utf-8')).join('\n\n') });
    }
  }

  return artifacts
    .map(artifact => {
      let content = 'content' in artifact ? artifact.content : existsSync(artifact.path) ? readFileSync(artifact.path, 'utf-8') : null;
      if (!content) return null;
      return embedSnapshot(content.split('\n').slice(0, 500).join('\n'), artifact.name);
    })
    .filter(Boolean)
    .join('\n\n');
}

function writeBacklogTask(taskId: string, title: string, status: string, body: string, isArchive = false): void {
  const dir = isArchive ? BACKLOG_ARCHIVE_DIR : BACKLOG_TASKS_DIR;
  const filePath = join(dir, `${taskId} - ${title}.md`);
  writeFileSync(filePath, buildFrontmatter(taskId, title, status) + '\n' + body, 'utf-8');
  console.log(`  Written: ${filePath}`);
}

function isChangeArchived(changeDir: string): boolean {
  const yamlPath = join(changeDir, '.openspec.yaml');
  if (existsSync(yamlPath)) {
    const content = readFileSync(yamlPath, 'utf-8');
    if (content.includes('status: archived') || content.includes('status: complete')) return true;
  }
  return false;
}

function syncChange(change: OpenspecChange, force = false): void {
  const { name, dir } = change;
  console.log(`\nProcessing: ${name}`);

  const proposalPath = join(dir, 'proposal.md');
  if (!existsSync(proposalPath)) {
    console.log(`  Skipping: no proposal.md`);
    return;
  }

  const title = readFileSync(proposalPath, 'utf-8').match(/^#\s+(.+)/m)?.[1]?.trim() || name;
  const progress = parseTaskChecklist(join(dir, 'tasks.md'));
  const status = deriveBacklogStatus(progress);

  const existingTask = findExistingTaskForChange(name);
  const existingIdMatch = existingTask?.match(/^(task-\d+)/);
  const taskId = existingIdMatch ? existingIdMatch[1] : getExistingTaskId();

  const existingPath = join(BACKLOG_TASKS_DIR, existingTask || `${taskId} - ${title}.md`);
  const existingContent = existsSync(existingPath) ? readFileSync(existingPath, 'utf-8') : '';
  const needsRegeneration = force || !existsSync(existingPath) || !existingContent.includes(OPENSPEC_MARKER);

  if (!needsRegeneration) {
    console.log(`  Already synced, skipping. Use --force to regenerate.`);
    return;
  }

  if (isChangeArchived(dir)) {
    writeBacklogTask(taskId, title, status, generateTaskBody(dir), true);
    const activePath = join(BACKLOG_TASKS_DIR, `${taskId} - ${title}.md`);
    if (existsSync(activePath) && readFileSync(activePath, 'utf-8').includes(OPENSPEC_MARKER)) {
      rmSync(activePath);
      console.log(`  Removed active task: ${activePath}`);
    }
  } else {
    writeBacklogTask(taskId, title, status, generateTaskBody(dir), false);
  }

  console.log(`  Progress: ${progress.checked}/${progress.total}, Status: ${status}`);
}

function validateTaskMarkdown(filePath: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!existsSync(filePath)) return { valid: false, errors: [`Missing: ${filePath}`] };

  const content = readFileSync(filePath, 'utf-8');
  if (!content.startsWith('---')) errors.push('Missing YAML frontmatter');
  else if (!content.indexOf('---', 3)) errors.push('YAML frontmatter not closed');

  for (const section of ['PROPOSAL', 'DESIGN', 'TASKS', 'PLAN']) {
    const marker = section === 'TASKS' ? 'AC' : `SECTION:${section}`;
    if (!content.includes(`<!-- ${marker}:BEGIN -->`)) errors.push(`Missing: ${section}`);
  }

  return { valid: errors.length === 0, errors };
}

function isGeneratedBySync(filePath: string, marker: string): boolean {
  if (!existsSync(filePath)) return false;
  return readFileSync(filePath, 'utf-8').includes(marker);
}

function runFullSync(): void {
  console.log('Running full sync — clearing synced backlog tasks...');

  if (!existsSync(BACKLOG_TASKS_DIR)) {
    console.log('No backlog tasks dir, creating...');
  } else {
    for (const file of readdirSync(BACKLOG_TASKS_DIR).filter(f => f.endsWith('.md'))) {
      if (isGeneratedBySync(join(BACKLOG_TASKS_DIR, file), OPENSPEC_MARKER)) {
        rmSync(join(BACKLOG_TASKS_DIR, file));
      }
    }
  }

  console.log('Syncing all OpenSpec changes...');
  for (const change of getOpenspecChanges()) {
    syncChange(change, true);
  }
}

const args = process.argv.slice(2);
const isFull = args.includes('--full');
const isForce = args.includes('--force');
const fileArgs = args.filter(a => !a.startsWith('--'));

if (isFull) {
  runFullSync();
} else if (fileArgs.length === 0) {
  console.log('No files specified. Use --full to sync all, or pass OpenSpec change directories.');
  process.exit(0);
} else {
  console.log(`Syncing ${fileArgs.length} change(s)...`);
  for (const changeDir of fileArgs) {
    const change = findChangeByDir(changeDir);
    if (change) syncChange(change, isForce);
    else console.error(`  Not found or invalid: ${changeDir}`);
  }
}

console.log('\nValidating generated tasks...');
if (existsSync(BACKLOG_TASKS_DIR)) {
  for (const taskFile of readdirSync(BACKLOG_TASKS_DIR).filter(f => f.endsWith('.md'))) {
    const result = validateTaskMarkdown(join(BACKLOG_TASKS_DIR, taskFile));
    if (!result.valid) {
      console.warn(`\nValidation failed for ${taskFile}:`);
      result.errors.forEach(e => console.warn(`  - ${e}`));
    }
  }
}

try {
  execSync('backlog task list --plain', { stdio: 'pipe', encoding: 'utf-8' });
} catch {
  console.warn('\nWarning: Backlog CLI not available. Validation runs without CLI.');
}