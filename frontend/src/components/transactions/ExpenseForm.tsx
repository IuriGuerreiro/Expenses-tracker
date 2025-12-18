import React, { useState, useEffect } from 'react';
import { transactionsApi } from '../../api/transactions';
import { accountsApi } from '../../api/accounts';
import { expenseCategoriesApi } from '../../api/expenseCategories';
import type { Account, ExpenseCategory } from '../../types';
import { formatDateForInput } from '../../utils/formatters';

interface ExpenseFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExpenseForm({ onClose, onSuccess }: ExpenseFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [accountId, setAccountId] = useState('');
  const [expenseCategoryId, setExpenseCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(formatDateForInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch accounts
      try {
        const accountsResponse = await accountsApi.getAll();
        if (accountsResponse.success && accountsResponse.data) {
          setAccounts(accountsResponse.data.accounts);
        } else {
          console.error('Accounts API failed:', accountsResponse);
          setError('Failed to load accounts.');
        }
      } catch (err) {
        console.error('Failed to load accounts:', err);
        setError('Error loading accounts. Please try again.');
      }

      // Fetch categories
      try {
        const categoriesResponse = await expenseCategoriesApi.getAll();
        if (categoriesResponse.success && categoriesResponse.data) {
          setExpenseCategories(categoriesResponse.data.expenseCategories);
        }
      } catch (err) {
        console.warn('Failed to load expense categories:', err);
        // Non-blocking error for optional categories
      }
    } catch (error) {
      console.error('Unexpected error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await transactionsApi.createExpense({
        accountId,
        expenseCategoryId: expenseCategoryId || undefined,
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

  const selectedAccount = accounts.find((a) => a.id === accountId);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>Add Expense</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Account (where money comes from):</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Select account...</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.balanceFormatted} available)
                </option>
              ))}
            </select>
            {selectedAccount && (
              <small style={{ color: '#666' }}>
                Available balance: {selectedAccount.balanceFormatted}
              </small>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Expense Category (optional):</label>
            <select
              value={expenseCategoryId}
              onChange={(e) => setExpenseCategoryId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">No category</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <small style={{ color: '#666', display: 'block', marginTop: '3px' }}>
              Categories help you track spending (e.g., "Rent", "Groceries")
            </small>
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
              placeholder="e.g., Coffee shop, Monthly rent"
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
