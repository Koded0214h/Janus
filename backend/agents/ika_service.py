"""
Ika Service — Python client for the Ika bridge.

The dWallet creation flow:
  1. Python computes DKG locally using the JS WASM SDK via Node subprocess
  2. Python POSTs the result to the bridge
  3. Bridge submits on-chain and returns the dWallet IDs

Usage:
    service = IkaService()
    wallet = service.create_dwallet()
    print(wallet['dWalletObjectId'])
"""

import subprocess
import tempfile
import json
import os
import requests


BRIDGE_URL = os.getenv("IKA_BRIDGE_URL", "http://localhost:3001")
NETWORK    = os.getenv("SUI_NETWORK", "testnet")

# Inline JS that uses the Ika SDK to compute local DKG, then prints JSON result
PREPARE_DKG_JS = """
const {{
  prepareDKG,
  UserShareEncryptionKeys,
  Curve,
  getNetworkConfig,
  IkaClient,
  createRandomSessionIdentifier,
}} = require('@ika.xyz/sdk');
const {{ SuiClient }} = require('@mysten/sui/client');

async function main() {{
  const network  = '{network}';
  const address  = '{address}';
  const curveVal = {curve};

  const RPC = network === 'mainnet'
    ? 'https://ikafn-on-sui-2-mainnet.ika-network.net/'
    : 'https://sui-testnet-rpc.publicnode.com';

  const suiClient = new SuiClient({{ url: RPC }});
  const ikaConfig = getNetworkConfig(network);
  const ikaClient = new IkaClient({{ suiClient, config: ikaConfig }});

  const curve = curveVal === 0 ? Curve.SECP256K1
              : curveVal === 1 ? Curve.SECP256R1
              : Curve.ED25519;

  // 1. Derive encryption keys from address seed
  const encryptionKeys = await UserShareEncryptionKeys.fromRootSeedKey(
    new TextEncoder().encode(address),
    curve,
  );

  // 2. Get protocol public parameters from network
  const protocolParams = await ikaClient.getProtocolPublicParameters(undefined, curve);

  // 3. Generate session identifier
  const sessionIdentifier = createRandomSessionIdentifier();

  // 4. Run local DKG computation
  const dkgResult = await prepareDKG(
    protocolParams,
    curve,
    encryptionKeys.encryptionKey,
    sessionIdentifier,
    address,
  );

  // 5. Output everything the bridge needs
  console.log(JSON.stringify({{
    userPublicOutput:          Array.from(dkgResult.userPublicOutput),
    userDkgMessage:            Array.from(dkgResult.userDKGMessage),
    encryptedUserShareAndProof: Array.from(dkgResult.encryptedUserShareAndProof),
    sessionIdentifier:         Array.from(sessionIdentifier),
    signerPublicKey:           Array.from(encryptionKeys.signerPublicKey),
    encryptionKeyAddress:      encryptionKeys.encryptionKeyAddress,
    encryptionKey:             Array.from(encryptionKeys.encryptionKey),
    encryptionKeySignature:    Array.from(encryptionKeys.encryptionKeySignature),
    curve:                     curveVal,
    // Save secret share for later signing (store securely!)
    userSecretKeyShare:        Array.from(dkgResult.userSecretKeyShare),
  }}));
}}

main().catch(e => {{ console.error('DKG_ERROR:', e.message); process.exit(1); }});
"""


class IkaService:
    def __init__(
        self,
        bridge_url: str = BRIDGE_URL,
        network: str = NETWORK,
        # Path to the bridge's node_modules (where @ika.xyz/sdk is installed)
        sdk_path: str = os.path.expanduser("~/Code/Janus/bridge"),
    ):
        self.bridge_url = bridge_url
        self.network    = network
        self.sdk_path   = sdk_path

    def health(self) -> dict:
        return requests.get(f"{self.bridge_url}/health", timeout=5).json()

    def _compute_dkg_locally(self, address: str, curve: int = 0) -> dict:
        """Run local DKG computation via Node.js subprocess."""
        js = PREPARE_DKG_JS.format(
            network=self.network,
            address=address,
            curve=curve,
        )
        with tempfile.NamedTemporaryFile(suffix=".js", mode="w", delete=False) as f:
            f.write(js)
            tmp = f.name

        try:
            result = subprocess.run(
                ["node", tmp],
                capture_output=True, text=True, timeout=120,
                cwd=self.sdk_path,  # so require('@ika.xyz/sdk') resolves
            )
            if result.returncode != 0:
                raise Exception(f"Local DKG failed: {result.stderr}")
            return json.loads(result.stdout.strip())
        finally:
            os.unlink(tmp)

    def create_dwallet(self, address: str, curve: int = 0) -> dict:
        """
        Full dWallet creation flow:
          1. Compute DKG locally (Node subprocess)
          2. POST to bridge to submit on-chain
          3. Return dWallet IDs

        Args:
            address: Sui address that will own the dWallet
            curve:   0=secp256k1 (Ethereum), 1=secp256r1, 2=ed25519

        Returns:
            {
              dWalletObjectId, dWalletCapObjectId,
              encryptedUserSecretKeyShareId,
              digest,
              userSecretKeyShare  # keep this safe!
            }
        """
        print(f"[Ika] Computing DKG locally for {address}...")
        dkg_data = self._compute_dkg_locally(address, curve)

        # Stash the secret share before sending to bridge (bridge doesn't need it)
        secret_share = dkg_data.pop("userSecretKeyShare", None)

        print("[Ika] Submitting DKG to bridge...")
        resp = requests.post(
            f"{self.bridge_url}/api/dkg/submit",
            json=dkg_data,
            timeout=120,
        )
        result = resp.json()
        if not resp.ok or not result.get("success"):
            raise Exception(f"Bridge DKG failed: {result.get('error', resp.text)}")

        result["userSecretKeyShare"] = secret_share  # return to caller
        print(f"[Ika] dWallet created! ID: {result['dWalletObjectId']}")
        return result


# ── CLI test ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    address = sys.argv[1] if len(sys.argv) > 1 \
        else "0x5421f9f7cfb6d28e1949973e5fb0f18bb30d4e76db7e2114d7ed2cebdf5fe1e3"

    svc = IkaService()

    print("Bridge health:", svc.health())
    print(f"\nCreating dWallet for {address}...")

    wallet = svc.create_dwallet(address)
    print("\n✓ Success!")
    print(f"  dWallet ID     : {wallet['dWalletObjectId']}")
    print(f"  dWallet Cap ID : {wallet['dWalletCapObjectId']}")
    print(f"  Tx Digest      : {wallet['digest']}")
    print(f"  Secret share   : {str(wallet['userSecretKeyShare'])[:40]}... (store safely!)")