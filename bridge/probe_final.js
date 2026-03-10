// node probe_final.js
const { IkaClient, getNetworkConfig } = require('@ika.xyz/sdk');
const { SuiJsonRpcClient } = require('@mysten/sui/jsonRpc');

const suiClient = new SuiJsonRpcClient({ url: 'https://fullnode.testnet.sui.io:443' });
const ikaClient = new IkaClient({ suiClient, config: getNetworkConfig('testnet') });

// Patch to see exactly what's failing
const orig = suiClient.multiGetObjects?.bind(suiClient) 
          || suiClient.getObjects?.bind(suiClient);

async function main() {
  // Test raw RPC call
  console.log('Testing raw RPC...');
  try {
    const r = await suiClient.call('suix_getLatestSuiSystemState', []);
    console.log('✓ raw RPC works, epoch:', r?.epoch);
  } catch(e) {
    console.log('✗ raw RPC:', e.message);
  }

  // Test getObject
  try {
    const r = await suiClient.call('sui_getObject', [
      '0x2172c6483ccd24930834e30102e33548b201d0607fb1fdc336ba3267d910dec6',
      { showContent: false }
    ]);
    console.log('✓ getObject works:', r?.data?.objectId);
  } catch(e) {
    console.log('✗ getObject:', e.message);
  }

  // Test multiGetObjects
  try {
    const r = await suiClient.call('sui_multiGetObjects', [
      ['0x2172c6483ccd24930834e30102e33548b201d0607fb1fdc336ba3267d910dec6'],
      { showContent: false }
    ]);
    console.log('✓ multiGetObjects works:', Array.isArray(r));
  } catch(e) {
    console.log('✗ multiGetObjects:', e.message);
  }

  // Now try initialize with full stack trace
  try {
    await ikaClient.initialize();
    console.log('✓ initialize() worked!');
  } catch(e) {
    console.log('✗ initialize() failed:', e.message);
    console.log(e.stack);
  }

  // Log what methods suiClient actually has
  console.log('\nsuiClient methods:', 
    Object.getOwnPropertyNames(Object.getPrototypeOf(suiClient))
      .filter(k => k !== 'constructor')
  );
}

main();