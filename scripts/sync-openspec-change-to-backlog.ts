#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

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

  const entries = readdirSync(OPENSPEC_CHANGES_DIR);
  return entries
    .filter(name => {
      const dir = join(OPENSPEC_CHANGES_DIR, name);
      return statSync(dir).isDirectory() && existsSync(join(dir, 'proposal.md'));
    })
    .map(name => ({ name, dir: join(OPENSPEC_CHANGES_DIR, name) }));
}

function findExistingTaskForChange(changeName: string): string | null {
  if (!existsSync(BACKLOG_TASKS_DIR)) return null;

  const files = readdirSync(BACKLOG_TASKS_DIR).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const content = readFileSync(join(BACKLOG_TASKS_DIR, file), 'utf-8');
    if (content.includes(`title: ${changeName}`)) {
      return file;
    }
  }
  return null;
}

function getExistingTaskId(): string {
  const tasksDir = BACKLOG_TASKS_DIR;
  if (!existsSync(tasksDir)) return 'task-001';

  const files = readdirSync(tasksDir).filter(f => f.endsWith('.md'));
  if (files.length === 0) return 'task-001';

  const ids = files
    .map(f => {
      const match = f.match(/^(task-\d+)/);
      return match ? match[1] : null;
    })
    .filter((id): id is string => id !== null);

  if (ids.length === 0) return 'task-001';

  const maxNum = Math.max(...ids.map(id => parseInt(id.replace('task-', ''), 10)));
  return `task-${String(maxNum + 1).padStart(3, '0')}`;
}

function buildFrontmatter(taskId: string, title: string, status: string, labels: string[], references: string[], documentation: string[]): string {
  const lines = [
    '---',
    `id: ${taskId}`,
    `title: ${title}`,
    `status: ${status}`,
    `labels: [${labels.map(l => `"${l}"`).join(', ')}]`,
    `references: [${references.map(r => `"${r}"`).join(', ')}]`,
    `documentation: [${documentation.map(d => `"${d}"`).join(', ')}]`,
    `generated-by: ${OPENSPEC_MARKER}`,
    '---',
    '',
  ];
  return lines.join('\n');
}

function embedSnapshot(content: string, sectionName: string): string {
  const header = `## OpenSpec ${sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace(/-/g, ' ')}\n*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*\n`;
  return `${header}<!-- OPENSPEC:${sectionName.toUpperCase()}:BEGIN -->\n${content}\n<!-- OPENSPEC:${sectionName.toUpperCase()}:END -->`;
}

function parseTaskChecklist(tasksMdPath: string): { total: number; checked: number } {
  if (!existsSync(tasksMdPath)) return { total: 0, checked: 0 };

  const content = readFileSync(tasksMdPath, 'utf-8');
  const items = content.match(/^- \[([ x])\]/g) || [];
  const checked = items.filter(m => m.includes('[x]')).length;

  return { total: items.length, checked };
}

function deriveBacklogStatus(progress: { total: number; checked: number }): string {
  if (progress.total === 0) return 'To Do';
  if (progress.checked === 0) return 'To Do';
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
  if (existsSync(verifyPath)) {
    artifacts.push({ name: 'verify', path: verifyPath });
  }

  const specsDir = join(changeDir, 'specs');
  if (existsSync(specsDir)) {
    const specFiles = readdirSync(specsDir).filter(f => f.endsWith('/spec.md'));
    if (specFiles.length > 0) {
      const allSpecs = specFiles.map(f => readFileSync(join(specsDir, f), 'utf-8')).join('\n\n');
      artifacts.push({ name: 'specs-summary', path: '', content: allSpecs });
    }
  }

  const parts: string[] = [];

  for (const artifact of artifacts) {
    let content: string;
    if ('content' in artifact && artifact.content) {
      content = artifact.content;
    } else if (artifact.path && existsSync(artifact.path)) {
      content = readFileSync(artifact.path, 'utf-8');
    } else {
      continue;
    }

    const truncated = content.split('\n').slice(0, 500).join('\n');
    parts.push(embedSnapshot(truncated, artifact.name));
    parts.push('');
  }

  return parts.join('\n');
}

function generateTaskId(title: string): string {
  const baseId = getExistingTaskId();
  const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
  return `${baseId}-${safeTitle}`;
}

function writeBacklogTask(taskId: string, title: string, status: string, body: string, isArchive = false): void {
  const dir = isArchive ? BACKLOG_ARCHIVE_DIR : BACKLOG_TASKS_DIR;
  const fileName = `${taskId} - ${title}.md`;
  const filePath = join(dir, fileName);

  const frontmatter = buildFrontmatter(
    taskId,
    title,
    status,
    ['openspec', 'sync'],
    [],
    []
  );

  writeFileSync(filePath, frontmatter + body, 'utf-8');
  console.log(`  Written: ${filePath}`);
}

