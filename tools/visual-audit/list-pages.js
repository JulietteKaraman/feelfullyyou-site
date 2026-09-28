/*
 * list-pages.js — builds the master list of live page URLs by reading each
 * HTML file's OWN <link rel="canonical"> tag, across the whole site: repo
 * root, essays/, podcast/, questions/. This is self-maintaining on purpose —
 * a new page with a canonical tag is picked up automatically, nothing to
 * hand-update when Juliette or a session adds pages.
 *
 * Usage:
 *   node list-pages.js                 → prints every canonical URL, one per line
 *   node list-pages.js --changed <sha> → prints canonical URLs only for .html
 *                                        files that changed since <sha> (git diff)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..', '..');
const DIRS = ['.', 'essays', 'podcast', 'questions'];

function canonicalOf(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const m = html.match(/rel="canonical"\s+href="([^"]+)"/) || html.match(/href="([^"]+)"\s+rel="canonical"/);
  return m ? m[1] : null;
}

function allHtmlFiles() {
  const files = [];
  for (const d of DIRS) {
    const dirPath = path.join(REPO_ROOT, d);
    if (!fs.existsSync(dirPath)) continue;
    for (const f of fs.readdirSync(dirPath)) {
      if (f.endsWith('.html')) files.push(path.join(dirPath, f));
    }
  }
  return files;
}

function changedHtmlFiles(sinceSha) {
  const out = execSync(`git diff --name-only ${sinceSha} HEAD -- '*.html'`, { cwd: REPO_ROOT, encoding: 'utf8' });
  return out.split('\n').map(s => s.trim()).filter(Boolean)
    .map(rel => path.join(REPO_ROOT, rel))
    .filter(p => fs.existsSync(p));
}

function main() {
  const args = process.argv.slice(2);
  let files;
  if (args[0] === '--changed') {
    if (!args[1]) { console.error('Usage: node list-pages.js --changed <git-sha>'); process.exit(1); }
    try {
      files = changedHtmlFiles(args[1]);
    } catch (e) {
      console.error(`git diff failed (bad/missing SHA?): ${e.message}`);
      process.exit(1);
    }
  } else {
    files = allHtmlFiles();
  }

  const urls = [];
  for (const f of files) {
    const url = canonicalOf(f);
    if (url) urls.push(url);
  }
  urls.forEach(u => console.log(u));
}

main();
