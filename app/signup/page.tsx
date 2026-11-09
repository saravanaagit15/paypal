'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must accept the terms of service.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
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
          Create your governed commerce account
        </h2>
        <p className="mt-1 text-xs text-[#787670]">
          Already registered?{' '}
          <Link href="/login" className="text-[#CC5500] hover:underline font-medium">
            Sign in
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
              <label className="block font-medium text-[#1F1E1D] mb-1">Full name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#787670] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#1F1E1D] mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#787670] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@skynet.ai"
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
                  placeholder="Min 8 characters"
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

              {/* Password strength bar */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1">
                    <div className={`flex-1 rounded-full ${strength >= 1 ? 'bg-rose-500' : 'bg-neutral-200'}`} />
                    <div className={`flex-1 rounded-full ${strength >= 2 ? 'bg-amber-500' : 'bg-neutral-200'}`} />
                    <div className={`flex-1 rounded-full ${strength >= 3 ? 'bg-blue-500' : 'bg-neutral-200'}`} />
                    <div className={`flex-1 rounded-full ${strength >= 4 ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
                  </div>
                  <span className="text-[10px] text-[#787670] block">
                    {strength <= 1 ? 'Weak password' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium text-[#1F1E1D] mb-1">Confirm password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#787670] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden transition-all text-xs"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 text-[#787670] cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#E5E3DA] text-[#CC5500]"
                />
                <span className="text-[11px] leading-tight">
                  I agree to the Terms of Service, Privacy Policy, and PayPal Sandbox Testing Guidelines.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#CC5500] hover:bg-[#B34700] text-white font-medium shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
