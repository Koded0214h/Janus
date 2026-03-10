import requests


class IkaService:
    """Python client for the Node.js Ika bridge."""

    def __init__(self, bridge_url: str = "http://localhost:3001"):
        self.bridge_url = bridge_url

    def health(self) -> dict:
        return requests.get(f"{self.bridge_url}/health", timeout=5).json()

    def get_agent_address(self) -> str:
        return requests.get(f"{self.bridge_url}/address", timeout=5).json()["address"]

    def provision_agent_wallet(self, curve: str = "secp256k1") -> dict:
        """
        Run the full DKG ceremony and return the active dWallet.
        Blocks ~30-90s while the Ika network processes the request.

        Returns: { dWalletId, publicKey, curve, digest }
        """
        resp = requests.post(
            f"{self.bridge_url}/create-dwallet",
            json={"curve": curve},
            timeout=180,
        )
        data = resp.json()
        if not resp.ok or "error" in data:
            raise Exception(f"DKG failed: {data.get('error', resp.text)}")
        return data

    def get_dwallet_id(self, curve: str = "secp256k1") -> str:
        return self.provision_agent_wallet(curve)["dWalletId"]


if __name__ == "__main__":
    ika = IkaService()
    print("Bridge health:", ika.health())
    print("Agent address:", ika.get_agent_address())

    print("\nCreating dWallet (~30-90s)...")
    wallet = ika.provision_agent_wallet()
    print(f"dWallet ID : {wallet['dWalletId']}")
    print(f"Public key : {wallet['publicKey']}")
    print(f"Tx digest  : {wallet['digest']}")