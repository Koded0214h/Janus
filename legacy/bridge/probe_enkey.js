const { UserShareEncryptionKeys, Curve } = require('@ika.xyz/sdk');

async function main() {
  const seed = new TextEncoder().encode('test-address-0x1234');
  const keys = await UserShareEncryptionKeys.fromRootSeedKey(seed, Curve.SECP256K1);
  
  console.log('Instance keys:', Object.keys(keys));
  console.log('encryptionKey type:', keys.encryptionKey?.constructor?.name, 
    'length:', keys.encryptionKey?.length);

  // Test each method
  for (const m of ['getSigningPublicKeyBytes','getSuiAddress','getEncryptionKeySignature',
                    'toShareEncryptionKeysBytes','getPublicKey','verifySignature']) {
    try {
      const r = await keys[m]?.();
      console.log(`✓ ${m}():`, r?.constructor?.name, r?.length ?? r);
    } catch(e) {
      console.log(`✗ ${m}(): ${e.message.slice(0,60)}`);
    }
  }
}
main().catch(console.error);