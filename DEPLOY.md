# Janus Protocol — Deployment & Service Guide

This guide provides step-by-step instructions for building, deploying, and starting the four core services of the Janus Protocol ecosystem.

---

## 1. Smart Contract (Solana / Anchor)
The `janus_policy` program acts as the on-chain compliance judge for all AI-driven trades.

**Prerequisites:** Solana CLI, Anchor CLI.

*   **Build:**
    ```bash
    cd janus_policy
    anchor build
    ```
*   **Deploy (to Devnet/Localnet):**
    ```bash
    anchor deploy
    ```
*   **Initialize Policy (One-time):**
    Run the test script to initialize the Treasury Policy PDA:
    ```bash
    node tests/janus_policy.test.js
    ```

---

## 2. Bridges (Node.js)
The bridges handle MPC key management (Ika) and Drift transaction construction (Solana).

**Prerequisites:** Node.js 18+.

### Service A: Ika MPC Bridge
*   **Install:**
    ```bash
    cd bridge
    npm install
    ```
*   **Start:**
    ```bash
    # Port 3001
    node ika_bridge.js
    ```

### Service B: Drift Trading Bridge
*   **Start:**
    ```bash
    # Port 3002
    node drift_bridge.js
    ```
    *Note: Ensure `SOLANA_RPC` environment variable is set.*

---

## 3. Backend (Django + AI Agent)
The backend manages the AI "brain," parses natural language intents, and runs the autonomous vault manager.

**Prerequisites:** Python 3.10+, virtualenv.

*   **Setup:**
    ```bash
    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    python manage.py migrate
    ```
*   **Start API Server:**
    ```bash
    # Port 8000
    python manage.py runserver
    ```
*   **Start Autonomous Agent (The Bot):**
    ```bash
    # Runs the rebalancing loop
    python manage.py run_agent --interval 60
    ```

---

## 4. Frontend (Vite + React)
The dashboard for monitoring AUM, deploying agents, and setting intent policies.

**Prerequisites:** Node.js 18+.

*   **Install:**
    ```bash
    cd frontend
    npm install
    ```
*   **Build:**
    ```bash
    npm run build
    ```
*   **Start (Dev Mode):**
    ```bash
    # Port 5173
    npm run dev
    ```

---

## 🚀 Full Launch Sequence (Summary)
1.  **Deploy Smart Contract** (`janus_policy`)
2.  **Start Ika Bridge** (Port 3001)
3.  **Start Drift Bridge** (Port 3002)
4.  **Start Backend API** (Port 8000)
5.  **Start Autonomous Agent** (`run_agent`)
6.  **Open Frontend** (Port 5173)

**Money moves, compliance is enforced, and the AI is in control!**
