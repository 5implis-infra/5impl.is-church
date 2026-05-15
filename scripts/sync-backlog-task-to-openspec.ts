#!/usr/bin/env tsx
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BACKLOG_TASKS_DIR = '.backlog/tasks';
const OPENSPEC_CHANGES_DIR = 'openspec/changes';
const OPENSPEC_MARKER = 'openspec-backlog-task-sync';

interface BacklogTask {
  path: string;
  frontmatter: Record<string, unknown>;
  status: string;
  checklistProgress: { total: number; checked: number };
  notes: string;
}

function parseYamlFrontmatter(content: string): Record<string, unknown> | null {
  if (!content.startsWith('---')) return null;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return null;

  const yamlContent = content.slice(3, endIdx).trim();
  const result: Record<string, unknown> = {};

  for (const line of yamlContent.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    }

    result[key] = value;
  }

  return result;
}

function parseBacklogTask(filePath: string): BacklogTask | null {
  if (!existsSync(filePath)) return null;

  const content = readFileSync(filePath, 'utf-8');
  if (!content.includes(OPENSPEC_MARKER)) return null;

  const frontmatter = parseYamlFrontmatter(content);
  if (!frontmatter) return null;

  const status = frontmatter['status'] as string || 'To Do';

  const notesMatch = content.match(/## Implementation Notes\n([\s\S]*?)(?=<!-- OPENSPEC:|$)/);
  const notes = notesMatch ? notesMatch[1].trim() : '';

  const checklistMatch = content.match(/## Acceptance Criteria\n([\s\S]*?)(?=<!-- OPENSPEC:|$)/);
  let checklistProgress = { total: 0, checked: 0 };
  if (checklistMatch) {
    const items = checklistMatch[1].match(/^- \[([ x])\]/g) || [];
    const checked = items.filter(m => m.includes('[x]')).length;
    checklistProgress = { total: items.length, checked };
  }

  return { path: filePath, frontmatter, status, checklistProgress, notes };
}

function findCorrespondingOpenspecChange(taskId: string): string | null {
  if (!existsSync(OPENSPEC_CHANGES_DIR)) return null;

  const changes = readdirSync(OPENSPEC_CHANGES_DIR);

  for (const changeName of changes) {
    const changeDir = join(OPENSPEC_CHANGES_DIR, changeName);
    const tasksMdPath = join(changeDir, 'tasks.md');

    if (existsSync(tasksMdPath)) {
      const tasksContent = readFileSync(tasksMdPath, 'utf-8');
      if (tasksContent.includes(`task-${taskId}`) || tasksContent.includes(OPENSPEC_MARKER)) {
        return changeDir;
      }
    }
  }

  return null;
}

function updateOpenspecStatus(changeDir: string, status: string): void {
  const yamlPath = join(changeDir, '.openspec.yaml');
  let content = '';

  if (existsSync(yamlPath)) {
    content = readFileSync(yamlPath, 'utf-8');

    if (content.includes('status:')) {
      content = content.replace(/status:\s*\S+/, `status: ${status.toLowerCase()}`);
    } else {
      content += `\nstatus: ${status.toLowerCase()}\n`;
    }
  } else {
    content = `status: ${status.toLowerCase()}\nname: ${changeDir.split('/').pop()}\n`;
  }

  writeFileSync(yamlPath, content, 'utf-8');
  console.log(`  Updated status to ${status} in ${yamlPath}`);
}

function updateOpenspecTasks(changeDir: string, progress: { total: number; checked: number }): void {
  const tasksMdPath = join(changeDir, 'tasks.md');
  if (!existsSync(tasksMdPath)) return;

  let content = readFileSync(tasksMdPath, 'utf-8');

  const uncheckedPattern = /(- \[ \])/g;
  let uncheckedCount = 0;
  content = content.replace(uncheckedPattern, () => {
    uncheckedCount++;
    if (uncheckedCount <= progress.checked) {
      return '- [x]';
    }
    return '- [ ]';
  });

  writeFileSync(tasksMdPath, content, 'utf-8');
  console.log(`  Updated checklist: ${progress.checked}/${progress.total} checked`);
}

function appendNotes(changeDir: string, notes: string): void {
  const notesPath = join(changeDir, 'notes.md');
  const timestamp = new Date().toISOString().split('T')[0];

  const existingContent = existsSync(notesPath) ? readFileSync(notesPath, 'utf-8') : '';
  const newNotes = `\n\n## Notes (${timestamp})\n${notes}\n`;

  writeFileSync(notesPath, existingContent + newNotes, 'utf-8');
  console.log(`  Appended notes to ${notesPath}`);
}

function syncBacklogTaskToOpenspec(task: BacklogTask): void {
  const changeDir = findCorrespondingOpenspecChange(task.frontmatter['id'] as string);

  if (!changeDir) {
    console.log(`  No corresponding OpenSpec change found for ${task.frontmatter['id']}`);
    return;
  }

  console.log(`  Syncing to: ${changeDir}`);

  if (task.status !== 'To Do') {
    updateOpenspecStatus(changeDir, task.status);
  }

  if (task.checklistProgress.total > 0) {
    updateOpenspecTasks(changeDir, task.checklistProgress);
  }

  if (task.notes) {
    appendNotes(changeDir, task.notes);
  }
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const taskFiles = readdirSync(BACKLOG_TASKS_DIR).filter(f => f.endsWith('.md'));
console.log(`Reverse syncing ${taskFiles.length} Backlog tasks${dryRun ? ' (DRY RUN)' : ''}\n`);

for (const taskFile of taskFiles) {
  const taskPath = join(BACKLOG_TASKS_DIR, taskFile);
  const task = parseBacklogTask(taskPath);

  if (!task) {
    console.log(`Skipping non-generated task: ${taskFile}`);
    continue;
  }

  console.log(`Processing: ${taskFile}`);
  if (!dryRun) {
    syncBacklogTaskToOpenspec(task);
  }
}

console.log('\nReverse sync complete');