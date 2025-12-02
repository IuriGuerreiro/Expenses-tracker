import React, { useState, useEffect } from 'react';
import { transactionsApi } from '../api/transactions';
import { categoriesApi } from '../api/categories';
import type { Transaction, Category } from '../types';
import Navbar from '../components/Navbar';
import IncomeForm from '../components/transactions/IncomeForm';
import ExpenseForm from '../components/transactions/ExpenseForm';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filterType, filterCategory, filterStartDate, filterEndDate, searchTerm, page]);

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

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Build filter params
      const params: any = {
        page,
        limit,
      };

      if (filterType !== 'ALL') params.type = filterType;
      if (filterCategory) params.categoryId = filterCategory;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (searchTerm) params.search = searchTerm;

      // Use the all transactions endpoint
      const response = await fetch(`/api/v1/visualizations/all-transactions?${new URLSearchParams(params)}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.data) {
        setTransactions(data.data.transactions || []);
        setTotal(data.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transaction: Transaction) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      if (transaction.type === 'INCOME') {
        await transactionsApi.deleteIncome(transaction.id);
      } else {
        await transactionsApi.deleteExpense(transaction.id);
      }
      fetchTransactions();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to delete transaction');
    }
  };

  const resetFilters = () => {
    setFilterType('ALL');
    setFilterCategory('');
    setFilterStartDate('');
    setFilterEndDate('');
    setSearchTerm('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Navbar />
      <h1 style={{ marginBottom: '20px' }}>Transactions</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setShowIncomeForm(true)}
          style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Add Income
        </button>
        <button
          onClick={() => setShowExpenseForm(true)}
          style={{ padding: '10px 20px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="ALL">All</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Start Date:</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>End Date:</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description..."
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={resetFilters}
              style={{ width: '100%', padding: '8px', background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div style={{ marginBottom: '15px' }}>
        <p style={{ color: '#666' }}>
          Showing {transactions.length} of {total} transactions
        </p>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      ) : transactions.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <p>No transactions found.</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd', background: '#f9f9f9' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      {new Date(t.transactionDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: t.type === 'INCOME' ? '#e8f5e9' : '#ffebee',
                        color: t.type === 'INCOME' ? '#2e7d32' : '#c62828'
                      }}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{t.categoryName || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      {t.type === 'INCOME' ? t.sourceDescription : t.description}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: t.type === 'INCOME' ? 'green' : 'red'
                    }}>
                      {t.type === 'INCOME' ? '+' : '-'}{t.amountFormatted}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(t)}
                        style={{
                          padding: '6px 12px',
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  background: page === 1 ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 16px',
                  background: page === totalPages ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showIncomeForm && (
        <IncomeForm
          onClose={() => setShowIncomeForm(false)}
          onSuccess={() => {
            setShowIncomeForm(false);
            fetchTransactions();
          }}
        />
      )}

      {showExpenseForm && (
        <ExpenseForm
          onClose={() => setShowExpenseForm(false)}
          onSuccess={() => {
            setShowExpenseForm(false);
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}
