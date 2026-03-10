// node probe_source2.js
const fs = require('fs');
const path = require('path');

const clientFile = path.join(
  __dirname, 'node_modules/@ika.xyz/sdk/dist/cjs/client/ika-client.js'
);
const src = fs.readFileSync(clientFile, 'utf8');
const lines = src.split('\n');

// Find fetchObjectsFromNetwork_fn start
const startLine = lines.findIndex(l => l.includes('fetchObjectsFromNetwork_fn'));
console.log(`=== fetchObjectsFromNetwork_fn starts at line ${startLine+1} ===`);
lines.slice(startLine, startLine + 80).forEach((l, i) => console.log(`${startLine+1+i}: ${l}`));

// Also find this.client. usage anywhere
console.log('\n=== All this.client. usages ===');
lines.forEach((l, i) => {
  if (l.includes('this.client.')) {
    console.log(`${i+1}: ${l.trim().slice(0, 120)}`);
  }
});