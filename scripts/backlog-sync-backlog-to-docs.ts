#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';
import { execSync } from 'node:child_process';

const GENERATED_BY = 'adponte-backlog-doc-index';
const BACKLOG_DOCS_DIR = '.backlog/docs';
const BACKLOG_DECISIONS_DIR = '.backlog/decisions';
const CANONICAL_DOCS_DIR = 'docs';
const CANONICAL_ADRS_DIR = 'docs/adrs';

function parseYamlFrontmatter(content: string): Record<string, string> | null {
  if (!content.startsWith('---')) return null;
  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return null;

  const result: Record<string, string> = {};
  for (const line of content.slice(3, endIdx).trim().split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    result[key] = value;
  }
  return result;
}

function getCanonicalPath(backlogPath: string): string | null {
  const content = readFileSync(backlogPath, 'utf-8');
  if (!content.includes(`generated-by: ${GENERATED_BY}`)) return null;

  const canonicalMatch = content.match(/Canonical:\s+\[([^\]]+)\]\(([^)]+)\)/);
  if (!canonicalMatch) return null;

  return canonicalMatch[2];
}

function syncBacklogToCanonical(filePaths: Set<string>): void {
  for (const backlogPath of filePaths) {
    const canonicalPath = getCanonicalPath(backlogPath);
    if (!canonicalPath) continue;

    const fullCanonicalPath = join(process.cwd(), canonicalPath);
    if (!existsSync(fullCanonicalPath)) {
      console.warn(`  Canonical not found: ${canonicalPath}`);
      continue;
    }

    const content = readFileSync(backlogPath, 'utf-8');
    const markerIndex = content.indexOf(`<!-- generated-by: ${GENERATED_BY} -->`);
    if (markerIndex === -1) continue;

    const afterMarker = content.indexOf('\n', markerIndex);
    if (afterMarker === -1) continue;

    const generatedContent = content.slice(afterMarker + 1).trim();
    if (!generatedContent) continue;

    writeFileSync(fullCanonicalPath, generatedContent, 'utf-8');
    execSync(`git add "${canonicalPath}"`, { stdio: 'pipe' });
    console.log(`  Propagated: ${canonicalPath}`);
  }
}

function getStagedBacklogFiles(): Set<string> {
  const files = new Set<string>();

  try {
    const output = execSync('git diff --cached --name-status', { encoding: 'utf-8' });
    for (const line of output.split('\n')) {
      if (!line.trim()) continue;
      const status = line[0];
      const filepath = line.slice(2).trim();

      if ((status === 'A' || status === 'D' || status === 'R') && filepath.endsWith('.md')) {
        if (filepath.startsWith('.backlog/docs/') || filepath.startsWith('.backlog/decisions/')) {
          files.add(filepath);
        }
      }
    }
  } catch { }

  return files;
}

function runFullSync(): void {
  console.log('Full reverse sync — all backlog files to canonical...');

  const allBacklogFiles = new Set<string>();

  if (existsSync(BACKLOG_DOCS_DIR)) {
    for (const f of readdirSync(BACKLOG_DOCS_DIR).filter(f => f.endsWith('.md'))) {
      allBacklogFiles.add(join(BACKLOG_DOCS_DIR, f));
    }
  }

  if (existsSync(BACKLOG_DECISIONS_DIR)) {
    for (const f of readdirSync(BACKLOG_DECISIONS_DIR).filter(f => f.endsWith('.md'))) {
      allBacklogFiles.add(join(BACKLOG_DECISIONS_DIR, f));
    }
  }

  console.log(`Found ${allBacklogFiles.size} backlog files`);
  syncBacklogToCanonical(allBacklogFiles);
}

const { values, positionals } = parseArgs({
  options: {
    full: { type: 'boolean', short: 'f' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(`Usage: backlog-sync-backlog-to-docs [options] [files...]

Options:
  --full    Sync ALL backlog docs/decisions to canonical (not just staged)
  --help    Show this help message

Arguments:
  files     Specific backlog stub paths to propagate (e.g., .backlog/docs/doc-architecture.md)

With no arguments and no staged changes: does nothing.
With --full: syncs all backlog files to canonical.
With staged changes (via hook): syncs only changed backlog files.
  `);
  process.exit(0);
}

const args = process.argv.slice(2);
const isFull = args.includes('--full');
const fileArgs = args.filter(a => !a.startsWith('--'));

if (isFull) {
  runFullSync();
} else if (fileArgs.length > 0) {
  console.log(`Syncing ${fileArgs.length} file(s)...`);
  syncBacklogToCanonical(new Set(fileArgs));
} else {
  const staged = getStagedBacklogFiles();

  if (staged.size === 0) {
    console.log('No staged backlog changes and no files specified. Nothing to do.');
    process.exit(0);
  }

  console.log(`Syncing ${staged.size} staged backlog file(s)...`);
  syncBacklogToCanonical(staged);
}

console.log('Done.');