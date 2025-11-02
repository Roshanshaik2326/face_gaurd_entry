const https = require('https');
const http = require('http');

const urls = [
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/tiny_face_detector_model-weights_manifest.json',
  'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js-models@master/tiny_face_detector_model-weights_manifest.json',
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/tiny_face_detector_model-weights_manifest.json',
  'https://unpkg.com/face-api.js@0.22.2/weights/tiny_face_detector_model-weights_manifest.json'
];

function probe(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, (res) => {
      let size = 0;
      res.on('data', (chunk) => { size += chunk.length; });
      res.on('end', () => {
        resolve({ url, statusCode: res.statusCode, size });
      });
    });
    req.on('error', (err) => {
      resolve({ url, error: err.message });
    });
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ url, error: 'timeout' });
    });
  });
}

(async () => {
  for (const u of urls) {
    process.stdout.write(`Probing ${u} ... `);
    const r = await probe(u);
    if (r.error) {
      console.log(`ERR ${r.error}`);
    } else {
      console.log(`HTTP ${r.statusCode} ${r.size} bytes`);
    }
  }
})();
