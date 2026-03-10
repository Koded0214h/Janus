// node probe_init.js
const sdk = require('@ika.xyz/sdk');
const { CoreClient } = require('@mysten/sui/client');

const cfg = sdk.getNetworkConfig('testnet');
const suiClient = new CoreClient({ url: 'https://fullnode.testnet.sui.io:443', network: 'testnet' });
const ikaClient = new sdk.IkaClient({ suiClient, config: cfg });

async function main() {
  // 1. Can we reach Sui testnet RPC at all?
  console.log('=== 1. Raw RPC connectivity ===');
  try {
    const epoch = await suiClient.getLatestSuiSystemState();
    console.log('✓ Sui RPC reachable, epoch:', epoch?.epoch);
  } catch(e) {
    console.log('✗ Sui RPC failed:', e.message);
  }

  // 2. Can we fetch the known on-chain objects directly?
  console.log('\n=== 2. Fetching known config objects ===');
  const objectIds = [
    cfg.objects.ikaSystemObject.objectID,
    cfg.objects.ikaDWalletCoordinator.objectID,
  ];
  for (const id of objectIds) {
    try {
      const obj = await suiClient.getObject({ id, options: { showContent: true } });
      console.log(`✓ ${id.slice(0,10)}... type: ${obj?.data?.type ?? 'unknown'}`);
    } catch(e) {
      console.log(`✗ ${id.slice(0,10)}...: ${e.message}`);
    }
  }

  // 3. Try multiGetObjects (what initialize likely calls internally)
  console.log('\n=== 3. multiGetObjects ===');
  try {
    const results = await suiClient.multiGetObjects({
      ids: objectIds,
      options: { showContent: true, showBcs: true },
    });
    console.log('✓ multiGetObjects returned', results.length, 'results');
    results.forEach((r, i) => {
      console.log(`  [${i}] error: ${r.error?.code ?? 'none'}, type: ${r.data?.type ?? 'N/A'}`);
    });
  } catch(e) {
    console.log('✗ multiGetObjects failed:', e.message);
  }

  // 4. Try alternate RPC endpoints
  console.log('\n=== 4. Trying alternate testnet RPC endpoints ===');
  const urls = [
    'https://fullnode.testnet.sui.io:443',
    'https://sui-testnet-endpoint.blockvision.org',
    'https://testnet.suichain.io',
    'https://rpc-testnet.suiscan.xyz',
  ];
  for (const url of urls) {
    try {
      const c = new CoreClient({ url, network: 'testnet' });
      const state = await Promise.race([
        c.getLatestSuiSystemState(),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
      ]);
      console.log(`✓ ${url} — epoch ${state?.epoch}`);
    } catch(e) {
      console.log(`✗ ${url}: ${e.message}`);
    }
  }
}

main().catch(console.error);