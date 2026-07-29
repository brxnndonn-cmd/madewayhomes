import { useState, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) { setStatus('error'); setMsg('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setStatus('error'); setMsg('Passwords do not match.'); return; }
    if (!token) { setStatus('error'); setMsg('Invalid or missing reset token.'); return; }
    setStatus('loading');
    try {
      await apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }), skipAuth: true });
      setStatus('success');
      setMsg('Your password has been reset successfully.');
    } catch (err: any) {
      setStatus('error');
      setMsg(err.data?.error || 'Something went wrong.');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-brand-black">Set New Password</h1>
            <p className="text-brand-gray-dark text-sm mt-1">Choose a strong password for your account</p>
          </div>

          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-brand-gray-dark mb-6">{msg}</p>
              <Link to="/login" className="btn-primary inline-block">Log In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                  <span>⚠️</span><span>{msg}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1">New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ characters" required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter" required className="input-field" />
              </div>
              <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
