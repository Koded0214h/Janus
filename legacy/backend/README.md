Since you are building the backend with **Django** and want to move **ASAP**, we are going to treat the Django server as the "Central Command." It will manage the users, store their "Intents" (instructions), and act as the bridge that calls the **Ika SDK** and the **Sui Blockchain**.

### 🏗️ The Janus Architecture (Django Edition)

---

### 📄 PRD: Janus Backend (Phase 1)

#### **1. Project Overview**

* **Goal:** Provide a secure API for users to create, manage, and monitor autonomous agents.
* **Tech Stack:** * **Framework:** Django + Django REST Framework (DRF).
* **Task Queue:** Celery + Redis (Necessary for long-running AI/Blockchain tasks).
* **External Integrations:** Ika SDK (TypeScript sidecar or Python wrapper), OpenAI/Claude (for intent parsing), Sui SDK.



#### **2. Core Backend Modules**

* **User/Auth Module:** Handles **zkLogin** mapping. Users log in with Google, and Django maps that to their Sui address.
* **Agent Management:** CRUD for "Agent Instances." Each agent has its own `dWallet` (via Ika) and `PolicyObject` (via Sui).
* **Intent Parser:** A service that takes natural language (e.g., *"Save 10% of my Sui every Friday"*) and converts it into a structured JSON "Instruction Set."
* **The Execution Engine (Worker):** A background process that polls the market or waits for triggers, checks the Sui Policy, and calls the Ika signing service.

---

### 🛠️ Execution Plan: Step-by-Step

#### **Step 1: Django Setup**

```bash
# Create the project
django-admin startproject janus_backend .
python manage.py startapp agents
python manage.py startapp core

```

#### **Step 2: Database Model (`agents/models.py`)**

We need to store the link between the user, their agent, and the blockchain objects.

```python
from django.db import models
from django.contrib.auth.models import User

class JanusAgent(models.Model):
    user = models.ForeignKey(User, on_message=models.CASCADE)
    name = models.CharField(max_length=100)
    
    # Blockchain References
    sui_policy_id = models.CharField(max_length=66) # The Move Object ID
    ika_dwallet_address = models.CharField(max_length=66) # The Agent's public wallet
    
    # The "Soul" of the Agent
    raw_instructions = models.TextField() # "Move 10 SUI if..."
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

```

#### **Step 3: The Ika Bridge (The "Tricky" Part)**

The Ika SDK is primarily in **TypeScript**. Since you're using Django (Python), you have two choices for speed:

1. **The Sidecar Method (Recommended for ASAP):** Build a small Node.js service that only handles Ika signing. Django calls this via an internal API.
2. **The Subprocess Method:** Django calls a compiled Ika binary or script.

**Sidecar Logic (`ika_bridge.js`):**

```javascript
// A simple Node script Django can call
const { IkaClient } = require('@ika.xyz/sdk');

async function signWithIka(policyId, txData) {
    const ika = new IkaClient({ network: 'testnet' });
    const signature = await ika.sign({ policyId, txData });
    return signature;
}

```

#### **Step 4: The Intent Parser Service (`agents/services.py`)**

This is where Janus "thinks."

```python
import openai

def parse_intent_to_policy(user_text):
    # Call GPT-4 to turn text into JSON
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": "Return JSON for spending limit and target."}]
    )
    # Result: {"max_spend": 100, "target": "0x123..."}
    return response.choices[0].message.content

```