function isChangeArchived(changeDir: string): boolean {
  const yamlPath = join(changeDir, '.openspec.yaml');
  if (existsSync(yamlPath)) {
    const content = readFileSync(yamlPath, 'utf-8');
    if (content.includes('status: archived') || content.includes('status: complete')) {
      return true;
    }
  }
  return false;
}

function syncChange(change: OpenspecChange, forceRegenerate = false): void {
  console.log(`\nProcessing: ${change.name}`);

  const proposalPath = join(change.dir, 'proposal.md');
  if (!existsSync(proposalPath)) {
    console.log(`  Skipping: no proposal.md in ${change.dir}`);
    return;
  }

  const proposalContent = readFileSync(proposalPath, 'utf-8');
  const titleMatch = proposalContent.match(/^#\s+(.+)/m);
  const title = titleMatch ? titleMatch[1].trim() : change.name;

  const tasksMdPath = join(change.dir, 'tasks.md');
  const progress = parseTaskChecklist(tasksMdPath);
  const status = deriveBacklogStatus(progress);

  const existingTask = findExistingTaskForChange(change.name);
  const existingIdMatch = existingTask ? existingTask.match(/^(task-\d+)/) : null;
  const taskId = existingIdMatch ? existingIdMatch[1] : getExistingTaskId();
  const body = generateTaskBody(change.dir);

  const existingPath = join(BACKLOG_TASKS_DIR, existingTask || `${taskId} - ${title}.md`);
  const existingContent = existsSync(existingPath) ? readFileSync(existingPath, 'utf-8') : '';
  const needsRegeneration = forceRegenerate ||
    !existsSync(existingPath) ||
    !existingContent.includes(OPENSPEC_MARKER) ||
    !existingContent.includes(`<!-- OPENSPEC:PROPOSAL:BEGIN -->`);

  if (!needsRegeneration) {
    console.log(`  Already synced, skipping. Use --force to regenerate.`);
    return;
  }

  if (isChangeArchived(change.dir)) {
    writeBacklogTask(taskId, title, status, body, true);
    const activePath = join(BACKLOG_TASKS_DIR, `${taskId} - ${title}.md`);
    if (existsSync(activePath)) {
      const oldContent = readFileSync(activePath, 'utf-8');
      if (oldContent.includes(OPENSPEC_MARKER)) {
        execSync(`rm "${activePath}"`);
        console.log(`  Removed active task: ${activePath}`);
      }
    }
  } else {
    writeBacklogTask(taskId, title, status, body, false);
  }

  console.log(`  Progress: ${progress.checked}/${progress.total} tasks, Status: ${status}`);
}

function validateTaskMarkdown(filePath: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!existsSync(filePath)) {
    errors.push(`File does not exist: ${filePath}`);
    return { valid: false, errors };
  }

  const content = readFileSync(filePath, 'utf-8');

  if (!content.startsWith('---')) {
    errors.push('Missing YAML frontmatter');
  } else {
    const endIdx = content.indexOf('---', 3);
    if (endIdx === -1) {
      errors.push('YAML frontmatter not closed');
    }
  }

  const sections = ['PROPOSAL', 'DESIGN', 'TASKS', 'PLAN'];
  for (const section of sections) {
    if (!content.includes(`<!-- OPENSPEC:${section}:BEGIN -->`)) {
      errors.push(`Missing section marker: OPENSPEC:${section}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function checkBacklogCli(): { available: boolean; error?: string } {
  try {
    execSync('backlog task list --plain', { stdio: 'pipe', encoding: 'utf-8' });
    return { available: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('command not found') || errorMsg.includes('not found')) {
      return { available: false, error: 'Backlog CLI not installed' };
    }
    return { available: false, error: errorMsg };
  }
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const forceRegenerate = args.includes('--force');
const changeName = args.find(a => !a.startsWith('--'));

if (changeName) {
  const changes = getOpenspecChanges();
  const change = changes.find(c => c.name === changeName);
  if (change) {
    console.log(`Syncing single change: ${changeName}${dryRun ? ' (DRY RUN)' : ''}${forceRegenerate ? ' (FORCED)' : ''}`);
    syncChange(change, forceRegenerate);
  } else {
    console.error(`Change not found: ${changeName}`);
    process.exit(1);
  }
} else {
  const changes = getOpenspecChanges();
  console.log(`Syncing ${changes.length} OpenSpec changes${dryRun ? ' (DRY RUN)' : ''}${forceRegenerate ? ' (FORCED)' : ''}`);

  for (const change of changes) {
    syncChange(change, forceRegenerate);
  }
}

const cliCheck = checkBacklogCli();
if (!cliCheck.available) {
  console.warn(`\nWarning: ${cliCheck.error}. Validation will proceed without CLI.`);
}

const taskFiles = readdirSync(BACKLOG_TASKS_DIR).filter(f => f.endsWith('.md'));
for (const taskFile of taskFiles) {
  const result = validateTaskMarkdown(join(BACKLOG_TASKS_DIR, taskFile));
  if (!result.valid) {
    console.warn(`\nValidation failed for ${taskFile}:`);
    result.errors.forEach(e => console.warn(`  - ${e}`));
  }
}