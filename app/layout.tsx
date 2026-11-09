import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrustAgent — Autonomous Budget-Governed Agentic Commerce',
  description:
    'Production-grade hackathon MVP for PayPal AI Hackathon: Autonomous financial intelligence agent executing commerce on PayPal Sandbox with financial guardrails.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FBFBF9] text-[#1F1E1D]">{children}</body>
    </html>
  );
}

