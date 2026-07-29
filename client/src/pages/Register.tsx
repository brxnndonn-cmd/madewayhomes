import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

export default function Register() {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'provider' | 'admin'>('customer');
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
    } catch (_) {
      // error is set in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-brand-black">Create Your Account</h1>
          <p className="text-brand-gray-dark mt-1">Join MadeWayHomes and get started today.</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              autoComplete="email"
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="(828) 555-0123"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
            />

            <div>
              <label className="block text-sm font-medium text-brand-black mb-1">Account Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['customer', 'provider', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      role === r
                        ? 'border-brand-red bg-red-50 text-brand-red font-medium'
                        : 'border-gray-300 text-brand-gray-dark hover:border-gray-400'
                    }`}
                  >
                    {r === 'customer' ? 'Homeowner' : r === 'provider' ? 'Provider' : 'Admin'}
                  </button>
                ))}
              </div>
              {role === 'provider' && (
                <p className="mt-2 text-xs text-brand-gray-dark">
                  Provider accounts require approval before you can receive leads.
                </p>
              )}
              {role === 'admin' && (
                <p className="mt-2 text-xs text-brand-gray-dark">
                  The first admin created is auto-approved. Subsequent admin creation requires an existing admin.
                </p>
              )}
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-gray-dark">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-red hover:text-brand-red-dark font-medium transition-colors">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
