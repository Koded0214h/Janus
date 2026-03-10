// node probe_source.js
const fs = require('fs');
const path = require('path');

const clientFile = path.join(
  __dirname, 'node_modules/@ika.xyz/sdk/dist/cjs/client/ika-client.js'
);

if (!fs.existsSync(clientFile)) {
  // try alternate path
  const files = require('glob').sync('**/ika-client.js', { cwd: path.join(__dirname, 'node_modules/@ika.xyz/sdk') });
  console.log('Found files:', files);
  process.exit();
}

const src = fs.readFileSync(clientFile, 'utf8');
const lines = src.split('\n');

// Print lines around fetchObjectsFromNetwork (line 735 +/- 20)
console.log('=== Lines 715-755 (fetchObjectsFromNetwork) ===');
lines.slice(714, 755).forEach((l, i) => console.log(`${715+i}: ${l}`));

// Find all calls to suiClient / this.client methods
console.log('\n=== All this.client.X() calls ===');
lines.forEach((l, i) => {
  if (/this\.client\.[a-zA-Z]+\(/.test(l)) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});