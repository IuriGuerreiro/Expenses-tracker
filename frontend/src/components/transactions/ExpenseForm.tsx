import React, { useState, useEffect } from 'react';
import { transactionsApi } from '../../api/transactions';
import { categoriesApi } from '../../api/categories';
import type { Category } from '../../types';
import { formatDateForInput } from '../../utils/formatters';

interface ExpenseFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExpenseForm({ onClose, onSuccess }: ExpenseFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(formatDateForInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      if (response.success && response.data) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await transactionsApi.createExpense({
        categoryId,
        amount: parseFloat(amount),
        description,
        transactionDate,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '400px', width: '100%' }}>
        <h2>Add Expense</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Category:</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.balanceFormatted} available)
                </option>
              ))}
            </select>
            {selectedCategory && (
              <small style={{ color: '#666' }}>
                Available: {selectedCategory.balanceFormatted}
              </small>
            )}
          </div>
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
            <label>Description:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="e.g., Coffee shop"
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
              {loading ? 'Adding...' : 'Add Expense'}
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
