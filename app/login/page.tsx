'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@trustagent.ai');
    setPassword('DemoPassword123!');
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#CC5500]/20 selection:text-[#CC5500]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CC5500] to-[#D97706] flex items-center justify-center text-white font-bold shadow-xs">
            TA
          </div>
          <span className="font-bold text-xl text-[#1F1E1D]">TrustAgent</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-[#1F1E1D]">
          Sign in to your financial console
        </h2>
        <p className="mt-1 text-xs text-[#787670]">
          Or{' '}
          <Link href="/signup" className="text-[#CC5500] hover:underline font-medium">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#E5E3DA] shadow-xs">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[#1F1E1D] mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#787670] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#1F1E1D] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#787670] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden transition-all text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787670] hover:text-[#1F1E1D]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-[#787670] cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-[#E5E3DA] text-[#CC5500]" />
                <span>Remember session</span>
              </label>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-[#CC5500] hover:underline font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Fill Demo Account</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#CC5500] hover:bg-[#B34700] text-white font-medium shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
