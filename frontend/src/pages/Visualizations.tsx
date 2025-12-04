import React, { useState, useEffect, useCallback } from 'react';
import { visualizationsApi } from '../api/visualizations';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

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

  const fetchAllData = useCallback(async () => {
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
  }, [startDate, endDate, timeGrouping, incomeVsGrouping]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const formatCurrency = (value: number) => {
    return `$${(value / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Loading visualizations...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
          Visualizations
        </h1>
        <p className="text-slate-600">Analyze your financial data with interactive charts and insights.</p>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-8">
        <h3 className="text-lg font-display font-semibold text-slate-900 mb-4">Date Range Filter</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
          >
            Clear Dates
          </Button>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* Spending by Category - Pie Chart */}
        <Card>
          <h2 className="text-xl font-display font-bold text-slate-900 mb-4">Spending by Category</h2>
          {spendingByCategory.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No spending data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              {/* @ts-ignore - Recharts React 19 compatibility issue */}
              <PieChart>
                {/* @ts-ignore - Recharts React 19 compatibility issue */}
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
        </Card>

        {/* Spending Over Time - Line Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-slate-900">Spending Over Time</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Group by:</label>
              <select
                value={timeGrouping}
                onChange={(e) => setTimeGrouping(e.target.value as any)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>
          {spendingOverTime.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No spending data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={spendingOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="totalSpentCents" stroke="#4f46e5" name="Total Spending" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Income vs Expenses - Bar Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-slate-900">Income vs Expenses</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Group by:</label>
              <select
                value={incomeVsGrouping}
                onChange={(e) => setIncomeVsGrouping(e.target.value as any)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>
          {incomeVsExpenses.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
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
    </MainLayout>
  );
}
