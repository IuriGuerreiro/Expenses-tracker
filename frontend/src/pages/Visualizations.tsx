import React, { useState, useEffect } from 'react';
import { visualizationsApi } from '../api/visualizations';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

export default function Visualizations() {
  const [spendingByCategory, setSpendingByCategory] = useState<any[]>([]);
  const [spendingOverTime, setSpendingOverTime] = useState<any[]>([]);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeGrouping, setTimeGrouping] = useState<'day' | 'week' | 'month'>('month');
  const [incomeVsGrouping, setIncomeVsGrouping] = useState<'week' | 'month'>('month');

  useEffect(() => {
    fetchAllData();
  }, [startDate, endDate, timeGrouping, incomeVsGrouping]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [categoryData, timeData, incomeVsData] = await Promise.all([
        visualizationsApi.spendingByCategory(startDate, endDate),
        visualizationsApi.spendingOverTime(startDate, endDate, timeGrouping),
        visualizationsApi.incomeVsExpenses(startDate, endDate, incomeVsGrouping),
      ]);

      if (categoryData.success && categoryData.data) {
        // API returns { categories: [...], summary: {...} }
        setSpendingByCategory(categoryData.data.categories || []);
      }

      if (timeData.success && timeData.data) {
        // API returns { timeSeries: [...], summary: {...} }
        setSpendingOverTime(timeData.data.timeSeries || []);
      }

      if (incomeVsData.success && incomeVsData.data) {
        // API returns { timeSeries: [...], summary: {...} }
        setIncomeVsExpenses(incomeVsData.data.timeSeries || []);
      }
    } catch (error) {
      console.error('Failed to load visualizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${(value / 100).toFixed(2)}`;
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading visualizations...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Navbar />
      <h1 style={{ marginBottom: '20px' }}>Visualizations</h1>

      {/* Date Range Filter */}
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Date Range Filter</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '8px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              style={{
                padding: '8px 16px',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Dates
            </button>
          </div>
        </div>
      </div>

      {/* Spending by Category - Pie Chart */}
      <div style={{ marginBottom: '40px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Spending by Category</h2>
        {spendingByCategory.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No spending data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={spendingByCategory}
                dataKey="totalSpentCents"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius={150}
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

      {/* Spending Over Time - Line Chart */}
      <div style={{ marginBottom: '40px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Spending Over Time</h2>
          <div>
            <label style={{ marginRight: '10px' }}>Group by:</label>
            <select
              value={timeGrouping}
              onChange={(e) => setTimeGrouping(e.target.value as any)}
              style={{ padding: '6px 12px' }}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>
        {spendingOverTime.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No spending data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={spendingOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="totalSpentCents" stroke="#8884d8" name="Total Spending" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Income vs Expenses - Bar Chart */}
      <div style={{ marginBottom: '40px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Income vs Expenses</h2>
          <div>
            <label style={{ marginRight: '10px' }}>Group by:</label>
            <select
              value={incomeVsGrouping}
              onChange={(e) => setIncomeVsGrouping(e.target.value as any)}
              style={{ padding: '6px 12px' }}
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>
        {incomeVsExpenses.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
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
  );
}
