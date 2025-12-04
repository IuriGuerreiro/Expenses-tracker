import React, { useState, useEffect, useCallback } from 'react';
import { transactionsApi } from '../api/transactions';
import { accountsApi } from '../api/accounts';
import { expenseCategoriesApi } from '../api/expenseCategories';
import type { Transaction, Account, ExpenseCategory } from '../types';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import IncomeForm from '../components/transactions/IncomeForm';
import ExpenseForm from '../components/transactions/ExpenseForm';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterExpenseCategory, setFilterExpenseCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchFilters = useCallback(async () => {
    try {
      const [accountsResponse, categoriesResponse] = await Promise.all([
        accountsApi.getAll(),
        expenseCategoriesApi.getAll(),
      ]);

      if (accountsResponse.success && accountsResponse.data) {
        setAccounts(accountsResponse.data.accounts);
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setExpenseCategories(categoriesResponse.data.expenseCategories);
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);

      // Build filter params
      const params: any = {
        page,
        limit,
      };

      if (filterType !== 'ALL') params.type = filterType;
      if (filterAccount) params.accountId = filterAccount;
      if (filterExpenseCategory) params.expenseCategoryId = filterExpenseCategory;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (searchTerm) params.search = searchTerm;

      const response = await transactionsApi.getExpenses(params);

      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterAccount, filterExpenseCategory, filterStartDate, filterEndDate, searchTerm, page, limit]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleResetFilters = () => {
    setFilterType('ALL');
    setFilterAccount('');
    setFilterExpenseCategory('');
    setFilterStartDate('');
    setFilterEndDate('');
    setSearchTerm('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
          Transactions
        </h1>
        <p className="text-slate-600">View and manage all your income and expense transactions.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <Button variant="secondary" size="md" onClick={() => setShowIncomeForm(true)}>
          Add Income
        </Button>
        <Button variant="primary" size="md" onClick={() => setShowExpenseForm(true)}>
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <h3 className="text-lg font-display font-semibold text-slate-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">All</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Account</label>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Expense Category</label>
            <select
              value={filterExpenseCategory}
              onChange={(e) => setFilterExpenseCategory(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Loading...</p>
        </div>
      ) : (
        <>
          <Card padding="sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Account</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Description</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {new Date(t.transactionDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              t.type === 'INCOME'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">{t.accountName || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{t.expenseCategoryName || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{t.description}</td>
                        <td
                          className={`px-4 py-3 text-sm font-medium text-right ${
                            t.type === 'INCOME' ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {t.type === 'INCOME' ? '+' : '-'}{t.amountFormatted}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-slate-200">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </Card>
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
    </MainLayout>
  );
}
