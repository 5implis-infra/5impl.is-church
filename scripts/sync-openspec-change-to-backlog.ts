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

function buildFrontmatter(taskId: string, title: string, status: string, changeDir: string): string {
  const changeName = changeDir.split('/').pop() || '';
  const changePath = `openspec/changes/${changeName}`;

  return [
    '---',
    `id: ${taskId}`,
    `title: ${title}`,
    `status: ${status}`,
    'labels: ["openspec", "sync"]',
    `references: ["${changePath}/proposal.md", "${changePath}/design.md", "${changePath}/tasks.md", "${changePath}/plan.md"]`,
    `documentation: ["${changePath}/.openspec.yaml"]`,
    `generated-by: ${OPENSPEC_MARKER}`,
    '---',
    '',
  ].join('\n');
}

const SECTION_MAP: Record<string, { label: string; marker: string }> = {
  proposal: { label: 'Description', marker: 'SECTION:DESCRIPTION' },
  tasks: { label: 'Acceptance Criteria', marker: 'AC' },
  plan: { label: 'Implementation Plan', marker: 'SECTION:PLAN' },
  brainstorm: { label: 'Implementation Notes', marker: 'SECTION:NOTES' },
  design: { label: 'Implementation Notes', marker: 'SECTION:NOTES' },
  specs: { label: 'Implementation Notes', marker: 'SECTION:NOTES' },
  verify: { label: 'Final Summary', marker: 'SECTION:FINAL_SUMMARY' },
  retrospective: { label: 'Final Summary', marker: 'SECTION:FINAL_SUMMARY' },
  dod: { label: 'Definition of Done', marker: 'DOD' },
};

function embedSnapshot(content: string, sectionName: string): string {
  const config = SECTION_MAP[sectionName] || { label: sectionName, marker: sectionName.toUpperCase() };
  const header = `## ${config.label}\n\n<!-- ${config.marker}:BEGIN -->\n`;
  return `${header}${content}\n<!-- ${config.marker}:END -->\n`;
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
  const sectionContents: Record<string, string[]> = {
    'SECTION:DESCRIPTION': [],
    'AC': [],
    'SECTION:PLAN': [],
    'SECTION:NOTES': [],
    'SECTION:FINAL_SUMMARY': [],
    'DOD': [],
  };

  const artifacts: { name: string; path: string }[] = [
    { name: 'proposal', path: join(changeDir, 'proposal.md') },
    { name: 'tasks', path: join(changeDir, 'tasks.md') },
    { name: 'plan', path: join(changeDir, 'plan.md') },
  ];

  const addArtifact = (name: string, path: string) => {
    if (existsSync(path)) artifacts.push({ name, path });
  };

  addArtifact('brainstorm', join(changeDir, 'brainstorm.md'));
  addArtifact('verify', join(changeDir, 'verify.md'));
  addArtifact('design', join(changeDir, 'design.md'));
  addArtifact('retrospective', join(changeDir, 'retrospective.md'));
  addArtifact('dod', join(changeDir, 'dod.md'));

  const specsDir = join(changeDir, 'specs');
  if (existsSync(specsDir)) {
    const specFiles: string[] = [];
    function walkSpecDir(dir: string): void {
      for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          walkSpecDir(fullPath);
        } else if (entry === 'spec.md') {
          specFiles.push(fullPath);
        }
      }
    }
    walkSpecDir(specsDir);
    if (specFiles.length > 0) {
      artifacts.push({ name: 'specs', path: '' });
      const lastArtifact = artifacts[artifacts.length - 1];
      lastArtifact.path = specFiles[0];
    }
  }

  for (const artifact of artifacts) {
    const config = SECTION_MAP[artifact.name];
    if (!config) continue;
    const content = artifact.path ? readFileSync(artifact.path, 'utf-8') : null;
    if (!content) continue;
    const truncated = content.split('\n').slice(0, 500).join('\n');
    sectionContents[config.marker].push(truncated);
  }

  const lines: string[] = [];
  for (const [marker, contents] of Object.entries(sectionContents)) {
    if (contents.length === 0) continue;
    const config = Object.values(SECTION_MAP).find(c => c.marker === marker);
    if (!config) continue;
    lines.push(`## ${config.label}\n\n<!-- ${marker}:BEGIN -->\n${contents.join('\n\n')}\n<!-- ${marker}:END -->\n`);
  }

  return lines.join('\n');
}

function writeBacklogTask(taskId: string, title: string, status: string, body: string, isArchive = false, changeDir = ''): void {
  const dir = isArchive ? BACKLOG_ARCHIVE_DIR : BACKLOG_TASKS_DIR;
  const filePath = join(dir, `${taskId} - ${title}.md`);
  writeFileSync(filePath, buildFrontmatter(taskId, title, status, changeDir) + '\n' + body, 'utf-8');
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
    writeBacklogTask(taskId, title, status, generateTaskBody(dir), true, dir);
    const activePath = join(BACKLOG_TASKS_DIR, `${taskId} - ${title}.md`);
    if (existsSync(activePath) && readFileSync(activePath, 'utf-8').includes(OPENSPEC_MARKER)) {
      rmSync(activePath);
      console.log(`  Removed active task: ${activePath}`);
    }
  } else {
    writeBacklogTask(taskId, title, status, generateTaskBody(dir), false, dir);
  }

  console.log(`  Progress: ${progress.checked}/${progress.total}, Status: ${status}`);
}

function validateTaskMarkdown(filePath: string, changeDir = ''): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!existsSync(filePath)) return { valid: false, errors: [`Missing: ${filePath}`] };

  const content = readFileSync(filePath, 'utf-8');
  if (!content.startsWith('---')) errors.push('Missing YAML frontmatter');
  else if (!content.indexOf('---', 3)) errors.push('YAML frontmatter not closed');

  if (!content.includes(OPENSPEC_MARKER)) return { valid: true, errors: [] };

  const requiredSections = new Set(['proposal', 'design', 'tasks', 'plan']);
  if (changeDir) {
    if (existsSync(join(changeDir, 'verify.md'))) requiredSections.add('verify');
    if (existsSync(join(changeDir, 'specs'))) requiredSections.add('specs-summary');
  }

  for (const section of requiredSections) {
    const config = SECTION_MAP[section];
    if (!config) continue;
    if (!content.includes(`<!-- ${config.marker}:BEGIN -->`)) {
      errors.push(`Missing section: ${config.marker}`);
    }
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