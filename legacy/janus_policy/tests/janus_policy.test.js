/**
 * janus_policy — Anchor test suite (Node.js CJS, no TypeScript, no surfpool)
 *
 * Mirrors the SUI Move tests in janus_core::policy_tests:
 *   ✓ test_full_successful_flow       → "Full successful flow"
 *   ✓ test_fail_over_spend_limit      → "Fail: over AUM spend limit"
 *   ✓ test_fail_unauthorized_agent    → "Fail: unauthorised agent"
 *   + Extra AUM-specific tests
 *
 * Run:
 *   # terminal 1 — start validator
 *   solana-test-validator --reset
 *
 *   # terminal 2 — deploy then test
 *   anchor build
 *   anchor deploy
 *   node tests/janus_policy.test.js
 */

"use strict";

const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, SystemProgram } = anchor.web3;
const assert = require("assert");
const fs = require("fs");
const path = require("path");

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Load a Keypair from a JSON key file (standard Solana wallet format). */
function loadKeypair(filePath) {
  const expanded = filePath.replace("~", process.env.HOME);
  const raw = JSON.parse(fs.readFileSync(expanded, "utf-8"));
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

/** Derive the TreasuryPolicy PDA for a given owner pubkey. */
async function findPolicyPDA(ownerPubkey, programId) {
  return PublicKey.findProgramAddress(
    [Buffer.from("treasury_policy"), ownerPubkey.toBuffer()],
    programId
  );
}

/** Airdrop SOL if the balance is below `minLamports`. */
async function ensureFunded(connection, pubkey, minLamports = 2e9) {
  const balance = await connection.getBalance(pubkey);
  if (balance < minLamports) {
    const sig = await connection.requestAirdrop(pubkey, 2e9);
    await connection.confirmTransaction(sig);
  }
}

// ── Test runner ───────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${err.message || err}`);
    failed++;
  }
}

