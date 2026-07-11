const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, SystemProgram } = anchor.web3;
const fs = require("fs");
const path = require("path");

async function main() {
  // Load IDL
  const idlPath = path.join(__dirname, "target/idl/janus_policy.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
  const programId = new PublicKey("AZp5LhbF7gesu1N7zeAhiLPGLASYC5rVYqUvyB9uRPi8");

  // Connect to localnet
  const connection = new anchor.web3.Connection("http://localhost:8899");
  
  // Load wallet from file
  const walletPath = path.join(process.env.HOME, ".config/solana/id.json");
  const walletSecret = Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf8")));
  const wallet = Keypair.fromSecretKey(walletSecret);
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

  console.log("Policy PDA:", policyPda.toString());

  // 1. Create policy
  const aumPercentageBps = 100; // 1%
  console.log("Creating policy...");
  const txCreate = await program.methods
    .createPolicy(agent.publicKey, aumPercentageBps)
    .accounts({
      owner: owner.publicKey,
      policy: policyPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  console.log("Create policy tx:", txCreate);

  // 2. Add protocol
  console.log("Adding protocol...");
  const txAdd = await program.methods
    .addProtocol(protocol.publicKey)
    .accounts({ policy: policyPda, owner: owner.publicKey })
    .rpc();
  console.log("Add protocol tx:", txAdd);

  // 3. Check compliance within limit
  const aum = new anchor.BN(100_000);
  const amount = new anchor.BN(500);
  console.log(`Checking compliance: amount=${amount.toString()}, AUM=${aum.toString()}`);
  const txComply = await program.methods
    .checkCompliance(amount, aum, protocol.publicKey)
    .accounts({ policy: policyPda, agent: agent.publicKey })
    .signers([agent])
    .rpc();
  console.log("Compliance tx:", txComply);
  console.log("✅ Compliance passed");

  // 4. Over limit should fail
  const largeAmount = new anchor.BN(2000);
  try {
    await program.methods
      .checkCompliance(largeAmount, aum, protocol.publicKey)
      .accounts({ policy: policyPda, agent: agent.publicKey })
      .signers([agent])
      .rpc();
    console.error("❌ Over-limit succeeded unexpectedly");
  } catch (err) {
    if (err.message.includes("OverSpendLimit")) {
      console.log("✅ Over-limit correctly rejected");
    } else {
      console.error("Unexpected error:", err);
    }
  }

  console.log("All tests passed.");
}

main().catch(console.error);