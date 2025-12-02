import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard';
import { visualizationsApi } from '../api/visualizations';
import type { DashboardData } from '../types';
import Navbar from '../components/Navbar';
import IncomeForm from '../components/transactions/IncomeForm';
import ExpenseForm from '../components/transactions/ExpenseForm';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

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

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (!data) return <div style={{ padding: '20px' }}>No data available</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Navbar />
      <h1 style={{ marginBottom: '20px' }}>Dashboard</h1>

      <div style={{ marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Total Balance: {data.summary.totalBalanceFormatted}</h2>
        <p>Categories: {data.summary.categoryCount} | Allocation: {data.summary.totalAllocationPercentage}%</p>
        {data.summary.lowBalanceCategories > 0 && (
          <p style={{ color: 'orange' }}>⚠️ {data.summary.lowBalanceCategories} categories with low/zero balance</p>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <button onClick={() => setShowIncomeForm(true)} style={{ marginRight: '10px', padding: '10px 20px' }}>
          Add Income
        </button>
        <button onClick={() => setShowExpenseForm(true)} style={{ padding: '10px 20px' }}>
          Add Expense
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Category Balances</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {data.categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: cat.isLowBalance ? '#fff3cd' : 'white',
              }}
            >
              <h4>{cat.name}</h4>
              <p>Balance: {cat.balanceFormatted}</p>
              <p>Allocation: {cat.allocationPercentage}%</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3>Recent Transactions</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.recentTransactions.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{new Date(t.transactionDate).toLocaleDateString()}</td>
                <td style={{ padding: '10px' }}>{t.type}</td>
                <td style={{ padding: '10px' }}>{t.categoryName}</td>
                <td style={{ padding: '10px' }}>{t.description}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: t.type === 'INCOME' ? 'green' : 'red' }}>
                  {t.type === 'INCOME' ? '+' : '-'}{t.amountFormatted}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visualizations Section */}
      <div style={{ marginTop: '50px' }}>
        <h2 style={{ marginBottom: '30px' }}>Analytics</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>
          {/* Spending by Category - Pie Chart */}
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0 }}>Spending by Category</h3>
            {spendingByCategory.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No spending data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
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
          </div>

          {/* Income vs Expenses - Bar Chart */}
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0 }}>Income vs Expenses (Monthly)</h3>
            {incomeVsExpenses.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={incomeVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="incomeCents" fill="#4CAF50" name="Income" />
                  <Bar dataKey="expensesCents" fill="#f44336" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {showIncomeForm && (
        <IncomeForm
          onClose={() => setShowIncomeForm(false)}
          onSuccess={() => {
            setShowIncomeForm(false);
            fetchDashboard();
          }}
        />
      )}

      {showExpenseForm && (
        <ExpenseForm
          onClose={() => setShowExpenseForm(false)}
          onSuccess={() => {
            setShowExpenseForm(false);
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
}
