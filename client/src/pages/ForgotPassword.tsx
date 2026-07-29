import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.forgotPassword(email);
      setSuccess(data.message);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err: any) {
      setError(err.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-brand-black">Forgot Password</h1>
          <p className="text-brand-gray-dark mt-1">Enter your email and we'll help you reset your password.</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}

          {resetToken && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <p className="font-medium text-blue-800 mb-1">Dev Mode — Reset Token:</p>
              <code className="text-xs text-blue-700 break-all">{resetToken}</code>
              <p className="mt-2 text-blue-600">
                <Link to={`/reset-password?token=${resetToken}`} className="underline font-medium">
                  Click here to reset your password
                </Link>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full">
              Send Reset Link
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-gray-dark">
            Remember your password?{' '}
            <Link to="/login" className="text-brand-red hover:text-brand-red-dark font-medium transition-colors">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
