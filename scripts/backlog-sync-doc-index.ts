#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';
import { execSync } from 'node:child_process';

const GENERATED_BY = 'adponte-backlog-doc-index';
const BACKLOG_DOCS_DIR = '.backlog/docs';
const BACKLOG_DECISIONS_DIR = '.backlog/decisions';

interface FrontmatterResult {
  title: string;
  date?: string;
  status?: string;
  raw: string;
}

function parseFrontmatter(content: string): FrontmatterResult | null {
  const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (yamlMatch) {
    const raw = yamlMatch[1];
    const result: FrontmatterResult = { title: '', raw };
    for (const line of raw.split('\n')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (key === 'title') result.title = value;
      else if (key === 'date') result.date = value;
      else if (key === 'status') result.status = value;
    }
    return result;
  }

  const adrMatch = content.match(/^#\s+(\d+)\.\s+(.+)$/m);
  if (adrMatch) {
    const statusMatch = content.match(/^-?\s*Status:\s*(\w+)/im);
    const dateMatch = content.match(/^-?\s*Date:\s*([\d-]+)/im);
    return {
      title: adrMatch[2].trim(),
      date: dateMatch?.[1],
      status: statusMatch?.[1],
      raw: content.slice(0, 200)
    };
  }

  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return {
      title: h1Match[1].replace(/^#\s+/, '').trim(),
      raw: content.slice(0, 200)
    };
  }

  return null;
}

function getDocId(canonicalPath: string): string {
  const filename = basename(canonicalPath, '.md');
  return `doc-${filename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function getDecisionId(canonicalPath: string): string {
  const filename = basename(canonicalPath, '.md');
  const numMatch = filename.match(/^(\d+)-/);
  if (numMatch) return `decision-${numMatch[1]}`;
  return `decision-${filename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function toTitleCase(str: string): string {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function scanCanonicalDocs(): Array<{ path: string; relativePath: string; frontmatter: FrontmatterResult }> {
  const docsDir = 'docs';
  const results: Array<{ path: string; relativePath: string; frontmatter: FrontmatterResult }> = [];

  if (!existsSync(docsDir)) return results;

  function walk(dir: string): void {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (!entry.startsWith('.')) walk(fullPath);
      } else if (entry.endsWith('.md')) {
        if (!fullPath.startsWith(join(docsDir, 'adrs'))) {
          const rel = relative(docsDir, fullPath);
          const content = readFileSync(fullPath, 'utf-8');
          const fm = parseFrontmatter(content);
          if (fm?.title) {
            results.push({ path: fullPath, relativePath: rel, frontmatter: fm });
          }
        }
      }
    }
  }

  walk(docsDir);
  return results;
}

function scanCanonicalADRs(): Array<{ path: string; relativePath: string; frontmatter: FrontmatterResult }> {
  const adrsDir = 'docs/adrs';
  const results: Array<{ path: string; relativePath: string; frontmatter: FrontmatterResult }> = [];

  if (!existsSync(adrsDir)) return results;

  const entries = readdirSync(adrsDir);
  for (const entry of entries) {
    if (!entry.endsWith('.md')) continue;
    const fullPath = join(adrsDir, entry);
    const content = readFileSync(fullPath, 'utf-8');
    const fm = parseFrontmatter(content);
    if (fm?.title) {
      results.push({ path: fullPath, relativePath: entry, frontmatter: fm });
    }
  }

  return results;
}

function generateDocStub(file: { path: string; relativePath: string; frontmatter: FrontmatterResult }): string {
  const id = getDocId(file.path);
  const canonicalRel = `../../docs/${file.relativePath.replace(/\\/g, '/')}`;
  const title = file.frontmatter.title;
  const fullContent = readFileSync(file.path, 'utf-8');

  return `---
id: ${id}
title: "${title}"
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

  let dateLine = '';
  let statusLine = '';
  if (fm.date) dateLine = `\ndate: "${fm.date}"`;
  if (fm.status) statusLine = `\nstatus: ${fm.status.toLowerCase()}`;

  return `---
id: ${id}
title: "${fm.title}"${dateLine}${statusLine}
---
<!-- generated-by: ${GENERATED_BY} -->

Canonical ADR: [${file.relativePath}](${canonicalRel})

${fullContent}
`;
}

function cleanupOrphans(stubsDir: string, canonicalFiles: Set<string>, generatedBy: string): void {
  if (!existsSync(stubsDir)) return;

  const entries = readdirSync(stubsDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(stubsDir, entry.name);

    if (entry.isDirectory()) {
      cleanupOrphans(fullPath, canonicalFiles, generatedBy);
      if (readdirSync(fullPath).length === 0) {
        rmSync(fullPath, { recursive: true });
      }
    } else if (entry.name.endsWith('.md')) {
      const content = readFileSync(fullPath, 'utf-8');
      if (!content.includes(`generated-by: ${generatedBy}`)) continue;
      if (!canonicalFiles.has(fullPath)) {
        rmSync(fullPath);
      }
    }
  }
}

function getStagedChanges(): { docs: Set<string>; adrs: Set<string> } {
  const docs = new Set<string>();
  const adrs = new Set<string>();

  try {
    const output = execSync('git diff --cached --name-status', { encoding: 'utf-8' });
    for (const line of output.split('\n')) {
      if (!line.trim()) continue;
      const status = line[0];
      const filepath = line.slice(2).trim();

      if (filepath.startsWith('docs/') && filepath.endsWith('.md')) {
        if (status === 'A' || status === 'D' || status === 'R') {
          if (filepath.startsWith('docs/adrs/')) {
            adrs.add(filepath);
          } else {
            docs.add(filepath);
          }
        }
      }
    }
  } catch {
    return { docs: new Set(), adrs: new Set() };
  }

  return { docs, adrs };
}

function getAllCanonicalPaths(): { docs: Set<string>; adrs: Set<string> } {
  const docs = new Set<string>();
  const adrs = new Set<string>();

  for (const file of scanCanonicalDocs()) {
    docs.add(join(BACKLOG_DOCS_DIR, getDocId(file.path) + '.md'));
  }
  for (const file of scanCanonicalADRs()) {
    adrs.add(join(BACKLOG_DECISIONS_DIR, getDecisionId(file.path) + '.md'));
  }

  return { docs, adrs };
}

function runSync(full = false): void {
  ensureDir(BACKLOG_DOCS_DIR);
  ensureDir(BACKLOG_DECISIONS_DIR);

  const staged = full ? { docs: new Set<string>(), adrs: new Set<string>() } : getStagedChanges();

  const canonicalDocs = scanCanonicalDocs();
  const canonicalADRs = scanCanonicalADRs();

  const allDocStubs = new Set<string>();
  for (const file of canonicalDocs) {
    const stub = generateDocStub(file);
    const stubPath = join(BACKLOG_DOCS_DIR, getDocId(file.path) + '.md');
    writeFileSync(stubPath, stub, 'utf-8');
    allDocStubs.add(stubPath);
  }

  const allDecisionStubs = new Set<string>();
  for (const file of canonicalADRs) {
    const stub = generateDecisionStub(file);
    const stubPath = join(BACKLOG_DECISIONS_DIR, getDecisionId(file.path) + '.md');
    writeFileSync(stubPath, stub, 'utf-8');
    allDecisionStubs.add(stubPath);
  }

  const canonicalDocPaths = new Set([...allDocStubs]);
  const canonicalAdrPaths = new Set([...allDecisionStubs]);
  cleanupOrphans(BACKLOG_DOCS_DIR, canonicalDocPaths, GENERATED_BY);
  cleanupOrphans(BACKLOG_DECISIONS_DIR, canonicalAdrPaths, GENERATED_BY);

  if (!full && (staged.docs.size > 0 || staged.adrs.size > 0)) {
    try {
      execSync('git add .backlog/docs .backlog/decisions', { stdio: 'pipe' });
    } catch { }
  }
}

const { values } = parseArgs({
  options: {
    full: { type: 'boolean', short: 'f' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(`Usage: backlog-sync-doc-index [options]
Options:
  --full    Process all canonical files (not just staged changes)
  --help    Show this help message`);
  process.exit(0);
}

runSync(values.full);