import React, { useState, useEffect } from 'react';
import { expenseCategoriesApi, type CreateExpenseCategoryData } from '../api/expenseCategories';
import type { ExpenseCategory } from '../types';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function ExpenseCategories() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await expenseCategoriesApi.getAll();
      if (response.success && response.data) {
        setCategories(response.data.expenseCategories);
      }
    } catch (error) {
      console.error('Failed to load expense categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (editingId) {
        await expenseCategoriesApi.update(editingId, { name });
      } else {
        await expenseCategoriesApi.create({ name });
      }

      // Reset form
      setShowForm(false);
      setEditingId(null);
      setName('');
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingId(category.id);
    setName(category.name);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense category?')) return;

    try {
      await expenseCategoriesApi.delete(id);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete category');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setError('');
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

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
          Expense Categories
        </h1>
        <p className="text-slate-600">Organize your expenses with custom categories.</p>
      </div>

      {/* Category Summary */}
      <Card className="mb-8 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-slate-900 mb-2">
              Total Categories
            </h3>
            <p className="text-4xl font-display font-bold text-rose-600">{categories.length}</p>
          </div>
          <div className="text-6xl">🏷️</div>
        </div>
        <p className="text-sm text-slate-600 mt-4">
          Categories help you track and analyze where your money goes. Create categories like "Groceries", "Transportation", "Entertainment", etc.
        </p>
      </Card>

      {/* Add/Edit Form Button */}
      {!showForm && (
        <div className="mb-8">
          <Button variant="primary" size="md" onClick={() => setShowForm(true)}>
            Add New Category
          </Button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-8">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Groceries, Transportation, Entertainment"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" size="md" disabled={formLoading}>
                {formLoading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Category' : 'Create Category')}
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-semibold text-slate-900">{category.name}</h3>
              <span className="text-2xl">🏷️</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEdit(category)}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(category.id)}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-slate-600 text-lg mb-2">No expense categories yet. Create your first one!</p>
          <p className="text-sm text-slate-500">
            Tip: Start with common categories like "Food", "Transportation", "Housing", and "Entertainment".
          </p>
        </Card>
      )}
    </MainLayout>
  );
}
