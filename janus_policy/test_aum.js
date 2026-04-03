const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, SystemProgram } = anchor.web3;
const fs = require("fs");

// Load the IDL
const idl = JSON.parse(fs.readFileSync("./target/idl/janus_policy.json", "utf8"));
const programId = new PublicKey("AZp5LhbF7gesu1N7zeAhiLPGLASYC5rVYqUvyB9uRPi8");

async function main() {
  // Set up provider (use localnet)
  const connection = new anchor.web3.Connection("http://127.0.0.1:8899");
  const wallet = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(process.env.ANCHOR_WALLET || "~/.config/solana/id.json")))
  );
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  const program = new anchor.Program(idl, programId, provider);

  const owner = provider.wallet;
  const agent = Keypair.generate();
  const protocol = Keypair.generate();

  // Derive PDA
  const [policyPda] = await PublicKey.findProgramAddress(
    [Buffer.from("treasury_policy"), owner.publicKey.toBuffer()],
    program.programId
  );

  // 1. Create policy with AUM percentage (100 = 1%)
  const aumPercentageBps = 100;
  console.log("Creating policy...");
  await program.methods
    .createPolicy(agent.publicKey, aumPercentageBps)
    .accounts({
      owner: owner.publicKey,
      policy: policyPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  // 2. Add protocol
  console.log("Adding protocol...");
  await program.methods
    .addProtocol(protocol.publicKey)
    .accounts({ policy: policyPda, owner: owner.publicKey })
    .rpc();

  // 3. Check compliance – within limit
  const aum = new anchor.BN(100_000);
  const amount = new anchor.BN(500);
  console.log(`Checking compliance: amount=${amount}, AUM=${aum} (max allowed = 1% = 1000)`);
  await program.methods
    .checkCompliance(amount, aum, protocol.publicKey)
    .accounts({ policy: policyPda, agent: agent.publicKey })
    .signers([agent])
    .rpc();
  console.log("✅ Compliance passed (within limit)");

  // 4. Check compliance – over limit (should fail)
  const largeAmount = new anchor.BN(2000);
  try {
    await program.methods
      .checkCompliance(largeAmount, aum, protocol.publicKey)
      .accounts({ policy: policyPda, agent: agent.publicKey })
      .signers([agent])
      .rpc();
    console.error("❌ Over-limit transaction succeeded unexpectedly");
  } catch (err) {
    console.log("✅ Over-limit correctly rejected:", err.message.match(/OverSpendLimit/) ? "OverSpendLimit" : err.message);
  }

  console.log("All tests passed.");
}

main().catch(console.error);