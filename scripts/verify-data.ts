// scripts/verify-data.ts
// Data integrity verification for articles.ts SSOT.
// Run by GitHub Actions on every push that modifies src/data/articles.ts.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { articles, pillars } from '../src/data/articles';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let errors = 0;
let warnings = 0;

function error(msg: string) {
  console.error(`ERROR: ${msg}`);
  errors++;
}

function warn(msg: string) {
  console.warn(`WARNING: ${msg}`);
  warnings++;
}

// Unique slug checks
const articleSlugs = new Set<string>();
for (const a of articles) {
  if (articleSlugs.has(a.slug)) error(`Duplicate article slug: ${a.slug}`);
  articleSlugs.add(a.slug);
}

const pillarSlugs = new Set<string>();
for (const p of pillars) {
  if (pillarSlugs.has(p.slug)) error(`Duplicate pillar slug: ${p.slug}`);
  pillarSlugs.add(p.slug);
}

// Article field validation
for (const a of articles) {
  if (!a.slug) error(`Article missing slug: ${a.title || 'unknown'}`);
  if (!a.url || !a.url.startsWith('https://wenboom.com/')) error(`Article invalid URL: ${a.slug}`);
  if (!a.title) error(`Article missing title: ${a.slug}`);
  if (!a.description || a.description.length < 50) warn(`Article description too short: ${a.slug}`);
  if (!['published', 'published_soon'].includes(a.status)) error(`Article invalid status: ${a.slug} = ${a.status}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.publishedDate)) error(`Article invalid publishedDate: ${a.slug} = ${a.publishedDate}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.updatedDate)) error(`Article invalid updatedDate: ${a.slug} = ${a.updatedDate}`);
  if (a.updatedDate < a.publishedDate) error(`Article updatedDate before publishedDate: ${a.slug}`);
  if (!a.metaTag) warn(`Article missing metaTag: ${a.slug}`);
}

// Pillar field validation including benchmarkDetail
for (const p of pillars) {
  if (!p.slug) error(`Pillar missing slug: ${p.name || 'unknown'}`);
  if (!p.url || !p.url.startsWith('https://wenboom.com/')) error(`Pillar invalid URL: ${p.slug}`);
  if (!p.name) error(`Pillar missing name: ${p.slug}`);
  if (!p.description) error(`Pillar missing description: ${p.slug}`);
  if (!p.metrics || Object.keys(p.metrics).length === 0) error(`Pillar missing metrics: ${p.slug}`);
  if (!p.benchmarkDetail) {
    error(`Pillar missing benchmarkDetail: ${p.slug}`);
  } else {
    if (!p.benchmarkDetail.testEnvironment || Object.keys(p.benchmarkDetail.testEnvironment).length === 0) {
      error(`Pillar missing benchmarkDetail.testEnvironment: ${p.slug}`);
    }
    if (!p.benchmarkDetail.architecture || Object.keys(p.benchmarkDetail.architecture).length === 0) {
      error(`Pillar missing benchmarkDetail.architecture: ${p.slug}`);
    }
    if (!p.benchmarkDetail.failureModes || p.benchmarkDetail.failureModes.length === 0) {
      error(`Pillar missing benchmarkDetail.failureModes: ${p.slug}`);
    } else {
      for (const fm of p.benchmarkDetail.failureModes) {
        if (!fm.mode || !fm.fix) error(`Pillar ${p.slug} has failureMode missing mode or fix`);
      }
    }
  }
}

// Published articles should have corresponding HTML pages
for (const a of articles.filter((a) => a.status === 'published')) {
  const expectedPath = path.join(__dirname, `../src/pages/trends/${a.slug}.html`);
  if (!fs.existsSync(expectedPath)) {
    warn(`Published article missing HTML page: src/pages/trends/${a.slug}.html`);
  }
}

// Published pillars should have corresponding HTML pages
for (const p of pillars.filter((p) => p.status === 'published')) {
  const expectedPath = path.join(__dirname, `../src/pages/blueprints/${p.slug}.html`);
  if (!fs.existsSync(expectedPath)) {
    warn(`Published pillar missing HTML page: src/pages/blueprints/${p.slug}.html`);
  }
}

console.log(`\nVerification complete: ${errors} errors, ${warnings} warnings`);
console.log(`Articles: ${articles.length} (${articles.filter(a => a.status === 'published').length} published, ${articles.filter(a => a.status === 'published_soon').length} coming soon)`);
console.log(`Pillars: ${pillars.length} (${pillars.filter(p => p.status === 'published').length} published)`);

if (errors > 0) {
  process.exit(1);
}
