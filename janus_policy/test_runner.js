const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair } = anchor.web3;

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const programId = new PublicKey("AZp5LhbF7gesu1N7zeAhiLPGLASYC5rVYqUvyB9uRPi8");
  const idl = require("./target/idl/janus_policy.json");
  const program = new anchor.Program(idl, programId, provider);

  // Test create policy
  const owner = provider.wallet;
  const agent = Keypair.generate();
  const [policyPda] = await PublicKey.findProgramAddress(
    [Buffer.from("treasury_policy"), owner.publicKey.toBuffer()],
    program.programId
  );
  await program.methods
    .createPolicy(agent.publicKey, 100) // 1% AUM
    .accounts({ owner: owner.publicKey, policy: policyPda, systemProgram: anchor.web3.SystemProgram.programId })
    .rpc();
  console.log("Policy created");
}
main();