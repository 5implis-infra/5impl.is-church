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

  const result: Record<string, unknown> = {};
  for (const line of content.slice(3, endIdx).trim().split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value: string | string[] = line.slice(colonIdx + 1).trim();
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

  const notesMatch = content.match(/## Implementation Notes\n([\s\S]*?)(?=<!-- OPENSPEC:|$)/);
  const checklistMatch = content.match(/## Acceptance Criteria\n([\s\S]*?)(?=<!-- OPENSPEC:|$)/);

  let checklistProgress = { total: 0, checked: 0 };
  if (checklistMatch) {
    const items = checklistMatch[1].match(/^- \[([ x])\]/g) || [];
    checklistProgress = { total: items.length, checked: items.filter(m => m.includes('[x]')).length };
  }

  return {
    path: filePath,
    frontmatter,
    status: (frontmatter['status'] as string) || 'To Do',
    checklistProgress,
    notes: notesMatch?.[1].trim() || '',
  };
}

function findCorrespondingOpenspecChange(taskId: string): string | null {
  if (!existsSync(OPENSPEC_CHANGES_DIR)) return null;

  for (const changeName of readdirSync(OPENSPEC_CHANGES_DIR)) {
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
  let content = existsSync(yamlPath) ? readFileSync(yamlPath, 'utf-8') : '';

  if (content.includes('status:')) {
    content = content.replace(/status:\s*\S+/, `status: ${status.toLowerCase()}`);
  } else {
    content += `\nstatus: ${status.toLowerCase()}\n`;
  }
  writeFileSync(yamlPath, content, 'utf-8');
  console.log(`  Updated status to ${status}`);
}

function updateOpenspecTasks(changeDir: string, progress: { total: number; checked: number }): void {
  const tasksMdPath = join(changeDir, 'tasks.md');
  if (!existsSync(tasksMdPath)) return;

  let content = readFileSync(tasksMdPath, 'utf-8');
  let uncheckedCount = 0;
  content = content.replace(/- \[ \]/g, () => {
    uncheckedCount++;
    return uncheckedCount <= progress.checked ? '- [x]' : '- [ ]';
  });
  writeFileSync(tasksMdPath, content, 'utf-8');
  console.log(`  Updated checklist: ${progress.checked}/${progress.total}`);
}

function appendNotes(changeDir: string, notes: string): void {
  const notesPath = join(changeDir, 'notes.md');
  const timestamp = new Date().toISOString().split('T')[0];
  const existingContent = existsSync(notesPath) ? readFileSync(notesPath, 'utf-8') : '';
  writeFileSync(notesPath, existingContent + `\n\n## Notes (${timestamp})\n${notes}\n`, 'utf-8');
  console.log(`  Appended notes`);
}

function syncBacklogTaskToOpenspec(task: BacklogTask, dryRun = false): void {
  const changeDir = findCorrespondingOpenspecChange(task.frontmatter['id'] as string);

  if (!changeDir) {
    console.log(`  No corresponding OpenSpec change for ${task.frontmatter['id']}`);
    return;
  }

  console.log(`  Syncing to: ${changeDir.split('/').pop()}`);

  if (task.status !== 'To Do' && !dryRun) {
    updateOpenspecStatus(changeDir, task.status);
  }
  if (task.checklistProgress.total > 0 && !dryRun) {
    updateOpenspecTasks(changeDir, task.checklistProgress);
  }
  if (task.notes && !dryRun) {
    appendNotes(changeDir, task.notes);
  }
}

function runFullSync(dryRun = false): void {
  console.log(`Reverse syncing all Backlog tasks (${dryRun ? 'DRY RUN' : 'LIVE'})...\n`);

  if (!existsSync(BACKLOG_TASKS_DIR)) {
    console.log('No backlog tasks directory found.');
    return;
  }

  const taskFiles = readdirSync(BACKLOG_TASKS_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${taskFiles.length} tasks`);

  for (const taskFile of taskFiles) {
    const taskPath = join(BACKLOG_TASKS_DIR, taskFile);
    const task = parseBacklogTask(taskPath);

    if (!task) {
      console.log(`Skipping non-generated task: ${taskFile}`);
      continue;
    }

    console.log(`Processing: ${taskFile}`);
    syncBacklogTaskToOpenspec(task, dryRun);
  }
}

const args = process.argv.slice(2);
const isFull = args.includes('--full');
const isDryRun = args.includes('--dry-run');
const fileArgs = args.filter(a => !a.startsWith('--'));

if (isFull) {
  runFullSync(isDryRun);
} else if (fileArgs.length === 0) {
  console.log('No files specified. Use --full to sync all, or pass Backlog task file paths.');
  console.log('This script is typically only run manually — not via hooks.');
  process.exit(0);
} else {
  console.log(`Syncing ${fileArgs.length} task(s)...`);
  for (const taskPath of fileArgs) {
    const resolved = existsSync(taskPath) ? taskPath : join(BACKLOG_TASKS_DIR, taskPath);
    const task = parseBacklogTask(resolved);
    if (task) {
      console.log(`Processing: ${taskPath}`);
      syncBacklogTaskToOpenspec(task, isDryRun);
    } else {
      console.error(`  Not found or not generated by sync: ${taskPath}`);
    }
  }
}

console.log('\nReverse sync complete.');