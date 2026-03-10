const { IkaClient, getNetworkConfig, Curve } = require('@ika.xyz/sdk');
const { SuiClient } = require('@mysten/sui/client');
const fs = require('fs');

async function main() {
  const configPath = process.env.IKA_CONFIG_PATH || `${process.env.HOME}/ika/ika_config.json`;
  const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  console.log('Loaded config from:', configPath);

  // Build the config object the IkaClient expects
  const config = {
    ikaPackage: raw.packages.ika_package_id,
    ikaCommonPackage: raw.packages.ika_common_package_id,
    ikaDWallet2PCMPCPackage: raw.packages.ika_dwallet_2pc_mpc_package_id,
    ikaSystemPackage: raw.packages.ika_system_package_id,
    ikaSystemObject: { objectID: raw.objects.ika_system_object_id },
    ikaDWalletCoordinator: { objectID: raw.objects.ika_dwallet_coordinator_object_id },
    networkEncryptionKeyObjectId: '0x41e36f75f1d8dc63a27274cfde8b735ddb9d1e4b05464d785722d87bdfeae2a7',
  };

  const suiClient = new SuiClient({ url: 'http://127.0.0.1:9000' });
  const ikaClient = new IkaClient({ suiClient, config });

  console.log('\nTrying getLatestNetworkEncryptionKey (SECP256K1)...');
  try {
    const key = await ikaClient.getLatestNetworkEncryptionKey(undefined, Curve.SECP256K1);
    console.log('✓ Got encryption key:', key);
  } catch (e) {
    console.log('✗', e.message);
  }

  console.log('\nTrying getProtocolPublicParameters (SECP256K1)...');
  try {
    const params = await ikaClient.getProtocolPublicParameters(undefined, Curve.SECP256K1);
    console.log('✓ Got params, length:', params?.length);
  } catch (e) {
    console.log('✗', e.message);
  }
}

main().catch(console.error);