# TrustAgent — Autonomous Budget-Governed Agentic Commerce Platform

> Built for the **PayPal AI Hackathon: Build What's Next with PayPal and AI**  
> Targeting categories: **Best Use of Agentic Commerce** & **Best Use of PayPal + AI**  
> Core Philosophy: *"Give AI financial authority, not unlimited financial freedom."*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PayPal Sandbox REST API v2](https://img.shields.io/badge/PayPal-Sandbox%20v2%20REST-003087?logo=paypal)](https://developer.paypal.com/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14%20App%20Router-black?logo=next.js)](https://nextjs.org/)
[![Database: Prisma SQLite / PostgreSQL](https://img.shields.io/badge/Database-Prisma%20ORM-2D3748?logo=prisma)](https://prisma.io/)
[![Auth: JWT + BCrypt](https://img.shields.io/badge/Security-HTTP--Only%20JWT%20%2B%20Bcrypt-emerald)](https://github.com/saravanaagit15/paypal)

---

## 🚀 Overview

**TrustAgent** is an autonomous financial supervisor and agentic commerce platform. It enables users to communicate with an autonomous AI agent in natural language, delegate purchasing and payment tasks, establish mathematical financial guardrails, and execute transactions safely through **PayPal Sandbox**.

Traditional AI agents lack enforceable financial boundaries: when given payment tools, they can overspend, generate duplicate orders, or subscribe to unauthorized vendors. **TrustAgent solves this by enforcing a deterministic server-side governance policy engine** that intercepts every payment intent before it ever reaches PayPal.

---

## 🔑 Key Features & Architecture

### 1. Complete Authentication & User Isolation
- **Sign Up & Registration**: Name, email, password strength indicator, secure password hashing (`bcryptjs`), terms acceptance.
- **Session Management**: Cryptographically signed HTTP-only JWT cookies (`jose`), session expiration, CSRF protection, protected dashboard routes.
- **User Isolation**: User-specific database records, private ledgers, custom budget ceilings, and personalized merchant whitelists.
- **Demo Mode Quick-Fill**: 1-click demo login (`demo@trustagent.ai` / `DemoPassword123!`) for instant testing.

### 2. Deterministic Financial Governance Policy Engine
Every payment request must pass through the deterministic policy engine before any PayPal REST API call:
- **Ceiling Enforcement**: Single-transaction ceiling ($25 default) & monthly spending envelope ($200 default).
- **Daily & Weekly Limits**: Real-time aggregation of today's and this week's settled transactions from the database.
- **Vendor & Category Whitelisting**: Restricts autonomous funds to verified developer tools, cloud hosting, API credits, and OSS tipping.
- **Merchant Blacklist**: Hard block on high-risk domains and gambling vendors.
- **Duplicate Transaction Detection**: Identifies and flags repeated charges for the same recipient and amount within 3 minutes.
- **Atomic Budget Reservations**: 15-minute reservation TTL prevents race conditions and double-spending.
- **Emergency Spending Freeze**: 1-click global kill switch halts all outgoing autonomous commerce immediately.

### 3. Human-in-the-Loop (HITL) Approval Center
- When a transaction exceeds the $25 ceiling or triggers a policy flag, state transitions to `PENDING_APPROVAL`.
- An Anthropic/Claude-style **Artifact Sliding Drawer** opens in-chat, and an entry appears in the dedicated **Approval Center**.
- Displays merchant, amount, purpose, AI reasoning summary, remaining budget, and risk indicators.
- 1-click **Approve via PayPal Sandbox** captures the order, commits the reservation, logs to the ledger, and creates notifications.

### 4. PayPal Sandbox REST API v2 Integration
- **OAuth 2.0 Client Credentials**: Server-side token retrieval with in-memory caching to reuse active access tokens.
- **Orders API v2**: `POST /v2/checkout/orders` with `intent: "CAPTURE"`, purchase units, and application context.
- **Captures API v2**: `POST /v2/checkout/orders/{orderId}/capture` with seller protection verification.
- **Payouts API v1**: `POST /v1/payments/payouts` for autonomous micro-disbursements (tipping maintainers or freelancers).
- **Webhook Reconciliation**: `POST /api/paypal/webhook` parses PayPal event notifications (`PAYMENT.CAPTURE.COMPLETED`, `CHECKOUT.ORDER.APPROVED`).

### 5. Persistent Relational Database (Prisma ORM)
- Backed by **Prisma ORM** with SQLite (`prisma/dev.db`) for zero-setup local portability, fully switchable to PostgreSQL via `DATABASE_URL`.
- Structured models: `User`, `Budget`, `SpendingPolicy`, `MerchantWhitelist`, `MerchantBlacklist`, `Transaction`, `TransactionApproval`, `BudgetReservation`, `AgentSession`, `AuditLog`, `Notification`, `Integration`.
- Zero hardcoded financial information — all metrics, balances, and charts are computed from real database records.

---

## 🖥️ Authenticated Dashboard Navigation

| View | Route | Features |
| :--- | :--- | :--- |
| **Overview** | `/dashboard` | Live monthly spending, budget utilization gauge, transaction counts, pending alerts, recent activity feed. |
| **AI Agent** | `/dashboard/agent` | Conversational stream, Chain-of-Thought thinking pills, 1-click scenario pills, Claude-style sliding Artifact drawer. |
| **Budgets & Policies** | `/dashboard/budgets` | Configurable per-transaction, daily, weekly, and monthly ceilings; category whitelist; emergency freeze toggle. |
| **Transactions** | `/dashboard/transactions` | Full ledger with filters, search, and click-to-view raw PayPal Sandbox API JSON response modal. |
| **Approvals** | `/dashboard/approvals` | Interactive step-up authorization center with Approve (PayPal Capture) and Reject workflows. |
| **Merchants** | `/dashboard/merchants` | Whitelist and blacklist management with add/delete actions and domain validation. |
| **Analytics** | `/dashboard/analytics` | Real-time category distribution, merchant rankings, autonomous vs. manual ratios, and CSV export. |
| **Audit Logs** | `/dashboard/audit` | Immutable security audit log tracking user logins, AI calls, guardrail evaluations, and PayPal API responses. |
| **Integrations** | `/dashboard/integrations` | Real-time health status of PayPal Sandbox REST API, OpenAI agent engine, and database store. |
| **Settings** | `/dashboard/settings` | Profile updates, password changes, notification preferences, and account deletion. |

---

## 🧪 Automated Test Suite

TrustAgent includes an end-to-end automated test suite verifying all layers:

```bash
npm test
```

**Verified Test Coverage (14/14 Passing)**:
- ✓ Password hashing & verification match (`bcryptjs`)
- ✓ Invalid password rejection
- ✓ Cryptographic JWT token issuance & claims verification (`jose`)
- ✓ Under-ceiling ($15 <= $25) autonomous auto-approval
- ✓ Above-ceiling ($75 > $25) Human-in-the-Loop step-up trigger
- ✓ Unauthorized category policy rejection
- ✓ Monthly envelope exhaustion rejection
- ✓ Emergency spending freeze instant block
- ✓ PayPal Order creation (`POST /v2/checkout/orders`)
- ✓ PayPal Order capture (`POST /v2/checkout/orders/{id}/capture`)
- ✓ PayPal Payout disbursement (`POST /v1/payments/payouts`)

---

## ⚡ Quick Start & Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/saravanaagit15/paypal.git
cd paypal
npm install
```

### 2. Configure Environment Variables
Create `.env.local` (or `.env`):
```env
# Database (SQLite default for zero-setup local dev; supports PostgreSQL)
DATABASE_URL="file:./dev.db"

# JWT Secret for Session Authentication
JWT_SECRET="trustagent_super_secure_jwt_secret_key_2026_paypal_hackathon_token"

# PayPal Sandbox Credentials (from developer.paypal.com/dashboard/applications/sandbox)
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com

# AI Model Credentials (OpenAI)
OPENAI_API_KEY=your_openai_api_key

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize Database
```bash
npx prisma db push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
- Click **Launch Platform** or **Sign In** and use the **Fill Demo Account** button (`demo@trustagent.ai` / `DemoPassword123!`).

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
