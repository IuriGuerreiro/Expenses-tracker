import React, { useState, useEffect } from 'react';
import { accountsApi } from '../api/accounts';
import type { Account } from '../types';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function Categories() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [allocationPercentage, setAllocationPercentage] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await accountsApi.getAll();
      if (response.success && response.data) {
        setAccounts(response.data.accounts);
        setTotalAllocation(response.data.totalAllocationPercentage);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const requestedPercentage = parseInt(allocationPercentage);

      await accountsApi.create({
        name,
        allocationPercentage: requestedPercentage,
        isDefault,
      });

      // Reset form
      setShowForm(false);
      setName('');
      setAllocationPercentage('');
      setIsDefault(false);
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save account');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await accountsApi.delete(id);
      fetchAccounts();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete account');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setName('');
    setAllocationPercentage('');
    setIsDefault(false);
    setError('');
  };

  const remainingAllocation = 100 - totalAllocation;
  const hasDefaultAccount = accounts.some(a => a.isDefault);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
          Accounts
        </h1>
        <p className="text-slate-600">Manage your budget allocation accounts and track balances.</p>
      </div>

      {/* Allocation Summary */}
      <Card className="mb-8 bg-gradient-to-br from-primary-50 to-indigo-50 border-primary-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-display font-semibold text-slate-900">Total Allocation</h3>
          <div className="text-3xl font-display font-bold text-primary-600">
            {totalAllocation}%
            <span className="text-lg text-slate-500 font-normal"> / 100%</span>
          </div>
        </div>
        {remainingAllocation > 0 && (
          <p className="text-sm text-emerald-700 font-medium">
            ✓ {remainingAllocation}% available for allocation
          </p>
        )}
        {remainingAllocation === 0 && (
          <p className="text-sm text-emerald-700 font-medium">
            ✓ Fully allocated - all income will be distributed
          </p>
        )}
        <p className="text-sm text-slate-600 mt-3">
          Accounts represent budget allocation categories. Each account gets a percentage of your income automatically allocated to it.
        </p>
      </Card>

      {/* Add Account Button */}
      {!showForm && (
        <div className="mb-8">
          <Button variant="primary" size="md" onClick={() => setShowForm(true)}>
            Add New Account
          </Button>
        </div>
      )}

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Add New Account</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Account Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Savings, Emergency Fund, Bills"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Allocation Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                value={allocationPercentage}
                onChange={(e) => setAllocationPercentage(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-sm text-slate-500 mt-2">
                Available: {remainingAllocation}%
              </p>
            </div>

            {!hasDefaultAccount && (
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-3 text-sm text-slate-700">
                    Make this the default account (absorbs remaining allocation automatically)
                  </span>
                </label>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" variant="primary" size="md" disabled={formLoading}>
                {formLoading ? 'Creating...' : 'Create Account'}
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <Card
            key={account.id}
            className={`${
              account.isDefault ? 'border-2 border-emerald-500' : ''
            } ${
              account.isLowBalance ? 'bg-amber-50 border-amber-200' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-display font-bold text-slate-900">{account.name}</h3>
              {account.isDefault && (
                <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
                  DEFAULT
                </span>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-slate-600">Balance</p>
                <p className="text-2xl font-display font-bold text-slate-900">{account.balanceFormatted}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Allocation</p>
                <p className="text-lg font-semibold text-primary-600">{account.allocationPercentage}%</p>
              </div>
            </div>

            {account.isLowBalance && (
              <div className="mb-4 p-2 bg-amber-100 border border-amber-300 rounded-lg text-amber-800 text-xs">
                ⚠️ Low or zero balance
              </div>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(account.id)}
              className="w-full"
            >
              Delete Account
            </Button>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-slate-600 text-lg mb-2">No accounts yet. Create your first account!</p>
          <p className="text-sm text-slate-500">
            Tip: Create a default account with 100% allocation first. This ensures all income is allocated somewhere.
          </p>
        </Card>
      )}
    </MainLayout>
  );
}
