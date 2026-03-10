// node probe_sui.js
// Find the correct way to require SuiClient and construct IkaClient

const sdk = require('@ika.xyz/sdk');
const cfg = sdk.getNetworkConfig('testnet');

// IkaClient constructor says: options.suiClient and options.config (NOT ikaConfig)
// Let's try the correct param name
console.log('=== IkaClient constructor source (first 600 chars) ===');
console.log(sdk.IkaClient.toString().slice(0, 600));

// Try different require paths for SuiClient
const attempts = [
  '@mysten/sui/client',
  '@mysten/sui.js/client', 
  '@mysten/sui',
];

for (const path of attempts) {
  try {
    const mod = require(path);
    console.log(`\n✓ require("${path}") keys:`, Object.keys(mod).slice(0, 10));
    // Try constructing
    const Cls = mod.SuiClient || mod.default?.SuiClient;
    if (Cls) {
      const sc = new Cls({ url: 'https://fullnode.testnet.sui.io:443' });
      console.log('  SuiClient instance ok:', sc.constructor.name);

      // Now try correct IkaClient construction
      const c = new sdk.IkaClient({ suiClient: sc, config: cfg });
      console.log('  IkaClient.client:', c.client?.constructor?.name ?? c.client);
      console.log('  IkaClient.ikaConfig keys:', Object.keys(c.ikaConfig || {}));
      console.log('  ✓✓ CORRECT SETUP FOUND using require("' + path + '")');
    }
  } catch(e) {
    console.log(`✗ "${path}": ${e.message}`);
  }
}

// Also check what's inside @mysten/sui directly
try {
  const sui = require('@mysten/sui');
  console.log('\n=== @mysten/sui top-level keys ===', Object.keys(sui).slice(0, 20));
} catch(e) {
  console.log('Cannot require @mysten/sui:', e.message);
}

// Check if @mysten/sui/dist/cjs/client exists
const paths2 = [
  '@mysten/sui/dist/cjs/client',
  '@mysten/sui/dist/cjs/client/index',
];
for (const p of paths2) {
  try {
    const mod = require(p);
    console.log(`\n✓ require("${p}"):`, Object.keys(mod).slice(0, 5));
  } catch(e) {
    console.log(`✗ "${p}": ${e.message.slice(0,80)}`);
  }
}