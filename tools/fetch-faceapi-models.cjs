const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'models');
const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2'
];

const mirrors = [
  // Try the face-api.js npm package weights (jsDelivr npm) — often available
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/',
  // jsDelivr GH CDN (fallback)
  'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js-models@master/',
  // GitHub raw fallback
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/'
];

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, res => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
      file.on('error', err => reject(err));
    });
    req.on('error', reject);
  });
}

(async () => {
  console.log('Trying to fetch face-api models into', outDir);
  for (const f of files) {
    const dest = path.join(outDir, f);
    let success = false;
    for (const base of mirrors) {
      const url = base + f;
      process.stdout.write(`Downloading ${f} from ${base} ... `);
      try {
        await download(url, dest);
        const stat = fs.statSync(dest);
        if (stat.size > 0) {
          console.log('OK', stat.size, 'bytes');
          success = true;
          break;
        } else {
          console.log('ZERO-BYTES');
        }
      } catch (err) {
        console.log('ERR', err.message);
      }
    }
    if (!success) {
      console.error(`Failed to download ${f} from all mirrors`);
    }
  }
  console.log('Finished fetching. Current files:');
  const list = fs.readdirSync(outDir).map(name => {
    const s = fs.statSync(path.join(outDir, name));
    return { name, size: s.size };
  });
  console.table(list);
})();
