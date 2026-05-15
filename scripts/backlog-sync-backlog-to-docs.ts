#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const GENERATED_BY = 'generated-by: adponte-backlog-doc-index';

function getStagedBacklogChanges(): { docs: string[]; decisions: string[] } {
  try {
    const output = execSync('git diff --cached --name-status', { encoding: 'utf-8' });
    const docs: string[] = [];
    const decisions: string[] = [];

    for (const line of output.split('\n')) {
      if (!line.trim()) continue;
      const status = line[0];
      const filepath = line.slice(2).trim();

      if (status !== 'A' && status !== 'D' && status !== 'R') continue;

      if (filepath.startsWith('.backlog/docs/') && filepath.endsWith('.md')) {
        docs.push(filepath);
      } else if (filepath.startsWith('.backlog/decisions/') && filepath.endsWith('.md')) {
        decisions.push(filepath);
      }
    }

    return { docs, decisions };
  } catch {
    return { docs: [], decisions: [] };
  }
}

function syncBacklogToDocs(): void {
  const { docs, decisions } = getStagedBacklogChanges();

  if (docs.length === 0 && decisions.length === 0) return;

  console.log('Backlog sync: backlog -> docs...');

  for (const stubPath of docs) {
    if (!existsSync(stubPath)) continue;
    const content = readFileSync(stubPath, 'utf-8');
    if (!content.includes(GENERATED_BY)) continue;

    const canonicalMatch = content.match(/Canonical:\s+\[([^\]]+)\]\(([^)]+)\)/);
    if (!canonicalMatch) continue;

    const canonicalPath = canonicalMatch[2];
    const generatedContent = content.split('<!-- generated-by: adponte-backlog-doc-index -->')[1]?.trim();
    if (!generatedContent) continue;

    writeFileSync(canonicalPath, generatedContent, 'utf-8');
    execSync(`git add "${canonicalPath}"`, { stdio: 'pipe' });
    console.log(`  Propagated: ${canonicalPath}`);
  }

  for (const stubPath of decisions) {
    if (!existsSync(stubPath)) continue;
    const content = readFileSync(stubPath, 'utf-8');
    if (!content.includes(GENERATED_BY)) continue;

    const canonicalMatch = content.match(/Canonical ADR:\s+\[([^\]]+)\]\(([^)]+)\)/);
    if (!canonicalMatch) continue;

    const canonicalPath = canonicalMatch[2];
    const generatedContent = content.split('<!-- generated-by: adponte-backlog-doc-index -->')[1]?.trim();
    if (!generatedContent) continue;

    writeFileSync(canonicalPath, generatedContent, 'utf-8');
    execSync(`git add "${canonicalPath}"`, { stdio: 'pipe' });
    console.log(`  Propagated: ${canonicalPath}`);
  }

  console.log('Backlog sync: backlog -> docs complete');
}

syncBacklogToDocs();