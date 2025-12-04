import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard';
import { visualizationsApi } from '../api/visualizations';
import type { DashboardData } from '../types';
import { MainLayout } from '../components/layout/MainLayout';
import { SafeToSpendCard } from '../components/dashboard/SafeToSpendCard';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { AccountCard } from '../components/dashboard/AccountCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import IncomeForm from '../components/transactions/IncomeForm';
import ExpenseForm from '../components/transactions/ExpenseForm';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // Visualization data
  const [spendingByCategory, setSpendingByCategory] = useState<any[]>([]);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard();
    fetchVisualizations();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardApi.get();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisualizations = async () => {
    try {
      const [categoryData, incomeVsData] = await Promise.all([
        visualizationsApi.spendingByCategory(),
        visualizationsApi.incomeVsExpenses(undefined, undefined, 'month'),
      ]);

      if (categoryData.success && categoryData.data) {
        setSpendingByCategory(categoryData.data.categories || []);
      }

      if (incomeVsData.success && incomeVsData.data) {
        setIncomeVsExpenses(incomeVsData.data.timeSeries || []);
      }
    } catch (error) {
      console.error('Failed to load visualizations:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${(value / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">No data available</p>
        </div>
      </MainLayout>
    );
  }

  const safeToSpend = data.summary.totalBalanceCents || 0;
  const monthlyIncome = 0; // TODO: Add monthly income to dashboard API
  const monthlyExpenses = 0; // TODO: Add monthly expenses to dashboard API

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SafeToSpendCard amount={safeToSpend} />
        </div>
        <div className="space-y-4">
          <SummaryCard title="Income (Month)" amount={monthlyIncome} type="income" />
          <SummaryCard title="Spent (Month)" amount={monthlyExpenses} type="expense" />
        </div>
      </div>

      {/* Accounts Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-slate-900">
            Your Accounts
          </h2>
          <div className="space-x-3">
            <Button variant="secondary" size="sm" onClick={() => setShowIncomeForm(true)}>
              Add Income
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowExpenseForm(true)}>
              Add Expense
            </Button>
          </div>
        </div>

        {data.summary.lowBalanceAccounts > 0 && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            ⚠️ {data.summary.lowBalanceAccounts} account(s) have low or zero balance
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">
          Recent Transactions
        </h2>
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
                {data.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  data.recentTransactions.map((t) => (
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
        </Card>
      </div>

      {/* Analytics Section */}
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">
          Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending by Category - Pie Chart */}
          <Card>
            <h3 className="text-lg font-display font-semibold text-slate-900 mb-4">
              Spending by Expense Category
            </h3>
            {spendingByCategory.length === 0 ? (
              <p className="text-center text-slate-500 py-12">No spending data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                {/* @ts-ignore - Recharts React 19 compatibility issue */}
                <PieChart>
                  {/* @ts-ignore - Recharts React 19 compatibility issue */}
                  <Pie
                    data={spendingByCategory}
                    dataKey="totalSpentCents"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={(entry) => `${entry.categoryName}: ${formatCurrency(entry.totalSpentCents)}`}
                  >
                    {spendingByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Income vs Expenses - Bar Chart */}
          <Card>
            <h3 className="text-lg font-display font-semibold text-slate-900 mb-4">
              Income vs Expenses (Monthly)
            </h3>
            {incomeVsExpenses.length === 0 ? (
              <p className="text-center text-slate-500 py-12">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={incomeVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="incomeCents" fill="#10b981" name="Income" />
                  <Bar dataKey="expensesCents" fill="#f43f5e" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>

      {showIncomeForm && (
        <IncomeForm
          onClose={() => setShowIncomeForm(false)}
          onSuccess={() => {
            setShowIncomeForm(false);
            fetchDashboard();
            fetchVisualizations();
          }}
        />
      )}

      {showExpenseForm && (
        <ExpenseForm
          onClose={() => setShowExpenseForm(false)}
          onSuccess={() => {
            setShowExpenseForm(false);
            fetchDashboard();
            fetchVisualizations();
          }}
        />
      )}
    </MainLayout>
  );
}
