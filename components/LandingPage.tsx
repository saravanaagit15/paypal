'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Sparkles,
  Zap,
  ArrowRight,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  CreditCard,
  Send,
  AlertTriangle,
  Github,
} from 'lucide-react';

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does TrustAgent prevent an AI from draining my funds?',
      a: 'TrustAgent implements a deterministic, server-side governance policy engine. The AI model itself is never given raw financial API keys. Every transaction request must pass mathematical ceiling checks, category whitelist verification, merchant blacklist checks, and budget envelope calculations before any request can reach PayPal.',
    },
    {
      q: 'What happens when a purchase exceeds the single transaction limit ($25)?',
      a: 'The order is held in a PENDING_APPROVAL state and an Anthropic-style interactive Artifact drawer slides open. The human operator must review the recipient, purpose, and amount, then click "Approve via PayPal Sandbox" to capture the funds.',
    },
    {
      q: 'Does TrustAgent support autonomous developer micro-disbursements?',
      a: 'Yes. TrustAgent connects directly to the PayPal Payouts REST API (POST /v1/payments/payouts), allowing you to autonomously tip open-source maintainers or pay freelancers within your strict daily and single limits.',
    },
    {
      q: 'Can I change my spending limits or trigger an emergency freeze?',
      a: 'Yes. In the Budgets & Policies dashboard, you can adjust your per-transaction ceiling, daily limit, weekly limit, and monthly envelope at any time, or toggle the Emergency Spending Freeze button to immediately halt all autonomous commerce.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#1F1E1D] font-sans selection:bg-[#CC5500]/20 selection:text-[#CC5500]">
      {/* 1. Navigation Bar */}
      <nav className="sticky top-0 z-40 border-b border-[#E5E3DA] bg-[#FBFBF9]/90 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#CC5500] to-[#D97706] flex items-center justify-center text-white font-bold shadow-xs">
              TA
            </div>
            <div>
              <span className="font-semibold text-base text-[#1F1E1D]">TrustAgent</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#0070BA]/10 text-[#0070BA] font-semibold border border-[#0070BA]/20">
                PayPal AI Hackathon
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs text-[#787670] font-medium">
            <a href="#how-it-works" className="hover:text-[#1F1E1D] transition-colors">How It Works</a>
            <a href="#guardrails" className="hover:text-[#1F1E1D] transition-colors">Financial Guardrails</a>
            <a href="#ai-agent" className="hover:text-[#1F1E1D] transition-colors">Agent Capabilities</a>
            <a href="#paypal" className="hover:text-[#1F1E1D] transition-colors">PayPal REST</a>
            <a href="#faq" className="hover:text-[#1F1E1D] transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl text-[#1F1E1D] hover:bg-[#F5F4EF] font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-[#CC5500] hover:bg-[#B34700] text-white font-medium shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E5E3DA] bg-white text-xs text-[#787670] mb-6 shadow-2xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#CC5500]" />
          <span>PayPal AI Hackathon: Best Use of Agentic Commerce</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1F1E1D] max-w-4xl mx-auto leading-tight">
          Autonomous Commerce. <br className="hidden sm:inline" />
          <span className="text-[#CC5500]">Financially Governed.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#55534E] max-w-2xl mx-auto leading-relaxed">
          &ldquo;Give AI financial authority, not unlimited financial freedom.&rdquo; TrustAgent empowers autonomous AI agents to purchase developer tools, cloud infrastructure, and tip maintainers via PayPal Sandbox — backed by deterministic mathematical guardrails and Human-in-the-Loop step-up verification.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl bg-[#CC5500] hover:bg-[#B34700] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl border border-[#E5E3DA] bg-white hover:bg-[#F5F4EF] text-[#1F1E1D] font-semibold text-sm shadow-2xs transition-all"
          >
            Explore Live Dashboard
          </Link>
        </div>

        {/* Hero Preview Card */}
        <div className="mt-12 p-4 sm:p-6 rounded-3xl border border-[#E5E3DA] bg-white shadow-xl text-left max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DA]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 font-mono text-xs text-[#787670]">TrustAgent AI Commerce Console</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Guardrail Active ($25 Ceiling)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F5F4EF] font-mono text-xs text-[#1F1E1D] space-y-1">
            <span className="text-[#CC5500] font-semibold">&gt; User Prompt:</span> &ldquo;Pay $12.00 to Vercel for Edge Functions deployment&rdquo;
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="text-[10px] text-emerald-700 font-bold uppercase">Policy Evaluation</div>
              <div className="text-emerald-900 font-semibold mt-1">Within $25 Limit ($12.00)</div>
              <div className="text-[10px] text-emerald-700 mt-0.5">Whitelist: Cloud Hosting ✓</div>
            </div>
            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50">
              <div className="text-[10px] text-blue-700 font-bold uppercase">PayPal REST API</div>
              <div className="text-blue-900 font-semibold mt-1">Order Auto-Captured</div>
              <div className="text-[10px] text-blue-700 mt-0.5">ORD-SANDBOX-71049281</div>
            </div>
            <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50">
              <div className="text-[10px] text-neutral-600 font-bold uppercase">Immutable Ledger</div>
              <div className="text-neutral-900 font-semibold mt-1">Logged with Audit Trace</div>
              <div className="text-[10px] text-neutral-600 mt-0.5">Real DB &amp; Reservation</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section id="how-it-works" className="py-16 px-4 sm:px-8 border-t border-[#E5E3DA] bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase text-[#CC5500] font-semibold tracking-wider">
              Autonomous Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1E1D] mt-2">
              How TrustAgent Operates
            </h2>
            <p className="text-sm text-[#787670] mt-2">
              A 3-layer architecture guaranteeing that no transaction reaches PayPal without passing strict server-side policy validation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[#E5E3DA] bg-[#FBFBF9] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#CC5500] flex items-center justify-center font-bold font-mono">
                01
              </div>
              <h3 className="text-base font-semibold text-[#1F1E1D]">Set Financial Guardrails</h3>
              <p className="text-xs text-[#55534E] leading-relaxed">
                Establish your transaction ceiling ($25 default), monthly envelope ($200), whitelisted software categories, and merchant domains.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E3DA] bg-[#FBFBF9] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold font-mono">
                02
              </div>
              <h3 className="text-base font-semibold text-[#1F1E1D]">Delegate to Autonomous AI</h3>
              <p className="text-xs text-[#55534E] leading-relaxed">
                Instruct the AI in plain English. The agent parses intent, invokes structured tools, and submits proposed transactions to the deterministic policy engine.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E3DA] bg-[#FBFBF9] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0070BA] flex items-center justify-center font-bold font-mono">
                03
              </div>
              <h3 className="text-base font-semibold text-[#1F1E1D]">Auto-Capture or HITL Review</h3>
              <p className="text-xs text-[#55534E] leading-relaxed">
                Under-ceiling orders execute autonomously. Over-ceiling or suspicious orders trigger a Claude-style sliding Artifact drawer for manual Human-in-the-Loop review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Financial Guardrails & Security Controls */}
      <section id="guardrails" className="py-16 px-4 sm:px-8 border-t border-[#E5E3DA] bg-[#FBFBF9]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase text-[#CC5500] font-semibold tracking-wider">
              Enforced Governance
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1E1D] mt-2">
              Multi-Layer Financial Guardrails
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-5 rounded-2xl border border-[#E5E3DA] bg-white space-y-2">
              <div className="flex items-center gap-2 text-[#CC5500] font-semibold">
                <Shield className="w-4 h-4" />
                <span>Ceiling Enforcement</span>
              </div>
              <p className="text-[#55534E] leading-relaxed">
                Strict single-transaction ($25.00) and monthly budget ($200.00) barriers that the AI model cannot mathematically override.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[#E5E3DA] bg-white space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Category Whitelisting</span>
              </div>
              <p className="text-[#55534E] leading-relaxed">
                Restricts autonomous transactions to verified developer tools, cloud hosting, API credits, and open-source tipping.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[#E5E3DA] bg-white space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <Lock className="w-4 h-4" />
                <span>Atomic Reservations</span>
              </div>
              <p className="text-[#55534E] leading-relaxed">
                Holds funds in atomic reservations during pending checkout stages to prevent race conditions and double-spending.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[#E5E3DA] bg-white space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency Freeze</span>
              </div>
              <p className="text-[#55534E] leading-relaxed">
                1-click emergency spending kill switch instantly freezes all outgoing autonomous commerce operations across the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PayPal REST Integration Section */}
      <section id="paypal" className="py-16 px-4 sm:px-8 border-t border-[#E5E3DA] bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <span className="text-xs font-mono uppercase text-[#0070BA] font-semibold tracking-wider">
              Developer Platform
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
              Full PayPal Sandbox REST API v2 Integration
            </h2>
            <p className="text-sm text-[#55534E] leading-relaxed">
              TrustAgent integrates deeply with the PayPal Developer Platform using server-side OAuth 2.0 Client Credentials, token caching, v2 Checkout Orders with purchase units &amp; item breakdowns, order captures, and v1 Payouts for micro-disbursements.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-[#F5F4EF] border border-[#E5E3DA]">POST /v2/checkout/orders</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F5F4EF] border border-[#E5E3DA]">POST /v2/checkout/orders/{'{id}'}/capture</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F5F4EF] border border-[#E5E3DA]">POST /v1/payments/payouts</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-[#E5E3DA] bg-[#FBFBF9] shadow-md w-full md:w-80 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E3DA]">
              <span className="text-[#787670]">API Base</span>
              <span className="font-semibold text-[#0070BA]">api-m.sandbox.paypal.com</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E3DA]">
              <span className="text-[#787670]">Auth Mode</span>
              <span className="text-emerald-700 font-semibold">OAuth 2.0 Bearer</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#787670]">Webhooks</span>
              <span className="text-[#1F1E1D]">Reconciliation Live</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-16 px-4 sm:px-8 border-t border-[#E5E3DA] bg-[#FBFBF9]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1E1D]">Frequently Asked Questions</h2>
            <p className="text-xs text-[#787670] mt-1">Everything you need to know about TrustAgent governance</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="p-4 rounded-xl border border-[#E5E3DA] bg-white">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left text-sm font-semibold text-[#1F1E1D]"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#787670]" /> : <ChevronDown className="w-4 h-4 text-[#787670]" />}
                  </button>
                  {isOpen && <p className="mt-2 text-xs text-[#55534E] leading-relaxed">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-8 px-4 sm:px-8 border-t border-[#E5E3DA] bg-white text-xs text-[#787670]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#CC5500] text-white flex items-center justify-center font-bold text-[10px]">
              TA
            </div>
            <span className="font-semibold text-[#1F1E1D]">TrustAgent</span>
            <span>— Built for the PayPal AI Hackathon</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-[#1F1E1D] transition-colors">Platform</Link>
            <Link href="/login" className="hover:text-[#1F1E1D] transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-[#1F1E1D] transition-colors">Sign Up</Link>
            <a
              href="https://github.com/saravanaagit15/paypal"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-[#1F1E1D] transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

