import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email, password, name, role, phone || undefined);
      navigate('/');
    } catch (_) {} finally { setLoading(false); }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-brand-gray">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-brand-black">Create Your Account</h1>
            <p className="text-brand-gray-dark text-sm mt-1">Join MadeWayHomes and get started today</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1">Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className={`input-field ${fieldErrors.name ? 'input-field-error' : ''}`} />
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1">Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`input-field ${fieldErrors.email ? 'input-field-error' : ''}`} autoComplete="email" />
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1">Phone (optional)</label>
              <input type="tel" placeholder="(828) 555-0123" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1">Password</label>
                <input type="password" placeholder="8+ characters" value={password} onChange={(e) => setPassword(e.target.value)} className={`input-field ${fieldErrors.password ? 'input-field-error' : ''}`} autoComplete="new-password" />
                {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1">Confirm</label>
                <input type="password" placeholder="Re-enter" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`input-field ${fieldErrors.confirmPassword ? 'input-field-error' : ''}`} autoComplete="new-password" />
                {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-black mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['customer', 'provider'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-3 py-2.5 text-sm rounded-lg border-2 font-medium transition-all ${
                      role === r
                        ? 'border-brand-red bg-red-50 text-brand-red shadow-sm'
                        : 'border-gray-200 text-brand-gray-dark hover:border-gray-300'
                    }`}
                  >
                    {r === 'customer' ? '🏠 I\'m a Homeowner' : '🔧 I\'m a Service Provider'}
                  </button>
                ))}
              </div>
              {role === 'provider' && (
                <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                  Provider accounts require approval before you can receive leads.
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-gray-dark">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-red hover:text-brand-red-dark font-semibold transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
