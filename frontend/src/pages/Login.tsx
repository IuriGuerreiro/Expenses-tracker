import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isAuthenticatedLocal, setIsAuthenticatedLocal] = useState(false);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const codeInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (requires2FA && codeInputs.current[0]) {
      codeInputs.current[0]?.focus();
    }
  }, [requires2FA]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const errorData = err.response?.data;

      // Check if 2FA is required
      if (errorData?.success && errorData?.data?.requiresTwoFactor) {
        setRequires2FA(true);
        setTempToken(errorData.data.tempToken);
        setLoading(false);
        return;
      }

      setError(errorData?.error?.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Handle paste of full code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      if (digits.length === 6) {
        const newCode = digits.split('');
        setCode(newCode);
        codeInputs.current[5]?.focus();
        // Auto-submit when pasted
        handleVerify2FA(digits);
        return;
      }
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      codeInputs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (index === 5 && value && newCode.every((d) => d)) {
      handleVerify2FA(newCode.join(''));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    if (digits.length === 6) {
      const newCode = digits.split('');
      setCode(newCode);
      codeInputs.current[5]?.focus();
      // Auto-submit when pasted
      handleVerify2FA(digits);
    }
  };

  const handleVerify2FA = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    if (codeToVerify.length !== 6) return;

    setError('');
    setLoading(true);

    try {
      const response = await authApi.verify2FA({
        tempToken,
        code: codeToVerify,
      });

      if (response.success && response.data) {
        // Successful 2FA verification - redirect to dashboard
        // Force a full page reload to update auth state properly
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      setError('');
      // Success message could be shown here
    } catch (err: any) {
      setError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setRequires2FA(false);
    setTempToken('');
    setCode(['', '', '', '', '', '']);
    setError('');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">
              {requires2FA ? 'Verify Your Identity' : 'Welcome Back'}
            </h1>
            <p className="text-slate-500">
              {requires2FA
                ? 'Enter the verification code sent to your email'
                : 'Sign in to your account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {error}
            </div>
          )}

          {!requires2FA ? (
            <>
              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* 2FA Code Input */}
              <div className="mb-6">
                <p className="text-sm text-slate-600 mb-6 text-center">
                  A verification code has been sent to your email
                </p>

                {/* 6-digit code input */}
                <div className="flex justify-center gap-2 mb-6">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (codeInputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="primary"
                    onClick={() => handleVerify2FA()}
                    disabled={loading || code.some((d) => !d)}
                    className="w-full"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-sm text-primary-600 hover:text-primary-700 disabled:text-slate-400"
                  >
                    Resend code
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-sm text-slate-600 hover:text-slate-700"
                  >
                    ← Back to login
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
