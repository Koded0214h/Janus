// node probe_coreclient2.js
const { CoreClient, BaseClient } = require('@mysten/sui/client');

const c = new CoreClient({ url: 'https://fullnode.testnet.sui.io:443', network: 'testnet' });

// Dump all methods on CoreClient
console.log('=== CoreClient prototype methods ===');
const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(c)).filter(k => k !== 'constructor');
console.log(proto);

console.log('\n=== BaseClient prototype methods ===');
const bproto = Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(c))).filter(k => k !== 'constructor');
console.log(bproto);

// Try to call something that fetches objects
async function main() {
  // Try generic request/call method
  const requestMethods = proto.concat(bproto).filter(k =>
    k.toLowerCase().includes('request') ||
    k.toLowerCase().includes('call') ||
    k.toLowerCase().includes('fetch') ||
    k.toLowerCase().includes('send') ||
    k.toLowerCase().includes('get') ||
    k.toLowerCase().includes('execute')
  );
  console.log('\n=== Candidate methods ===', requestMethods);

  // Try sui_getObject via whatever call mechanism exists
  for (const method of requestMethods.slice(0, 5)) {
    try {
      const result = await c[method]('sui_getObject', {
        objectId: '0x2172c6483ccd24930834e30102e33548b201d0607fb1fdc336ba3267d910dec6',
        options: { showContent: true }
      });
      console.log(`\n✓ ${method}() worked:`, JSON.stringify(result).slice(0, 100));
    } catch(e) {
      console.log(`✗ ${method}(): ${e.message.slice(0, 80)}`);
    }
  }

  // Also check what @mysten/sui/client actually exports fully
  const mod = require('@mysten/sui/client');
  console.log('\n=== Full @mysten/sui/client exports ===');
  console.log(Object.keys(mod));
}

main().catch(console.error);