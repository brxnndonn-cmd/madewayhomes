import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setStatus('error'); setMsg('Email is required.'); return; }
    setStatus('loading');
    try {
      await apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }), skipAuth: true });
      setStatus('success');
      setMsg('If an account exists with that email, a password reset link has been sent.');
    } catch (err: any) {
      setStatus('error');
      setMsg(err.data?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-brand-gray">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-extrabold text-brand-black tracking-tight">
              Made<span className="text-brand-red">Way</span>Homes
            </span>
          </Link>
        </div>

        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-red/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-brand-black">Reset Your Password</h1>
            <p className="text-brand-gray-dark text-sm mt-1">Enter your email and we'll send you a reset link</p>
          </div>

          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">📧</div>
              <p className="text-brand-gray-dark leading-relaxed">{msg}</p>
              <Link to="/login" className="btn-primary mt-6 inline-block">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                  <span>⚠️</span><span>{msg}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="input-field" />
              </div>
              <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p className="text-center text-sm mt-4">
                <Link to="/login" className="text-brand-red hover:text-brand-red-dark font-semibold">← Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
