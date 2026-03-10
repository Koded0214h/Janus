/**
 * Ika Bridge — based on official docs at docs.ika.xyz
 * 
 * Prerequisites:
 *   npm i express @ika.xyz/sdk @mysten/sui@1.21.1
 *   export AGENT_MNEMONIC="your twelve word mnemonic here"
 *   node ika_bridge.js
 */

const express = require('express');
const {
  IkaClient, IkaTransaction, getNetworkConfig,
  prepareDKGAsync, createRandomSessionIdentifier,
  UserShareEncryptionKeys, Curve,
} = require('@ika.xyz/sdk');
const { SuiClient, getFullnodeUrl } = require('@mysten/sui/client');
const { Transaction } = require('@mysten/sui/transactions');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');

const app = express();
app.use(express.json());

// ── Client setup (exactly as per docs) ───────────────────────────────────────
const network   = 'mainnet';
const suiClient = new SuiClient({ url: getFullnodeUrl(network) });
const ikaClient = new IkaClient({
  suiClient,
  config: getNetworkConfig(network),
  network,
  cache: true,
});

// ── Keypair ───────────────────────────────────────────────────────────────────
let keypair;
try {
  if (process.env.AGENT_MNEMONIC) {
    keypair = Ed25519Keypair.deriveKeypair(process.env.AGENT_MNEMONIC);
  } else if (process.env.AGENT_SECRET_KEY) {
    keypair = Ed25519Keypair.fromSecretKey(Buffer.from(process.env.AGENT_SECRET_KEY, 'base64'));
  } else {
    throw new Error('Set AGENT_MNEMONIC or AGENT_SECRET_KEY');
  }
  console.log('✓ Agent address:', keypair.getPublicKey().toSuiAddress());
} catch (e) {
  console.warn('⚠️  Keypair not loaded:', e.message);
}

// ── Helper: sign + execute ────────────────────────────────────────────────────
async function executeTransaction(tx) {
  const sender = keypair.getPublicKey().toSuiAddress();
  tx.setSender(sender);
  const bytes = await tx.build({ client: suiClient });
  const { signature } = await keypair.signTransaction(bytes);
  return suiClient.executeTransactionBlock({
    transactionBlock: bytes,
    signature,
    options: { showEffects: true, showObjectChanges: true, showEvents: true },
  });
}

// ── POST /create-dwallet ──────────────────────────────────────────────────────
app.post('/create-dwallet', async (req, res) => {
  const curveStr = (req.body?.curve || 'secp256k1').toLowerCase();
  const curve = { secp256k1: Curve.SECP256K1, secp256r1: Curve.SECP256R1, ed25519: Curve.ED25519 }[curveStr];
  if (!curve) return res.status(400).json({ error: `Unknown curve: ${curveStr}` });

  try {
    const signerAddress = keypair.getPublicKey().toSuiAddress();

    // 1. User share encryption keys (deterministic from agent address)
    const userShareEncryptionKeys = await UserShareEncryptionKeys.fromRootSeedKey(
      new TextEncoder().encode(signerAddress),
      curve,
    );

    const transaction = new Transaction();
    const ikaTransaction = new IkaTransaction({ ikaClient, transaction, userShareEncryptionKeys });

    // 2. Register encryption key (safe to call repeatedly)
    console.log('[DKG] Registering encryption key...');
    await ikaTransaction.registerEncryptionKey({ curve });

    // 3. Prepare DKG input locally
    console.log('[DKG] Preparing DKG input...');
    const identifier = createRandomSessionIdentifier();
    const dkgRequestInput = await prepareDKGAsync(
      ikaClient, curve, userShareEncryptionKeys, identifier, signerAddress,
    );

    // 4. Get network encryption key
    const dWalletEncryptionKey = await ikaClient.getLatestNetworkEncryptionKey();

    // 5. Get gas coins
    const suiCoins = await suiClient.getCoins({ owner: signerAddress, coinType: '0x2::sui::SUI' });
    const ikaCoins = await suiClient.getCoins({ owner: signerAddress });
    if (!suiCoins.data.length) throw new Error('No SUI. Fund at https://faucet.sui.io/?address=' + signerAddress);

    const suiCoin = transaction.object(suiCoins.data[0].coinObjectId);
    const ikaCoin = transaction.object(
      (ikaCoins.data.find(c => !c.coinType.includes('sui::SUI')) ?? suiCoins.data[0]).coinObjectId
    );

    // 6. Request DKG
    console.log('[DKG] Requesting dWallet creation...');
    const sessionIdentifier = ikaTransaction.registerSessionIdentifier(identifier);
    const [dWalletCap] = await ikaTransaction.requestDWalletDKG({
      curve,
      dkgRequestInput,
      sessionIdentifier,
      ikaCoin,
      suiCoin,
      dwalletNetworkEncryptionKeyId: dWalletEncryptionKey.id,
    });

    // 7. Transfer cap to agent
    transaction.transferObjects([dWalletCap], signerAddress);

    // 8. Execute
    console.log('[DKG] Executing transaction...');
    const result = await executeTransaction(transaction);
    console.log('[DKG] Digest:', result.digest);

    // 9. Find the dWallet cap object ID from effects
    const capObj = result.objectChanges?.find(c =>
      c.type === 'created' && c.objectType?.includes('DWalletCap')
    );
    if (!capObj) throw new Error('DWalletCap not found in transaction result');

    // 10. Wait for active dWallet
    console.log('[DKG] Waiting for dWallet to become active (~30-60s)...');
    const dWallet = await ikaClient.getDWalletInParticularState(
      capObj.objectId, 'Active', { timeout: 120000, interval: 3000 }
    );

    res.json({
      dWalletId:  dWallet.id,
      publicKey:  dWallet.publicKey,
      curve:      curveStr,
      digest:     result.digest,
    });

  } catch (err) {
    console.error('[DKG] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /address ──────────────────────────────────────────────────────────────
app.get('/address', (_req, res) => {
  if (!keypair) return res.status(503).json({ error: 'Keypair not configured' });
  res.json({ address: keypair.getPublicKey().toSuiAddress() });
});

app.get('/health', (_req, res) => res.json({ status: 'ok', network }));

app.listen(3001, () => console.log('Ika Bridge running on port 3001'));