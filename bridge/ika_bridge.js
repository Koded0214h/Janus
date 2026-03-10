/**
 * Ika Bridge — ported from the official keyspring example
 * github.com/dwallet-labs/ika/examples/keyspring
 *
 * This bridge handles the SERVER SIDE of dWallet creation.
 * The client (Python/frontend) must compute the DKG locally first,
 * then POST the results here.
 *
 * Setup:
 *   npm i @ika.xyz/sdk@0.2.3 @mysten/sui express
 *   export SUI_ADMIN_SECRET_KEY="<base64 ed25519 key>"
 *   export IKA_COIN_ID="<object ID of an IKA coin you own>"
 *   export SUI_NETWORK="testnet"
 *   node ika_bridge.js
 *
 * Get IKA coin on testnet:
 *   1. Fund with SUI: https://faucet.sui.io
 *   2. Swap SUI->IKA on a testnet DEX, or check Ika faucet
 *   3. Get the coin object ID: sui client objects --json | jq '.[] | select(.data.type | contains("IKA"))'
 */

const express = require('express');
const {
  coordinatorTransactions,
  getNetworkConfig,
  IkaClient,
  IkaTransaction,
  CoordinatorInnerModule,
  SessionsManagerModule,
  Curve,
  Hash,
  SignatureAlgorithm,
} = require('@ika.xyz/sdk');
const { SuiClient } = require('@mysten/sui/client');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const { SerialTransactionExecutor, Transaction } = require('@mysten/sui/transactions');

const app = express();
app.use(express.json({ limit: '10mb' }));

// ── Config ────────────────────────────────────────────────────────────────────
const network = process.env.SUI_NETWORK || 'testnet';
const RPC = network === 'mainnet'
  ? 'https://ikafn-on-sui-2-mainnet.ika-network.net/'
  : 'https://sui-testnet-rpc.publicnode.com';

const IKA_COIN_ID = process.env.IKA_COIN_ID; // optional — falls back to SUI gas coin
if (!process.env.SUI_ADMIN_SECRET_KEY) { console.error('✗ Set SUI_ADMIN_SECRET_KEY env var'); process.exit(1); }

const suiClient   = new SuiClient({ url: RPC });
const ikaConfig   = getNetworkConfig(network);
const ikaClient   = new IkaClient({ suiClient, config: ikaConfig });
const adminKeypair = Ed25519Keypair.fromSecretKey(process.env.SUI_ADMIN_SECRET_KEY);
const executor    = new SerialTransactionExecutor({ client: suiClient, signer: adminKeypair });

console.log(`Network: ${network} | RPC: ${RPC}`);
console.log('✓ Admin address:', adminKeypair.toSuiAddress());

// ── POST /api/dkg/submit ──────────────────────────────────────────────────────
// Accepts pre-computed DKG data from the client and submits it on-chain.
// Body matches keyspring DKGSubmitInput:
// {
//   userPublicOutput: number[],
//   userDkgMessage: number[],
//   encryptedUserShareAndProof: number[],
//   sessionIdentifier: number[],
//   signerPublicKey: number[],
//   encryptionKeyAddress: string,
//   encryptionKey: number[],
//   encryptionKeySignature: number[],
//   curve?: number   (0=secp256k1, 1=secp256r1, 2=ed25519)
// }
app.post('/api/dkg/submit', async (req, res) => {
  const data = req.body;
  const curve = data.curve ?? 0; // default secp256k1
  const adminAddress = adminKeypair.toSuiAddress();

  try {
    // 1. Get latest network encryption key
    const encryptionKey = await ikaClient.getLatestNetworkEncryptionKey();
    console.log('[DKG] Got network encryption key:', encryptionKey.id);

    // 2. Build transaction (mirrors keyspring executeDKGTransaction exactly)
    let tx = new Transaction();
    tx.setSender(adminAddress);
    tx.setGasBudget(1_000_000_000); // 1 SUI

    // Register encryption key
    coordinatorTransactions.registerEncryptionKeyTx(
      ikaConfig,
      tx.object(ikaConfig.objects.ikaDWalletCoordinator.objectID),
      curve,
      new Uint8Array(data.encryptionKey),
      new Uint8Array(data.encryptionKeySignature),
      new Uint8Array(data.signerPublicKey),
      tx,
    );

    // Dry run — if user already has enc key, skip registration
    const dryRun = await suiClient.devInspectTransactionBlock({
      sender: adminAddress,
      transactionBlock: tx,
    });
    if (dryRun.error) {
      console.log('[DKG] Enc key already registered, skipping registration step');
      tx = new Transaction();
      tx.setSender(adminAddress);
      tx.setGasBudget(1_000_000_000);
    }

    // Request DKG
    const [dWalletCap] = coordinatorTransactions.requestDWalletDKG(
      ikaConfig,
      tx.object(ikaConfig.objects.ikaDWalletCoordinator.objectID),
      encryptionKey.id,
      curve,
      new Uint8Array(data.userDkgMessage),
      new Uint8Array(data.encryptedUserShareAndProof),
      data.encryptionKeyAddress,
      new Uint8Array(data.userPublicOutput),
      new Uint8Array(data.signerPublicKey),
      coordinatorTransactions.registerSessionIdentifier(
        ikaConfig,
        tx.object(ikaConfig.objects.ikaDWalletCoordinator.objectID),
        new Uint8Array(data.sessionIdentifier),
        tx,
      ),
      null,
      IKA_COIN_ID ? tx.object(IKA_COIN_ID) : tx.gas,
      tx.gas,
      tx,
    );

    tx.transferObjects([dWalletCap], adminAddress);

    // 3. Execute
    console.log('[DKG] Executing transaction...');
    const result = await executor.executeTransaction(tx);
    console.log('[DKG] Digest:', result.digest);

    // 4. Parse events for dWallet IDs
    const txResult = await suiClient.waitForTransaction({
      digest: result.digest,
      options: { showEvents: true },
    });

    let dWalletCapObjectId = null;
    let dWalletObjectId = null;
    let encryptedUserSecretKeyShareId = null;

    for (const event of txResult.events || []) {
      if (event.type.includes('DWalletSessionEvent')) {
        try {
          const parsed = SessionsManagerModule.DWalletSessionEvent(
            CoordinatorInnerModule.DWalletDKGRequestEvent,
          ).fromBase64(event.bcs);
          dWalletCapObjectId = parsed.event_data.dwallet_cap_id;
          dWalletObjectId    = parsed.event_data.dwallet_id;
          encryptedUserSecretKeyShareId =
            parsed.event_data.user_secret_key_share?.Encrypted
              ?.encrypted_user_secret_key_share_id || null;
        } catch (_) {}
      }
    }

    res.json({
      success: true,
      digest: result.digest,
      dWalletCapObjectId,
      dWalletObjectId,
      encryptedUserSecretKeyShareId,
    });

  } catch (err) {
    console.error('[DKG] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /health ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({
  status: 'ok', network, rpc: RPC,
  adminAddress: adminKeypair.toSuiAddress(),
}));

app.listen(3001, () => console.log('Ika Bridge running on port 3001'));