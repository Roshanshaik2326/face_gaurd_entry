const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const SRC = path.resolve(__dirname, '..', 'src');
const ARCHIVE = path.resolve(__dirname, '..', 'archive_tsx');

function walk(dir) {
  const files = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      files.push(...walk(full));
    } else if (full.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

async function transformFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  // Use Babel to strip types but keep JSX
  const { code } = await babel.transformAsync(src, {
    filename: path.basename(file),
    presets: [
      ['@babel/preset-react', { runtime: 'automatic', importSource: 'react' }],
      ['@babel/preset-typescript', { allowNamespaces: true }],
    ],
    plugins: [],
    ast: false,
    sourceMaps: false,
    compact: false,
  });

  // Write .jsx file next to source with same name
  const outFile = file.replace(/\.tsx$/, '.jsx');
  fs.writeFileSync(outFile, code, 'utf8');
  console.log('WROTE', outFile);
}

function ensureArchive(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function moveOriginal(file) {
  const rel = path.relative(SRC, file);
  const dest = path.join(ARCHIVE, rel);
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.renameSync(file, dest);
  console.log('MOVED', file, '->', dest);
}

(async function main(){
  ensureArchive(ARCHIVE);
  const files = walk(SRC);
  console.log('Found', files.length, '.tsx files');
  for (const f of files) {
    try {
      await transformFile(f);
    } catch (err) {
      console.error('Failed to transform', f, err);
    }
  }

  // Update imports that reference .tsx to .jsx across the src folder (and index.html)
  const allFiles = fs.readdirSync(SRC, { withFileTypes: true });
  // simple recursive replace across files
  function replaceInFiles(dir) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        replaceInFiles(full);
      } else if (/\.(js|jsx|ts|tsx|html|css)$/.test(full)) {
        let content = fs.readFileSync(full, 'utf8');
        const updated = content.replace(/(\.\/|\/(?:src\/)?)?([\w\-@\/\.]+?)\.tsx(["'`])/g, (m,p1,p2,p3)=>{
          return (p1||'') + p2 + '.jsx' + p3;
        });
        if (updated !== content) {
          fs.writeFileSync(full, updated, 'utf8');
          console.log('Updated imports in', full);
        }
      }
    }
  }

  replaceInFiles(SRC);

  // After successful conversion, move original .tsx files into archive
  for (const f of files) {
    try {
      moveOriginal(f);
    } catch (err) {
      console.error('Failed to move', f, err);
    }
  }

  // Also update index.html in project root if it referenced main.tsx
  const rootIndex = path.resolve(__dirname, '..', 'index.html');
  if (fs.existsSync(rootIndex)) {
    let content = fs.readFileSync(rootIndex, 'utf8');
    const updated = content.replace('/src/main.tsx', '/src/main.jsx');
    if (updated !== content) {
      fs.writeFileSync(rootIndex, updated, 'utf8');
      console.log('Updated index.html to use main.jsx');
    }
  }

  console.log('Conversion complete. Originals moved to archive_tsx/');
})();
