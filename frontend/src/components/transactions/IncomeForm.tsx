import React, { useState } from 'react';
import { transactionsApi } from '../../api/transactions';
import { formatDateForInput } from '../../utils/formatters';

interface IncomeFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function IncomeForm({ onClose, onSuccess }: IncomeFormProps) {
  const [amount, setAmount] = useState('');
  const [sourceDescription, setSourceDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(formatDateForInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await transactionsApi.createIncome({
        amount: parseFloat(amount),
        sourceDescription,
        transactionDate,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create income');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '400px', width: '100%' }}>
        <h2>Add Income</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          Income will be automatically allocated across all your accounts based on their allocation percentages.
        </p>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Amount ($):</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Source Description:</label>
            <input
              type="text"
              value={sourceDescription}
              onChange={(e) => setSourceDescription(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="e.g., Paycheck - Acme Corp"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Date:</label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px' }}>
              {loading ? 'Adding...' : 'Add Income'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', background: '#ccc' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
