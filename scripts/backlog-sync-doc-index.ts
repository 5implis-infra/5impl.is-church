#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { execSync } from 'node:child_process';

const GENERATED_BY = 'adponte-backlog-doc-index';
const BACKLOG_DOCS_DIR = '.backlog/docs';
const BACKLOG_DECISIONS_DIR = '.backlog/decisions';
const CANONICAL_DOCS_DIR = 'docs';
const CANONICAL_ADRS_DIR = 'docs/adrs';

interface FrontmatterResult {
  title: string;
  date?: string;
  status?: string;
}

function parseFrontmatter(content: string): FrontmatterResult | null {
  const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (yamlMatch) {
    const result: FrontmatterResult = { title: '' };
    for (const line of yamlMatch[1].split('\n')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (key === 'title') result.title = value;
      else if (key === 'date') result.date = value;
      else if (key === 'status') result.status = value;
    }
    return result.title ? result : null;
  }

  const adrMatch = content.match(/^#\s+(\d+)\.\s+(.+)$/m);
  if (adrMatch) {
    return {
      title: adrMatch[2].trim(),
      date: content.match(/^-?\s*Date:\s*([\d-]+)/im)?.[1],
      status: content.match(/^-?\s*Status:\s*(\w+)/im)?.[1],
    };
  }

  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return { title: h1Match[1].replace(/^#\s+/, '').trim() };

  return null;
}

function getDocId(path: string): string {
  return `doc-${basename(path, '.md').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function getDecisionId(path: string): string {
  const numMatch = basename(path, '.md').match(/^(\d+)-/);
  if (numMatch) return `decision-${numMatch[1]}`;
  return `decision-${basename(path, '.md').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function scanCanonicalDir(dir: string, excludePrefix: string): Array<{ path: string; relativePath: string; frontmatter: FrontmatterResult }> {
  const results: Array<{ path: string; relativePath: string; frontmatter: FrontmatterResult }> = [];
  if (!existsSync(dir)) return results;

  function walk(subdir: string): void {
    for (const entry of readdirSync(subdir)) {
      const fullPath = join(subdir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (!entry.startsWith('.')) walk(fullPath);
      } else if (entry.endsWith('.md')) {
        if (excludePrefix && fullPath.startsWith(excludePrefix)) continue;
        const rel = relative(dir, fullPath);
        const fm = parseFrontmatter(readFileSync(fullPath, 'utf-8'));
        if (fm?.title) results.push({ path: fullPath, relativePath: rel, frontmatter: fm });
      }
    }
  }

  walk(dir);
  return results;
}

function generateDocStub(file: { path: string; relativePath: string; frontmatter: FrontmatterResult }): string {
  const id = getDocId(file.path);
  const canonicalRel = `../../docs/${file.relativePath.replace(/\\/g, '/')}`;
  const fullContent = readFileSync(file.path, 'utf-8');

  return `---
id: ${id}
title: "${file.frontmatter.title}"
type: documentation
created_date: "${new Date().toISOString().split('T')[0]}"
---
<!-- generated-by: ${GENERATED_BY} -->

Canonical: [${file.relativePath}](${canonicalRel})

${fullContent}
`;
}

function generateDecisionStub(file: { path: string; relativePath: string; frontmatter: FrontmatterResult }): string {
  const id = getDecisionId(file.path);
  const canonicalRel = `../../docs/adrs/${file.relativePath.replace(/\\/g, '/')}`;
  const fullContent = readFileSync(file.path, 'utf-8');
  const fm = file.frontmatter;

  let extras = '';
  if (fm.date) extras += `\ndate: "${fm.date}"`;
  if (fm.status) extras += `\nstatus: ${fm.status.toLowerCase()}`;

  return `---
id: ${id}
title: "${fm.title}"${extras}
---
<!-- generated-by: ${GENERATED_BY} -->

Canonical ADR: [${file.relativePath}](${canonicalRel})

${fullContent}
`;
}

function isGeneratedBySync(filePath: string, marker: string): boolean {
  if (!existsSync(filePath)) return false;
  return readFileSync(filePath, 'utf-8').includes(`generated-by: ${marker}`);
}

function cleanupGeneratedOrphans(stubsDir: string, generatedBy: string, canonicalFiles: Set<string>): void {
  if (!existsSync(stubsDir)) return;

  for (const entry of readdirSync(stubsDir, { withFileTypes: true })) {
    const fullPath = join(stubsDir, entry.name);

    if (entry.isDirectory()) {
      cleanupGeneratedOrphans(fullPath, generatedBy, canonicalFiles);
      if (readdirSync(fullPath).length === 0) rmSync(fullPath);
    } else if (entry.name.endsWith('.md')) {
      if (!isGeneratedBySync(fullPath, generatedBy)) continue;
      if (!canonicalFiles.has(fullPath)) {
        rmSync(fullPath);
      }
    }
  }
}

function cleanupOrphans(stubsDir: string, generatedBy: string): void {
  if (!existsSync(stubsDir)) return;

  for (const entry of readdirSync(stubsDir, { withFileTypes: true })) {
    const fullPath = join(stubsDir, entry.name);

    if (entry.isDirectory()) {
      cleanupOrphans(fullPath, generatedBy);
      if (readdirSync(fullPath).length === 0) rmSync(fullPath);
    } else if (entry.name.endsWith('.md')) {
      if (!isGeneratedBySync(fullPath, generatedBy)) continue;
    }
  }
}

function getCanonicalFilePaths(): { docs: Set<string>; adrs: Set<string> } {
  const docs = new Set<string>();
  const adrs = new Set<string>();

  for (const file of scanCanonicalDir(CANONICAL_DOCS_DIR, join(CANONICAL_DOCS_DIR, 'adrs'))) {
    docs.add(join(BACKLOG_DOCS_DIR, getDocId(file.path) + '.md'));
  }
  for (const file of scanCanonicalDir(CANONICAL_ADRS_DIR, '')) {
    adrs.add(join(BACKLOG_DECISIONS_DIR, getDecisionId(file.path) + '.md'));
  }

  return { docs, adrs };
}

function getStagedCanonicalFiles(): { docs: Set<string>; adrs: Set<string> } {
  const docs = new Set<string>();
  const adrs = new Set<string>();

  try {
    const output = execSync('git diff --cached --name-status', { encoding: 'utf-8' });
    for (const line of output.split('\n')) {
      if (!line.trim()) continue;
      const status = line[0];
      const filepath = line.slice(2).trim();

      if (filepath.startsWith('docs/') && filepath.endsWith('.md') && (status === 'A' || status === 'D' || status === 'R')) {
        if (filepath.startsWith('docs/adrs/')) adrs.add(filepath);
        else docs.add(filepath);
      }
    }
  } catch { }

  return { docs, adrs };
}

function syncFiles(filePaths: Set<string>, isAdr = false): void {
  const canonicalDir = isAdr ? CANONICAL_ADRS_DIR : CANONICAL_DOCS_DIR;
  const backlogDir = isAdr ? BACKLOG_DECISIONS_DIR : BACKLOG_DOCS_DIR;

  ensureDir(backlogDir);

  for (const relPath of filePaths) {
    const fullPath = join(canonicalDir, relPath);
    if (!existsSync(fullPath)) continue;

    const fm = parseFrontmatter(readFileSync(fullPath, 'utf-8'));
    if (!fm?.title) continue;

    const file = { path: fullPath, relativePath: relPath, frontmatter: fm };
    const stub = isAdr ? generateDecisionStub(file) : generateDocStub(file);
    const stubId = isAdr ? getDecisionId(fullPath) : getDocId(fullPath);
    const stubPath = join(backlogDir, stubId + '.md');

    writeFileSync(stubPath, stub, 'utf-8');
    console.log(`  Synced: ${relPath} -> ${stubPath}`);
  }
}

function runFullSync(): void {
  console.log('Running full sync — clearing synced backlog docs/decisions...');

  if (existsSync(BACKLOG_DOCS_DIR)) {
    for (const f of readdirSync(BACKLOG_DOCS_DIR).filter(f => f.endsWith('.md'))) {
      if (isGeneratedBySync(join(BACKLOG_DOCS_DIR, f), GENERATED_BY)) {
        rmSync(join(BACKLOG_DOCS_DIR, f));
      }
    }
  }
  if (existsSync(BACKLOG_DECISIONS_DIR)) {
    for (const f of readdirSync(BACKLOG_DECISIONS_DIR).filter(f => f.endsWith('.md'))) {
      if (isGeneratedBySync(join(BACKLOG_DECISIONS_DIR, f), GENERATED_BY)) {
        rmSync(join(BACKLOG_DECISIONS_DIR, f));
      }
    }
  }

  console.log('Syncing all canonical docs and ADRs...');

  const allDocs = scanCanonicalDir(CANONICAL_DOCS_DIR, join(CANONICAL_DOCS_DIR, 'adrs'));
  const allAdrs = scanCanonicalDir(CANONICAL_ADRS_DIR, '');

  for (const file of allDocs) {
    const stub = generateDocStub(file);
    const stubPath = join(BACKLOG_DOCS_DIR, getDocId(file.path) + '.md');
    writeFileSync(stubPath, stub, 'utf-8');
    console.log(`  Doc: ${file.relativePath}`);
  }

  for (const file of allAdrs) {
    const stub = generateDecisionStub(file);
    const stubPath = join(BACKLOG_DECISIONS_DIR, getDecisionId(file.path) + '.md');
    writeFileSync(stubPath, stub, 'utf-8');
    console.log(`  ADR: ${file.relativePath}`);
  }

  const { docs, adrs } = getCanonicalFilePaths();
  cleanupOrphans(BACKLOG_DOCS_DIR, GENERATED_BY);
  cleanupOrphans(BACKLOG_DECISIONS_DIR, GENERATED_BY);
}

const { values, positionals } = parseArgs({
  options: {
    full: { type: 'boolean', short: 'f' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(`Usage: backlog-sync-doc-index [options] [files...]

Options:
  --full    Clear and regenerate all backlog docs/decisions from canonical
  --help    Show this help message

Arguments:
  files     Specific canonical doc/ADR paths to sync (e.g., docs/ARCHITECTURE.md)

With no arguments and no staged changes: does nothing.
With --full: clears backlog dirs and regenerates all from canonical.
With staged changes (via hook): syncs only changed files.
  `);
  process.exit(0);
}

const args = process.argv.slice(2);
const isFull = args.includes('--full');
const fileArgs = args.filter(a => !a.startsWith('--'));

if (isFull) {
  runFullSync();
  try { execSync('git add .backlog/docs .backlog/decisions', { stdio: 'pipe' }); } catch { }
} else if (fileArgs.length > 0) {
  console.log(`Syncing ${fileArgs.length} file(s)...`);
  const docs = new Set<string>();
  const adrs = new Set<string>();

  for (const f of fileArgs) {
    if (f.startsWith('docs/adrs/')) adrs.add(f);
    else if (f.startsWith('docs/')) docs.add(f);
    else console.warn(`  Skipping non-canonical path: ${f}`);
  }

  if (docs.size > 0) syncFiles(docs, false);
  if (adrs.size > 0) syncFiles(adrs, true);

  try { execSync('git add .backlog/docs .backlog/decisions', { stdio: 'pipe' }); } catch { }
} else {
  const staged = getStagedCanonicalFiles();

  if (staged.docs.size === 0 && staged.adrs.size === 0) {
    console.log('No staged changes and no files specified. Nothing to do.');
    process.exit(0);
  }

  console.log(`Syncing ${staged.docs.size + staged.adrs.size} staged file(s)...`);
  if (staged.docs.size > 0) syncFiles(staged.docs, false);
  if (staged.adrs.size > 0) syncFiles(staged.adrs, true);

  try { execSync('git add .backlog/docs .backlog/decisions', { stdio: 'pipe' }); } catch { }
}

console.log('Done.');