/**
 * Ika Bridge - Node.js Express server
 *
 * Based on official Ika docs: https://docs.ika.xyz/sdk/ika-transaction/zero-trust-dwallet
 *
 * Setup:
 *   npm i express @ika.xyz/sdk @mysten/sui
 *
 *   export AGENT_MNEMONIC="word1 word2 ... word12"   # or use AGENT_SECRET_KEY below
 *   node ika_bridge.js
 */

const express = require('express');
const {
  IkaClient,
  IkaTransaction,
  getNetworkConfig,
  prepareDKGAsync,
  createRandomSessionIdentifier,
  UserShareEncryptionKeys,
  Curve,
} = require('@ika.xyz/sdk');
// @mysten/sui 2.x removed SuiClient/getFullnodeUrl from /client — use /jsonRpc instead
const { SuiJsonRpcClient: SuiClient } = require('@mysten/sui/jsonRpc');
const { Transaction } = require('@mysten/sui/transactions');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');

const TESTNET_RPC = 'https://fullnode.testnet.sui.io:443';

const app = express();
app.use(express.json());

// ─── Setup ────────────────────────────────────────────────────────────────────
const network   = 'testnet';
const suiClient = new SuiClient({ url: TESTNET_RPC });

// IkaClient internally calls suiClient.getObjects() but SuiJsonRpcClient only
// exposes multiGetObjects() — patch it as an alias so initialize() works.
if (!suiClient.getObjects) {
  suiClient.getObjects = (params) => suiClient.multiGetObjects(params);
}

const ikaClient = new IkaClient({
  suiClient,
  config: getNetworkConfig(network),
});

// Keypair: set one of these env vars
//   AGENT_SECRET_KEY  = base64-encoded 32-byte Ed25519 private key
//   AGENT_MNEMONIC    = 12/24 word BIP39 mnemonic
let keypair;
try {
  if (process.env.AGENT_SECRET_KEY) {
    keypair = Ed25519Keypair.fromSecretKey(
      Buffer.from(process.env.AGENT_SECRET_KEY, 'base64')
    );
  } else if (process.env.AGENT_MNEMONIC) {
    keypair = Ed25519Keypair.deriveKeypair(process.env.AGENT_MNEMONIC);
  } else {
    throw new Error('Set AGENT_SECRET_KEY or AGENT_MNEMONIC env var');
  }
  console.log('✓ Agent address:', keypair.getPublicKey().toSuiAddress());
} catch (e) {
  console.warn('⚠️  Keypair not loaded:', e.message);
}

// ─── Helper: execute a signed transaction ────────────────────────────────────
async function executeTransaction(tx) {
  if (!keypair) throw new Error('Keypair not configured — set AGENT_SECRET_KEY or AGENT_MNEMONIC');
  const address = keypair.getPublicKey().toSuiAddress();
  tx.setSender(address);
  const bytes = await tx.build({ client: suiClient });
  const { signature } = await keypair.signTransaction(bytes);
  return suiClient.executeTransactionBlock({
    transactionBlock: bytes,
    signature,
    options: { showEffects: true, showObjectChanges: true, showEvents: true },
  });
}

// ─── Helper: get an IKA coin and a SUI coin for gas ──────────────────────────
async function getCoins(address) {
  const [suiCoins, ikaCoins] = await Promise.all([
    suiClient.getCoins({ owner: address, coinType: '0x2::sui::SUI' }),
    suiClient.getCoins({ owner: address }),  // IKA is the default gas coin on Ika
  ]);

  if (!suiCoins.data.length) throw new Error('No SUI coins found. Fund your address first: https://faucet.sui.io');
  // IKA coins - find non-SUI coin (IKA token)
  const ikaCoinObj = ikaCoins.data.find(c => !c.coinType.includes('sui::SUI'));

  return {
    suiCoinId: suiCoins.data[0].coinObjectId,
    ikaCoinId: ikaCoinObj?.coinObjectId ?? null,
  };
}

