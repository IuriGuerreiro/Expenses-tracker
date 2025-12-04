import React, { useState, useEffect, useCallback } from 'react';
import { debtsApi, type Debt, type DebtSummary } from '../api/debts';
import { accountsApi } from '../api/accounts';
import type { Account } from '../types';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [categories, setCategories] = useState<Account[]>([]);
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  // Form state
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'OWED_TO_ME' | 'OWED_BY_ME'>('OWED_TO_ME');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<'ALL' | 'OWED_TO_ME' | 'OWED_BY_ME'>('ALL');
  const [filterPaid, setFilterPaid] = useState<'ALL' | 'PAID' | 'UNPAID'>('UNPAID');

  const fetchCategories = useCallback(async () => {
    try {
      const response = await accountsApi.getAll();
      if (response.success && response.data) {
        setCategories(response.data.accounts);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  }, []);

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (filterType !== 'ALL') filters.type = filterType;
      if (filterPaid === 'PAID') filters.isPaid = true;
      if (filterPaid === 'UNPAID') filters.isPaid = false;

      const response = await debtsApi.getAll(filters);
      if (response.success && response.data) {
        setDebts(response.data.debts);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Failed to load debts:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterPaid]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const data = {
        personName,
        amount: parseFloat(amount),
        description,
        type,
        categoryId: categoryId || undefined,
        dueDate: dueDate || undefined,
      };

      if (editingDebt) {
        await debtsApi.update(editingDebt.id, data);
      } else {
        await debtsApi.create(data);
      }

      resetForm();
      fetchDebts();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save debt');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setPersonName(debt.personName);
    setAmount((debt.amountCents / 100).toString());
    setDescription(debt.description);
    setType(debt.type);
    setDueDate(debt.dueDate ? debt.dueDate.split('T')[0] : '');
    setShowForm(true);
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await debtsApi.markPaid(id);
      fetchDebts();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to mark as paid');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this debt?')) return;

    try {
      await debtsApi.delete(id);
      fetchDebts();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete debt');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDebt(null);
    setPersonName('');
    setAmount('');
    setDescription('');
    setType('OWED_TO_ME');
    setCategoryId('');
    setDueDate('');
    setError('');
  };

  if (loading && !summary) {
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
          Debts & IOUs
        </h1>
        <p className="text-slate-600">Track money owed to you and money you owe to others.</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <h3 className="text-sm font-medium text-emerald-700 mb-2">Owed to Me</h3>
            <p className="text-3xl font-display font-bold text-emerald-600">
              {summary.owedToMeTotalFormatted}
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-rose-200">
            <h3 className="text-sm font-medium text-rose-700 mb-2">Owed by Me</h3>
            <p className="text-3xl font-display font-bold text-rose-600">
              {summary.owedByMeTotalFormatted}
            </p>
          </Card>

          <Card className={`bg-gradient-to-br ${
            summary.netCents >= 0
              ? 'from-blue-50 to-indigo-50 border-blue-200'
              : 'from-amber-50 to-orange-50 border-amber-200'
          }`}>
            <h3 className={`text-sm font-medium mb-2 ${
              summary.netCents >= 0 ? 'text-blue-700' : 'text-amber-700'
            }`}>
              Net Balance
            </h3>
            <p className={`text-3xl font-display font-bold ${
              summary.netCents >= 0 ? 'text-blue-600' : 'text-amber-600'
            }`}>
              {summary.netCents >= 0 ? '+' : ''}{summary.netFormatted}
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {summary.netCents >= 0 ? 'You are owed more' : 'You owe more'}
            </p>
          </Card>
        </div>
      )}

      {/* Filters and Add Button */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setShowForm(true)}
          style={{ padding: '10px 20px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Add Debt/IOU
        </button>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px' }}>Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            style={{ padding: '8px' }}
          >
            <option value="ALL">All</option>
            <option value="OWED_TO_ME">Owed to Me</option>
            <option value="OWED_BY_ME">Owed by Me</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px' }}>Status:</label>
          <select
            value={filterPaid}
            onChange={(e) => setFilterPaid(e.target.value as any)}
            style={{ padding: '8px' }}
          >
            <option value="ALL">All</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: 'white' }}>
          <h2>{editingDebt ? 'Edit Debt' : 'Add New Debt/IOU'}</h2>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Person Name:</label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px' }}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Amount ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Type:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="OWED_TO_ME">They Owe Me</option>
                  <option value="OWED_BY_ME">I Owe Them</option>
                </select>
              </div>

              {type === 'OWED_TO_ME' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Category (optional):
                    <small style={{ color: '#666', marginLeft: '5px' }}>
                      Money will be deducted when lending, added back when repaid
                    </small>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value="">None - Don't track in categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.balanceFormatted} available)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Due Date (optional):</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                style={{ width: '100%', padding: '8px' }}
                placeholder="e.g., Loan for car repair"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" disabled={formLoading} style={{ padding: '10px 20px' }}>
                {formLoading ? 'Saving...' : editingDebt ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} style={{ padding: '10px 20px', background: '#ccc' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Debts List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : debts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No debts found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {debts.map((debt) => {
            const isOverdue = debt.dueDate && !debt.isPaid && new Date(debt.dueDate) < new Date();

            return (
              <div
                key={debt.id}
                style={{
                  padding: '20px',
                  border: `2px solid ${debt.type === 'OWED_TO_ME' ? '#4CAF50' : '#f44336'}`,
                  borderRadius: '8px',
                  background: debt.isPaid ? '#f5f5f5' : 'white',
                  opacity: debt.isPaid ? 0.7 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0 }}>{debt.personName}</h3>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: debt.type === 'OWED_TO_ME' ? '#e8f5e9' : '#ffebee',
                    color: debt.type === 'OWED_TO_ME' ? '#2e7d32' : '#c62828'
                  }}>
                    {debt.type === 'OWED_TO_ME' ? 'OWES ME' : 'I OWE'}
                  </span>
                </div>

                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0', color: debt.type === 'OWED_TO_ME' ? '#4CAF50' : '#f44336' }}>
                  {debt.amountFormatted}
                </p>

                <p style={{ margin: '10px 0', color: '#666' }}>{debt.description}</p>

                {debt.dueDate && (
                  <p style={{ margin: '5px 0', fontSize: '14px', color: isOverdue ? '#f44336' : '#666' }}>
                    Due: {new Date(debt.dueDate).toLocaleDateString()}
                    {isOverdue && ' ⚠️ OVERDUE'}
                  </p>
                )}

                {debt.isPaid && (
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#4CAF50', fontWeight: 'bold' }}>
                    ✓ PAID
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                  {!debt.isPaid && (
                    <>
                      <button
                        onClick={() => handleMarkPaid(debt.id)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => handleEdit(debt)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Edit
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(debt.id)}
                    style={{
                      flex: debt.isPaid ? 1 : 0,
                      padding: '8px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}
