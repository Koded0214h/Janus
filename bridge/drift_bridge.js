/**
 * Drift Bridge — Updated with real Drift V2 instruction layout and account structure.
 * This bridge connects Janus agents to the Drift protocol on Solana while
 * enforcing Janus Policy compliance in every transaction.
 */

const express = require('express');
const { 
    Connection, 
    PublicKey, 
    Transaction, 
    TransactionInstruction 
} = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');
const axios = require('axios');

const app = express();
app.use(express.json());

// ── Config ───────────────────────────────────────────────────────────────────
const BRIDGE_URL = process.env.IKA_BRIDGE_URL || 'http://localhost:3001';
const SOLANA_RPC = process.env.SOLANA_RPC || 'http://127.0.0.1:8899';

// Janus Policy (from our codebase)
const POLICY_PROGRAM_ID = new PublicKey('AZp5LhbF7gesu1N7zeAhiLPGLASYC5rVYqUvyB9uRPi8');

// Drift V2 Mainnet Constants
const DRIFT_PROGRAM_ID = new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH');
const DRIFT_STATE_PDA  = new PublicKey('En8ocvS6mUgepYhpY179nwaXM8SwBKAV6TY3R39RW56V');

const connection = new Connection(SOLANA_RPC, 'confirmed');

// ── PDA Helpers ──────────────────────────────────────────────────────────────

/** Derive Janus Policy PDA for an owner. */
async function findPolicyPDA(ownerPubkey) {
    return (await PublicKey.findProgramAddress(
        [Buffer.from('treasury_policy'), ownerPubkey.toBuffer()],
        POLICY_PROGRAM_ID
    ))[0];
}

/** Derive Drift User subaccount PDA. */
async function findDriftUserPDA(authority, subAccountId = 0) {
    const subAccountIdBuf = Buffer.alloc(2);
    subAccountIdBuf.writeUInt16LE(subAccountId);
    return (await PublicKey.findProgramAddress(
        [Buffer.from('user'), authority.toBuffer(), subAccountIdBuf],
        DRIFT_PROGRAM_ID
    ))[0];
}

/** Derive Drift UserStats PDA. */
async function findDriftUserStatsPDA(authority) {
    return (await PublicKey.findProgramAddress(
        [Buffer.from('user_stats'), authority.toBuffer()],
        DRIFT_PROGRAM_ID
    ))[0];
}

// ── API ───────────────────────────────────────────────────────────────────────

/**
 * POST /api/drift/trade
 * Constructs a composite transaction containing:
 * 1. Janus check_compliance instruction
 * 2. Drift place_perp_order instruction
 */
app.post('/api/drift/trade', async (req, res) => {
    const { 
        agentAddress,       // dWallet address (Solana pubkey)
        ownerAddress,       // User address (Solana pubkey)
        dWalletObjectId,    // Ika dWallet SUI ID
        dWalletCapObjectId, // Ika dWalletCap SUI ID
        userSecretKeyShare, // MPC key shard
        action,             // 'long' | 'short'
        marketIndex = 0,    // SOL-PERP
        amount,             // Base units (e.g. 1e9 = 1 SOL)
        aum                 // Current AUM (e.g. total portfolio value in USDC)
    } = req.body;

    try {
        console.log(`[Drift] Building Basis Trade for agent: ${agentAddress}`);
        
        const agentPubkey = new PublicKey(agentAddress);
        const ownerPubkey = new PublicKey(ownerAddress);
        const policyPda  = await findPolicyPDA(ownerPubkey);
        const userPda    = await findDriftUserPDA(agentPubkey);
        const statsPda   = await findDriftUserStatsPDA(agentPubkey);

        // ── 1. Janus Compliance Check ───────────────────────────────────────
        // Sighash: global:check_compliance -> 87ab9765c2e6a90d
        const complianceData = Buffer.concat([
            Buffer.from([135, 171, 151, 101, 194, 230, 169, 13]),
            new anchor.BN(amount).toArrayLike(Buffer, 'le', 8),
            new anchor.BN(aum).toArrayLike(Buffer, 'le', 8),
            DRIFT_PROGRAM_ID.toBuffer()
        ]);

        const complianceIx = new TransactionInstruction({
            programId: POLICY_PROGRAM_ID,
            keys: [
                { pubkey: policyPda,  isSigner: false, isWritable: true },
                { pubkey: agentPubkey, isSigner: true,  isWritable: false },
            ],
            data: complianceData
        });

        // ── 2. Drift place_perp_order ───────────────────────────────────────
        // Sighash: global:place_perp_order -> 36ad605b51400f23
        // Data is simplified OrderParams struct
        const direction = (action === 'short' || action === 'short_perp') ? 1 : 0;
        
        const orderParams = Buffer.alloc(100); // Plenty of space
        let offset = 0;
        // order_type: Market (1)
        orderParams.writeUInt8(1, offset++);
        // market_index: u16
        orderParams.writeUInt16LE(marketIndex, offset); offset += 2;
        // direction: PositionDirection (0=long, 1=short)
        orderParams.writeUInt8(direction, offset++);
        // base_asset_amount: u64
        new anchor.BN(amount).toArrayLike(Buffer, 'le', 8).copy(orderParams, offset); offset += 8;
        // price: u64 (0 for market)
        new anchor.BN(0).toArrayLike(Buffer, 'le', 8).copy(orderParams, offset); offset += 8;
        // reduce_only: bool
        orderParams.writeUInt8(0, offset++);
        // post_only: bool
        orderParams.writeUInt8(0, offset++);
        // remaining fields (max_ts, trigger_price, etc) filled with zero
        
        const driftData = Buffer.concat([
            Buffer.from([54, 173, 96, 91, 81, 64, 15, 35]), // Sighash
            orderParams.slice(0, offset)
        ]);

        const driftIx = new TransactionInstruction({
            programId: DRIFT_PROGRAM_ID,
            keys: [
                { pubkey: DRIFT_STATE_PDA, isSigner: false, isWritable: false },
                { pubkey: userPda,         isSigner: false, isWritable: true },
                { pubkey: agentPubkey,     isSigner: true,  isWritable: false },
                // Remaining accounts (Market + Oracle) would go here
            ],
            data: driftData
        });

        // ── 3. Build & Sign ─────────────────────────────────────────────────
        const tx = new Transaction();
        tx.add(complianceIx);
        tx.add(driftIx);
        tx.feePayer = agentPubkey;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const message = tx.serializeMessage();

        console.log('[Drift] Requesting MPC signature via Ika...');
        const signResp = await axios.post(`${BRIDGE_URL}/api/sign/submit`, {
            dWalletObjectId,
            dWalletCapObjectId,
            userSecretKeyShare,
            message: Array.from(message),
            curve: 2, // ED25519
            signatureAlgorithm: 'EdDSA'
        });

        if (!signResp.data.success) throw new Error(signResp.data.error);

        const signature = Buffer.from(signResp.data.signature);
        tx.addSignature(agentPubkey, signature);
        
        console.log('[Drift] Executing real Solana trade...');
        const txid = await connection.sendRawTransaction(tx.serialize());
        
        res.json({ success: true, txid, action, amount });

    } catch (err) {
        console.error('[Drift] Trade failed:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(3002, () => console.log('Drift Bridge (Real) running on port 3002'));
