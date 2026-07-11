// node read_keyspring.js
const fs = require('fs');
const path = require('path');

const dir = path.join(process.env.HOME, 'ika', 'examples', 'keyspring');

function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) { walk(full); continue; }
    if (!/\.(ts|js|json)$/.test(f) || f.includes('lock')) continue;
    console.log('\n\n========== ' + full + ' ==========');
    console.log(fs.readFileSync(full, 'utf8'));
  }
}
walk(dir);