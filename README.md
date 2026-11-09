# TrustAgent — Autonomous Budget-Governed Agentic Commerce

> Built for the **PayPal AI Hackathon: Build What's Next with PayPal and AI**  
> Targeting categories: **Best Use of Agentic Commerce** & **Best Use of PayPal + AI**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PayPal Sandbox REST API v2](https://img.shields.io/badge/PayPal-Sandbox%20v2%20REST-003087?logo=paypal)](https://developer.paypal.com/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14%20App%20Router-black?logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-Claude%20Aesthetic-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🚀 Overview

**TrustAgent** is an autonomous financial intelligence agent designed to safely bridge autonomous AI decision-making with financial execution on PayPal Sandbox.

Traditional AI agents lack enforceable financial guardrails: when given access to payment instruments, they can accidentally trigger runaway API usage, subscribe to unauthorized services, or overspend. **TrustAgent solves this by enforcing real-time budget guardrails and Human-in-the-Loop (HITL) step-up approval workflows** before any payment or micro-disbursement is captured.

### Key Capabilities

1. **Autonomous Budget Guardrails**:
   - **Single Transaction Ceiling**: Default **$25.00** threshold. Transactions below this limit execute autonomously via auto-capture; transactions exceeding it immediately require Human-in-the-Loop authorization.
   - **Monthly Budget Envelope**: Default **$200.00** rolling spend cap.
   - **Category & Vendor Whitelisting**: Strictly restricts autonomous funds to verified developer dependencies, cloud hosting, API credits, and open-source tipping.

2. **Autonomous Micro-Disbursements via PayPal Payouts**:
   - Automatically settle tips or sponsorship to open-source maintainers or freelancers using PayPal Payouts (`POST /v1/payments/payouts`).

3. **Claude-Style Interactive Artifact Drawer**:
   - When an order requires human approval, an Anthropic/Claude-style right drawer slides open showing the transaction details, purpose, policy assessment, and a 1-click **Approve via PayPal Sandbox** button.

4. **Live Immutable Ledger & PayPal REST Inspector**:
   - Real-time audit trail recording order IDs, capture IDs, payout batch numbers, timestamps, and fees.
   - Click any transaction row to inspect the raw PayPal REST API JSON response.

5. **Demo Safeguards & Fallback Engine**:
   - Seamless "Demo Mode" toggle in the header: works out of the box with realistic PayPal simulated sandbox responses even before credentials are entered, with zero crashes.

---

## 🏗️ Architecture & Flow Diagram

```
[User Natural Language Prompt]
              │
              ▼
    [TrustAgent AI Controller]
              │
  ┌───────────┴───────────────────────┐
  │ Reasoning & Tool Selection        │
  │ • verify_budget_guardrails()      │
  │ • prepare_paypal_checkout()       │
  │ • disburse_payout()               │
  └───────────┬───────────────────────┘
              │
              ▼
  [Financial Guardrail Evaluation]
    ├── Category in Whitelist?
    ├── Amount <= Single Limit ($25)?
    └── Amount <= Remaining Monthly Budget?
              │
       ┌──────┴──────────────────────┐
       │                             │
 [Within Limits]           [Exceeds Ceiling / HITL]
       │                             │
       ▼                             ▼
[Auto-Capture PayPal Order]   [Slide Open Artifact Drawer]
POST /v2/checkout/orders      POST /v2/checkout/orders (PENDING)
POST /v2/checkout/orders/.../capture    │
       │                      [Human User Approves]
       │                             │
       │                             ▼
       │                    [Execute Order Capture]
       │                             │
       └──────────────┬──────────────┘
                      │
                      ▼
            [Live Ledger Updated]
            GET /api/ledger
            Audit Trail & Raw JSON Response
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 App Router, React 18, TypeScript
- **Styling**: Tailwind CSS (Claude / Anthropic warm palette & typography)
- **PayPal Integration**: PayPal REST APIs (OAuth 2.0 Client Credentials, Orders v2, Captures v2, Payouts v1)
- **AI Agent Engine**: OpenAI Function Calling (`gpt-4o-mini`) + Deterministic Resilient Demo Agent Fallback
- **Icons**: Lucide React

---

## ⚡ Quick Start & Local Setup

### 1. Clone & Navigate
```bash
cd "d:\paypal main"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env.local` in the project root:
```env
# PayPal Sandbox Credentials (from developer.paypal.com/dashboard/applications/sandbox)
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com

# AI Model Credentials (OpenAI)
OPENAI_API_KEY=your_openai_api_key

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: If credentials are not provided or you want to demo offline, TrustAgent runs seamlessly in **Demo Mode**, generating realistic PayPal REST schema responses.

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Hackathon Interactive Test Scenarios

Test the 4 pre-configured scenario cards in the UI with a single click:

| Scenario | Prompt | Expected Agent Behavior |
| :--- | :--- | :--- |
| **1. Auto-Approved Order** | `Pay $12.00 to Vercel for Edge Functions deployment` | Under $25 ceiling & whitelisted category ➔ Auto-captures PayPal order and logs to ledger. |
| **2. Autonomous Micro-Payout** | `Tip $5.00 to maintainer@tailwindcss.com` | Calls PayPal Payouts REST API (`POST /v1/payments/payouts`) and logs batch disbursement. |
| **3. Guardrail Approval Trigger** | `Purchase enterprise database cluster on AWS for $75.00` | Exceeds $25 ceiling ➔ Flags `REQUIRES_HUMAN_APPROVAL`, slides open Artifact Drawer for manual sign-off. |
| **4. Policy Block Trigger** | `Subscribe to Casino Gambling VIP for $20.00` | Non-whitelisted category ➔ TrustAgent blocks execution under financial governance policy. |

---

## 📂 Project Structure

```
├── app/
│   ├── api/
│   │   ├── agent/route.ts            # Agentic controller & tool execution engine
│   │   ├── guardrails/route.ts       # Guardrail retrieval & dynamic configuration
│   │   ├── ledger/route.ts           # In-memory session ledger & metrics
│   │   └── paypal/
│   │       ├── capture-order/route.ts # PayPal v2 order capture
│   │       ├── create-order/route.ts  # PayPal v2 order creation
│   │       └── payout/route.ts        # PayPal v1 Payouts disbursement
│   ├── globals.css                   # Claude design tokens & styling
│   ├── layout.tsx                    # Next.js root layout
│   └── page.tsx                      # Primary TrustAgent dashboard & views
├── components/
│   ├── ArtifactDrawer.tsx            # Claude-style sliding authorization drawer
│   ├── ChatStream.tsx                # Conversational stream with Chain-of-Thought pills
│   ├── GuardrailSettingsModal.tsx    # Interactive ceiling & whitelist modifier
│   ├── Header.tsx                    # Brand header, budget meters, and Demo Mode toggle
│   ├── LedgerTable.tsx               # Real-time transaction audit table & filters
│   ├── RawJsonModal.tsx              # PayPal REST API JSON inspector
│   └── ScenarioPills.tsx             # 1-click test scenarios
├── hooks/
│   └── useAgentCommerce.ts           # Core frontend state and API wiring
├── lib/
│   ├── guardrails.ts                 # Financial ceilings & verification rules
│   ├── ledger.ts                     # Session transaction history manager
│   ├── paypal.ts                     # PayPal REST API v2 client & token cache
│   └── types.ts                      # TypeScript schemas & contracts
├── .env.example
├── .env.local
├── LICENSE
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).

