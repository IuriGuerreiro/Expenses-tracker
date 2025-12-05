import React, { useState, useEffect } from 'react';
import { settingsApi } from '../api/settings';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { MainLayout } from '../components/layout/MainLayout';

export default function Settings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Enable 2FA modal state
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [enableStep, setEnableStep] = useState<'email' | 'code'>('email');
  const [enableEmail, setEnableEmail] = useState('');
  const [enableCode, setEnableCode] = useState('');
  const [enableLoading, setEnableLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Disable 2FA modal state
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendCountdown]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.get2FAStatus();
      if (response.success && response.data) {
        setTwoFactorEnabled(response.data.enabled);
        setTwoFactorEmail(response.data.email);
      }
    } catch (err: any) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableStart = () => {
    setShowEnableModal(true);
    setEnableStep('email');
    setEnableEmail(twoFactorEmail);
    setEnableCode('');
    setError('');
    setSuccess('');
  };

  const handleSendCode = async () => {
    try {
      setEnableLoading(true);
      setError('');
      const response = await settingsApi.enable2FA(
        enableEmail ? { email: enableEmail } : undefined
      );
      if (response.success) {
        setEnableStep('code');
        setSuccess('Verification code sent to your email');
        setResendDisabled(true);
        setResendCountdown(60);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send code');
    } finally {
      setEnableLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setEnableLoading(true);
      setError('');
      const response = await settingsApi.confirmEnable2FA({ code: enableCode });
      if (response.success) {
        setSuccess('2FA enabled successfully!');
        setShowEnableModal(false);
        await loadSettings();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid or expired code');
    } finally {
      setEnableLoading(false);
    }
  };

  const handleResendCode = async () => {
    setEnableCode('');
    await handleSendCode();
  };

  const handleDisable = async () => {
    try {
      setDisableLoading(true);
      setError('');
      const response = await settingsApi.disable2FA({ password: disablePassword });
      if (response.success) {
        setSuccess('2FA disabled successfully');
        setShowDisableModal(false);
        setDisablePassword('');
        await loadSettings();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to disable 2FA');
    } finally {
      setDisableLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
            <p className="text-slate-600">Loading settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-6">Settings</h1>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Security Settings Card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
          <h2 className="text-xl font-display font-semibold text-slate-900 mb-2">
            Security Settings
          </h2>
          <p className="text-slate-600 mb-6">Manage your account security preferences</p>

          {/* 2FA Section */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Two-Factor Authentication (2FA)
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Add an extra layer of security to your account by requiring a verification
                  code sent to your email.
                </p>
                {twoFactorEnabled && (
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">2FA Email:</span> {twoFactorEmail}
                  </p>
                )}
              </div>
              <div className="ml-6">
                {twoFactorEnabled ? (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      Enabled
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() => setShowDisableModal(true)}
                    >
                      Disable
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      Disabled
                    </span>
                    <Button variant="primary" onClick={handleEnableStart}>
                      Enable 2FA
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enable 2FA Modal */}
        {showEnableModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-4">
                Enable Two-Factor Authentication
              </h2>

              {enableStep === 'email' ? (
                <>
                  <p className="text-slate-600 mb-6">
                    Enter the email address where you'd like to receive verification codes.
                  </p>
                  <Input
                    label="Email for 2FA"
                    type="email"
                    value={enableEmail}
                    onChange={(e) => setEnableEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="secondary"
                      onClick={() => setShowEnableModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSendCode}
                      disabled={enableLoading || !enableEmail}
                      className="flex-1"
                    >
                      {enableLoading ? 'Sending...' : 'Send Code'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {success && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                      {success}
                    </div>
                  )}
                  {error && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                      {error}
                    </div>
                  )}
                  <p className="text-slate-600 mb-6">
                    Enter the 6-digit code sent to <strong>{enableEmail}</strong>
                  </p>
                  <Input
                    label="Verification Code"
                    type="text"
                    value={enableCode}
                    onChange={(e) => setEnableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                  />
                  <button
                    onClick={handleResendCode}
                    disabled={resendDisabled}
                    className="text-sm text-primary-600 hover:text-primary-700 mt-2 disabled:text-slate-400"
                  >
                    {resendDisabled ? `Resend code (${resendCountdown}s)` : 'Resend code'}
                  </button>
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowEnableModal(false);
                        setSuccess('');
                        setError('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleVerifyCode}
                      disabled={enableLoading || enableCode.length !== 6}
                      className="flex-1"
                    >
                      {enableLoading ? 'Verifying...' : 'Verify & Enable'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Disable 2FA Modal */}
        {showDisableModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-4">
                Disable Two-Factor Authentication
              </h2>
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  ⚠️ Are you sure you want to disable 2FA? This will make your account less
                  secure.
                </p>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                  {error}
                </div>
              )}
              <Input
                label="Confirm with your password"
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password"
              />
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDisableModal(false);
                    setDisablePassword('');
                    setError('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDisable}
                  disabled={disableLoading || !disablePassword}
                  className="flex-1 bg-rose-600 hover:bg-rose-700"
                >
                  {disableLoading ? 'Disabling...' : 'Confirm Disable'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