// ─── POST /create-dwallet ─────────────────────────────────────────────────────
// Creates a zero-trust dWallet via the full DKG ceremony.
// Body (optional): { curve: "secp256k1" | "secp256r1" | "ed25519" }
// Returns: { dWalletId, publicKey, curve }
app.post('/create-dwallet', async (req, res) => {
  const curveStr = (req.body?.curve || 'secp256k1').toLowerCase();
  const curveMap = {
    secp256k1: Curve.SECP256K1,
    secp256r1: Curve.SECP256R1,
    ed25519:   Curve.ED25519,
  };
  const curve = curveMap[curveStr];
  if (!curve) return res.status(400).json({ error: `Unknown curve: ${curveStr}. Use secp256k1, secp256r1, or ed25519` });

  try {
    await ikaClient.initialize();
    const signerAddress = keypair.getPublicKey().toSuiAddress();

    // 1. Derive user share encryption keys from a deterministic seed
    //    In production, use a stable per-agent seed stored securely
    const seed = process.env.AGENT_SEED || signerAddress;
    const userShareEncryptionKeys = await UserShareEncryptionKeys.fromRootSeedKey(
      new TextEncoder().encode(seed),
      curve,
    );

    // 2. Build transaction
    const transaction = new Transaction();
    const ikaTx = new IkaTransaction({ ikaClient, transaction, userShareEncryptionKeys });

    // 3. Register encryption key (idempotent — safe to call each time)
    console.log('[DKG] Registering encryption key...');
    await ikaTx.registerEncryptionKey({ curve });

    // 4. Prepare DKG input (local async crypto)
    console.log('[DKG] Preparing DKG input...');
    const identifier    = createRandomSessionIdentifier();
    const dkgRequestInput = await prepareDKGAsync(
      ikaClient,
      curve,
      userShareEncryptionKeys,
      identifier,
      signerAddress,
    );

    // 5. Get the latest network encryption key
    const dWalletEncryptionKey = await ikaClient.getLatestNetworkEncryptionKey();

    // 6. Get coins for gas
    const { suiCoinId, ikaCoinId } = await getCoins(signerAddress);
    const suiCoin = transaction.object(suiCoinId);
    const ikaCoin = ikaCoinId ? transaction.object(ikaCoinId) : suiCoin; // fallback

    // 7. Request DKG — single call, network handles the rest
    console.log('[DKG] Requesting dWallet DKG...');
    const [dWalletCap] = await ikaTx.requestDWalletDKG({
      curve,
      dkgRequestInput,
      sessionIdentifier: ikaTx.registerSessionIdentifier(identifier),
      ikaCoin,
      suiCoin,
      dwalletNetworkEncryptionKeyId: dWalletEncryptionKey.id,
    });

    // 8. Transfer the dWalletCap to the agent's address
    transaction.transferObjects([dWalletCap], signerAddress);

    // 9. Execute
    console.log('[DKG] Executing transaction...');
    const result = await executeTransaction(transaction);
    console.log('[DKG] Tx digest:', result.digest);

    // 10. Poll for active dWallet
    console.log('[DKG] Polling for active dWallet (this takes ~30-60s)...');
    let dWallet = null;
    const deadline = Date.now() + 120_000;
    while (Date.now() < deadline) {
      try {
        const caps = await ikaClient.getOwnedDWalletCaps(signerAddress);
        if (caps.dWalletCaps?.length) {
          const cap = caps.dWalletCaps[caps.dWalletCaps.length - 1]; // most recent
          dWallet = await ikaClient.getDWalletInParticularState(cap.dWalletId, 'Active');
          if (dWallet) { console.log('[DKG] dWallet active ✓'); break; }
        }
      } catch (_) {}
      await new Promise(r => setTimeout(r, 4000));
    }

    if (!dWallet) throw new Error('dWallet did not become active within 2 minutes');

    res.json({
      dWalletId: dWallet.id,
      publicKey: dWallet.publicKey,
      curve:     curveStr,
      digest:    result.digest,
    });

  } catch (err) {
    console.error('[DKG] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /address ─────────────────────────────────────────────────────────────
app.get('/address', (_req, res) => {
  if (!keypair) return res.status(503).json({ error: 'Keypair not configured' });
  res.json({ address: keypair.getPublicKey().toSuiAddress() });
});

// ─── GET /health ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', network }));

app.listen(3001, () => console.log('Ika Bridge running on port 3001'));