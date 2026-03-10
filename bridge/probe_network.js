// node probe_network.js
const sdk = require('@ika.xyz/sdk');

const cfg = sdk.getNetworkConfig('testnet');
console.log('\n=== getNetworkConfig("testnet") ===');
console.log(JSON.stringify(cfg, null, 2));

console.log('\n=== Keys ===', Object.keys(cfg));

// Try instantiating with explicit suiRpcUrl if present
const { IkaClient } = sdk;

// Check if IkaClient constructor accepts different shapes
console.log('\n=== IkaClient constructor source (first 300 chars) ===');
console.log(IkaClient.toString().slice(0, 300));

// Try to see what client property looks like after construction
try {
  const c1 = new IkaClient({ ikaConfig: cfg });
  console.log('\n=== c1.client ===', c1.client);
  console.log('=== c1.ikaConfig keys ===', Object.keys(c1.ikaConfig || {}));
} catch(e) {
  console.log('c1 error:', e.message);
}

// Maybe it needs a SuiClient passed in
try {
  const { SuiClient } = require('@mysten/sui/client');
  const suiClient = new SuiClient({ url: cfg.suiRpcUrl || cfg.rpcUrl || 'https://fullnode.testnet.sui.io:443' });
  console.log('\n=== SuiClient created ok, url used:', cfg.suiRpcUrl || cfg.rpcUrl || 'hardcoded');
  const c2 = new IkaClient({ ikaConfig: cfg, suiClient });
  console.log('=== c2.client ===', c2.client?.constructor?.name);
} catch(e) {
  console.log('c2 error:', e.message);
}

// Check what URLs are in the config
console.log('\n=== All string values in config (URLs etc) ===');
function findStrings(obj, prefix='') {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') console.log(`  ${prefix}${k}: ${v}`);
    else if (typeof v === 'object') findStrings(v, `${prefix}${k}.`);
  }
}
findStrings(cfg);