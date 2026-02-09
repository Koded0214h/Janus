const express = require('express');
const { IkaClient } = require('@ika.xyz/sdk');
const app = express();
app.use(express.json());

const ika = new IkaClient({ network: 'testnet' });

app.post('/create-wallet', async (req, res) => {
    const { policyId } = req.body;
    try {
        // This triggers the 2PC-MPC key generation
        const dWallet = await ika.createDWallet({ associatedPolicy: policyId });
        res.json({ address: dWallet.address });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3001, () => console.log('Ika Bridge running on port 3001'));