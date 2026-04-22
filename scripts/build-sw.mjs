// Generates public/sw.js from scripts/sw.template.js with a fresh VERSION.
// Run via `pnpm prebuild` (or manually) before `next build`.
//
// VERSION source order:
//   1. $BUILD_ID (e.g. Vercel exposes one)
//   2. current git HEAD short sha
//   3. ISO timestamp fallback

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TEMPLATE = join(ROOT, 'scripts', 'sw.template.js');
const OUTPUT = join(ROOT, 'public', 'sw.js');

function resolveBuildId() {
  if (process.env.BUILD_ID) return process.env.BUILD_ID;
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
  }
}

const buildId = resolveBuildId();
const template = readFileSync(TEMPLATE, 'utf8');
const out = template.replaceAll('__BUILD_ID__', buildId);
writeFileSync(OUTPUT, out, 'utf8');
console.log(`[build-sw] wrote public/sw.js with VERSION=${buildId}`);
