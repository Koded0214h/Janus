// Direct approach - bypass IkaClient config issues entirely
// Query the encryption key object directly from chain

const { SuiClient } = require('@mysten/sui/client');
const { IkaClient, Curve } = require('@ika.xyz/sdk');
const fs = require('fs');

const NETWORK_ENC_KEY_ID = '0x41e36f75f1d8dc63a27274cfde8b735ddb9d1e4b05464d785722d87bdfeae2a7';
const raw = JSON.parse(fs.readFileSync(process.env.HOME + '/ika/ika_config.json'));
const suiClient = new SuiClient({ url: 'http://127.0.0.1:9000' });

async function main() {
  // 1. Fetch the encryption key object directly
  console.log('Fetching encryption key object directly...');
  const keyObj = await suiClient.getObject({ 
    id: NETWORK_ENC_KEY_ID, 
    options: { showContent: true, showType: true } 
  });
  console.log('Key object type:', keyObj.data?.type);
  console.log('Key fields:', JSON.stringify(keyObj.data?.content?.fields, null, 2).slice(0, 500));

  // 2. Try IkaClient with ALL possible config fields
  console.log('\nTrying IkaClient with full config...');
  const config = {
    ikaPackage:             raw.packages.ika_package_id,
    ikaCommonPackage:       raw.packages.ika_common_package_id,
    ikaDWallet2PCMPCPackage: raw.packages.ika_dwallet_2pc_mpc_package_id,
    ikaSystemPackage:       raw.packages.ika_system_package_id,
    ikaSystemObject:        { objectID: raw.objects.ika_system_object_id },
    ikaDWalletCoordinator:  { objectID: raw.objects.ika_dwallet_coordinator_object_id },
    // Try every possible field name for the encryption key
    networkEncryptionKeyObjectId: NETWORK_ENC_KEY_ID,
    encryptionKeyObjectId:        NETWORK_ENC_KEY_ID,
    dwalletNetworkEncryptionKeyId: NETWORK_ENC_KEY_ID,
    networkEncryptionKey:         { objectID: NETWORK_ENC_KEY_ID },
  };

  const ikaClient = new IkaClient({ suiClient, config });

  try {
    const key = await ikaClient.getLatestNetworkEncryptionKey(undefined, Curve.SECP256K1);
    console.log('✓ Got key via IkaClient!', key);
  } catch(e) {
    console.log('✗ IkaClient still fails:', e.message);
    
    // 3. Check what getDynamicFields returns for coordinator inner object
    console.log('\nChecking coordinator inner dynamic fields...');
    const inner = await suiClient.getDynamicFields({ 
      parentId: '0x6129f71006e1df4261ea7841b3d7a0e05c1ffca4591e36f1eed29bed1ba2df3b'
    });
    console.log('Inner fields:', JSON.stringify(inner.data.map(f => ({name: f.name, type: f.objectType})), null, 2));
  }
}

main().catch(console.error);