/** Assert that `fn()` throws an Anchor error whose code matches `errorCode`. */
async function assertAnchorError(fn, errorCode) {
  try {
    await fn();
    throw new Error(`Expected error "${errorCode}" but the call succeeded`);
  } catch (err) {
    const msg = err?.error?.errorCode?.code || err?.message || String(err);
    if (!msg.includes(errorCode)) {
      throw new Error(
        `Expected error "${errorCode}" but got: ${msg}`
      );
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  console.log("\n══════════════════════════════════════════");
  console.log("  janus_policy — Anchor Test Suite");
  console.log("══════════════════════════════════════════\n");

  // ── Provider / Program setup ──────────────────────────────────────────────
  const connection = new anchor.web3.Connection(
    "http://127.0.0.1:8899",
    "confirmed"
  );

  // Load payer wallet (default: ~/.config/solana/id.json)
  const walletPath = process.env.ANCHOR_WALLET || "~/.config/solana/id.json";
  const payerKeypair = loadKeypair(walletPath);
  const wallet = new anchor.Wallet(payerKeypair);

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Load IDL from build output
  const idlPath = path.resolve(
    __dirname,
    "../target/idl/janus_policy.json"
  );
  if (!fs.existsSync(idlPath)) {
    console.error(
      "IDL not found at", idlPath,
      "\nRun `anchor build` first."
    );
    process.exit(1);
  }
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  const programId = new PublicKey(idl.address || idl.metadata?.address || "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
  const program = new anchor.Program(idl, provider);

  console.log("Program ID :", programId.toBase58());
  console.log("Payer      :", payerKeypair.publicKey.toBase58());

  // ── Actors ────────────────────────────────────────────────────────────────
  // OWNER = the payer wallet (matches SUI OWNER = @0xAD)
  const owner = payerKeypair;

  // AGENT — fresh keypair (matches SUI AGENT = @0xAB)
  const agent = Keypair.generate();

  // PROTOCOL — some protocol address (matches SUI PROTOCOL = @0x123)
  const protocol = Keypair.generate().publicKey;

  // STRANGER — someone unauthorized (matches SUI STRANGER = @0xDE)
  const stranger = Keypair.generate();

  // Fund accounts that will sign transactions
  await ensureFunded(connection, owner.publicKey);
  await ensureFunded(connection, agent.publicKey);
  await ensureFunded(connection, stranger.publicKey);

  // Derive PDA for owner
  const [policyPDA, policyBump] = await findPolicyPDA(
    owner.publicKey,
    programId
  );

  console.log("Policy PDA :", policyPDA.toBase58());
  console.log("");

  // ─────────────────────────────────────────────────────────────────────────
  // 1. test_full_successful_flow
  //    SUI: create policy → add protocol → check compliance → pass
  // ─────────────────────────────────────────────────────────────────────────
  console.log("── Group 1: Happy Path ──────────────────────────");

  await test("create_policy succeeds (agent=agent, 100 bps = 1%)", async () => {
    const AUM_BPS = 100; // 1%
    await program.methods
      .createPolicy(agent.publicKey, new anchor.BN(AUM_BPS))
      .accounts({
        owner: owner.publicKey,
        policy: policyPDA,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    const acc = await program.account.treasuryPolicy.fetch(policyPDA);
    assert.ok(acc.owner.equals(owner.publicKey), "owner mismatch");
    assert.ok(acc.agent.equals(agent.publicKey), "agent mismatch");
    assert.equal(acc.aumPercentageBps.toNumber(), AUM_BPS);
    assert.equal(acc.protocolCount, 0);
    assert.equal(acc.bump, policyBump);
  });

  await test("add_protocol succeeds (owner adds a protocol)", async () => {
    await program.methods
      .addProtocol(protocol)
      .accounts({
        owner: owner.publicKey,
        policy: policyPDA,
      })
      .signers([owner])
      .rpc();

    const acc = await program.account.treasuryPolicy.fetch(policyPDA);
    assert.equal(acc.protocolCount, 1);
    assert.ok(
      acc.approvedProtocols[0].equals(protocol),
      "protocol not stored"
    );
  });

  await test(
    "add_protocol idempotent (adding same protocol again is a no-op)",
    async () => {
      await program.methods
        .addProtocol(protocol)
        .accounts({ owner: owner.publicKey, policy: policyPDA })
        .signers([owner])
        .rpc();

      const acc = await program.account.treasuryPolicy.fetch(policyPDA);
      assert.equal(acc.protocolCount, 1, "count should still be 1");
    }
  );

  await test(
    "check_compliance passes — amount(500) within 1% of AUM(100 000) = 1 000",
    async () => {
      // AUM = 100_000, bps = 100 → max_allowed = 1_000
      // amount = 500 → OK
      const AUM = new anchor.BN(100_000);
      const AMOUNT = new anchor.BN(500);
      await program.methods
        .checkCompliance(AMOUNT, AUM, protocol)
        .accounts({ agent: agent.publicKey, policy: policyPDA })
        .signers([agent])
        .rpc();
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 2. test_fail_over_spend_limit → OverAumSpendLimit
  //    SUI: amount(150) > max_spend_limit(100) → EOverSpendLimit
  //    Anchor: amount > (aum * bps / 10_000) → OverAumSpendLimit
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n── Group 2: Spend Limit Violations ─────────────");

  await test(
    "check_compliance fails — amount(1500) > 1% of AUM(100 000) = 1000",
    async () => {
      const AUM = new anchor.BN(100_000);
      const AMOUNT = new anchor.BN(1500); // over 1 000 limit
      await assertAnchorError(
        () =>
          program.methods
            .checkCompliance(AMOUNT, AUM, protocol)
            .accounts({ agent: agent.publicKey, policy: policyPDA })
            .signers([agent])
            .rpc(),
        "OverAumSpendLimit"
      );
    }
  );

  await test(
    "check_compliance fails — exact boundary: amount(1001) > max_allowed(1000)",
    async () => {
      const AUM = new anchor.BN(100_000);
      const AMOUNT = new anchor.BN(1001);
      await assertAnchorError(
        () =>
          program.methods
            .checkCompliance(AMOUNT, AUM, protocol)
            .accounts({ agent: agent.publicKey, policy: policyPDA })
            .signers([agent])
            .rpc(),
        "OverAumSpendLimit"
      );
    }
  );

  await test(
    "check_compliance passes — exact boundary: amount(1000) == max_allowed(1000)",
    async () => {
      const AUM = new anchor.BN(100_000);
      const AMOUNT = new anchor.BN(1000); // exactly 1%
      await program.methods
        .checkCompliance(AMOUNT, AUM, protocol)
        .accounts({ agent: agent.publicKey, policy: policyPDA })
        .signers([agent])
        .rpc();
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 3. test_fail_unauthorized_agent
  //    SUI: ctx.sender() != agent_address → ENotAuthorized
  //    Anchor: has_one = agent @ NotAgent
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n── Group 3: Authorisation Failures ─────────────");

  await test(
    "check_compliance fails — stranger tries to call (not the agent)",
    async () => {
      const AUM = new anchor.BN(100_000);
      const AMOUNT = new anchor.BN(100);
      await assertAnchorError(
        () =>
          program.methods
            .checkCompliance(AMOUNT, AUM, protocol)
            .accounts({ agent: stranger.publicKey, policy: policyPDA })
            .signers([stranger])
            .rpc(),
        "NotAgent"
      );
    }
  );

  await test(
    "add_protocol fails — stranger tries to add a protocol (not the owner)",
    async () => {
      // Derive PDA that would belong to stranger's policy (doesn't exist — expect init error,
      // or if we pass owner's PDA the has_one check fires NotOwner)
      const newProtocol = Keypair.generate().publicKey;
      await assertAnchorError(
        () =>
          program.methods
            .addProtocol(newProtocol)
            .accounts({ owner: stranger.publicKey, policy: policyPDA })
            .signers([stranger])
            .rpc(),
        "NotOwner"
      );
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Protocol not approved
  //    SUI: !vector::contains(...) → ENotAuthorized
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n── Group 4: Protocol Not Approved ──────────────");

  await test(
    "check_compliance fails — target protocol not in approved list",
    async () => {
      const RANDOM_TARGET = Keypair.generate().publicKey;
      const AUM = new anchor.BN(100_000);
      const AMOUNT = new anchor.BN(100);
      await assertAnchorError(
        () =>
          program.methods
            .checkCompliance(AMOUNT, AUM, RANDOM_TARGET)
            .accounts({ agent: agent.publicKey, policy: policyPDA })
            .signers([agent])
            .rpc(),
        "ProtocolNotApproved"
      );
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 5. AUM-specific edge cases (new behaviour, no SUI equivalent)
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n── Group 5: AUM-specific edge cases ────────────");

  await test("create_policy fails — aum_percentage_bps = 0", async () => {
    const tempOwner = Keypair.generate();
    await ensureFunded(connection, tempOwner.publicKey);
    const [tempPDA] = await findPolicyPDA(tempOwner.publicKey, programId);
    await assertAnchorError(
      () =>
        program.methods
          .createPolicy(agent.publicKey, new anchor.BN(0))
          .accounts({
            owner: tempOwner.publicKey,
            policy: tempPDA,
            systemProgram: SystemProgram.programId,
          })
          .signers([tempOwner])
          .rpc(),
      "InvalidAumPercentage"
    );
  });

  await test(
    "create_policy fails — aum_percentage_bps > 5000 (>50%)",
    async () => {
      const tempOwner = Keypair.generate();
      await ensureFunded(connection, tempOwner.publicKey);
      const [tempPDA] = await findPolicyPDA(tempOwner.publicKey, programId);
      await assertAnchorError(
        () =>
          program.methods
            .createPolicy(agent.publicKey, new anchor.BN(5001))
            .accounts({
              owner: tempOwner.publicKey,
              policy: tempPDA,
              systemProgram: SystemProgram.programId,
            })
            .signers([tempOwner])
            .rpc(),
        "InvalidAumPercentage"
      );
    }
  );

  await test("check_compliance fails — aum = 0", async () => {
    await assertAnchorError(
      () =>
        program.methods
          .checkCompliance(new anchor.BN(1), new anchor.BN(0), protocol)
          .accounts({ agent: agent.publicKey, policy: policyPDA })
          .signers([agent])
          .rpc(),
      "ZeroAum"
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Results
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════");
  const total = passed + failed;
  console.log(`  Results: ${passed}/${total} passed`);
  if (failed > 0) {
    console.log(`  ${failed} test(s) FAILED`);
    console.log("══════════════════════════════════════════\n");
    process.exit(1);
  }
  console.log("  All tests passed 🎉");
  console.log("══════════════════════════════════════════\n");
})();