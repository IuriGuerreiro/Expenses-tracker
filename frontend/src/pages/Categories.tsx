import React, { useState, useEffect } from 'react';
import { categoriesApi } from '../api/categories';
import type { Category } from '../types';
import Navbar from '../components/Navbar';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [allocationPercentage, setAllocationPercentage] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [reduceFromCategoryId, setReduceFromCategoryId] = useState('');
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showReduceFromSelector, setShowReduceFromSelector] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      if (response.success && response.data) {
        setCategories(response.data.categories);
        setTotalAllocation(response.data.totalAllocationPercentage);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocationChange = (value: string) => {
    setAllocationPercentage(value);
    const requested = parseInt(value) || 0;
    const remaining = 100 - totalAllocation;

    // Check if we need to show the reduce-from selector
    if (requested > remaining) {
      const defaultCat = categories.find(c => c.isDefault);
      const needsReduction = requested - remaining;

      // If there's no default category or default can't cover it, show selector
      if (!defaultCat || defaultCat.allocationPercentage < needsReduction) {
        setShowReduceFromSelector(true);
      } else {
        setShowReduceFromSelector(false);
        setReduceFromCategoryId(''); // Will auto-reduce from default
      }
    } else {
      setShowReduceFromSelector(false);
      setReduceFromCategoryId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      await categoriesApi.create({
        name,
        allocationPercentage: parseInt(allocationPercentage),
        isDefault,
        reduceFromCategoryId: reduceFromCategoryId || undefined,
      });

      // Reset form
      setShowForm(false);
      setName('');
      setAllocationPercentage('');
      setIsDefault(false);
      setReduceFromCategoryId('');
      setShowReduceFromSelector(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoriesApi.delete(id);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete category');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setName('');
    setAllocationPercentage('');
    setIsDefault(false);
    setReduceFromCategoryId('');
    setShowReduceFromSelector(false);
    setError('');
  };

  const remainingAllocation = 100 - totalAllocation;
  const hasDefaultCategory = categories.some(c => c.isDefault);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Navbar />
      <h1 style={{ marginBottom: '20px' }}>Categories</h1>

      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <p>
          <strong>Total Allocation:</strong> {totalAllocation}% / 100%
          {remainingAllocation > 0 && (
            <span style={{ color: 'green', marginLeft: '10px' }}>
              ✓ {remainingAllocation}% available
            </span>
          )}
          {remainingAllocation === 0 && (
            <span style={{ color: 'green', marginLeft: '10px' }}>
              ✓ Fully allocated
            </span>
          )}
        </p>
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{ padding: '10px 20px', marginBottom: '20px' }}
        >
          Add Category
        </button>
      )}

      {showForm && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: 'white' }}>
          <h2>Add New Category</h2>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                placeholder="e.g., Groceries"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Allocation Percentage:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={allocationPercentage}
                onChange={(e) => handleAllocationChange(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
              <small style={{ color: '#666' }}>
                Available without reduction: {remainingAllocation}%
              </small>
            </div>

            {showReduceFromSelector && (
              <div style={{ marginBottom: '15px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
                <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                  Not enough allocation available. Which category should be reduced?
                </p>
                <select
                  value={reduceFromCategoryId}
                  onChange={(e) => setReduceFromCategoryId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Select category to reduce from...</option>
                  {categories.filter(c => c.allocationPercentage >= (parseInt(allocationPercentage) || 0) - remainingAllocation).map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.allocationPercentage}% available)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!hasDefaultCategory && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  <span>Make this the default category (absorbs remaining allocation automatically)</span>
                </label>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={formLoading} style={{ padding: '10px 20px' }}>
                {formLoading ? 'Creating...' : 'Create Category'}
              </button>
              <button type="button" onClick={handleCancel} style={{ padding: '10px 20px', background: '#ccc' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            style={{
              padding: '20px',
              border: '2px solid ' + (cat.isDefault ? '#4CAF50' : '#ddd'),
              borderRadius: '8px',
              background: cat.isLowBalance ? '#fff3cd' : 'white',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>{cat.name}</h3>
              {cat.isDefault && (
                <span style={{ background: '#4CAF50', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  DEFAULT
                </span>
              )}
            </div>
            <p><strong>Balance:</strong> {cat.balanceFormatted}</p>
            <p><strong>Allocation:</strong> {cat.allocationPercentage}%</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={() => handleDelete(cat.id)}
                style={{ flex: 1, padding: '8px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No categories yet. Create your first category!</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Tip: Create a default category with 100% allocation first. Future categories will automatically reduce from it.
          </p>
        </div>
      )}
    </div>
  );
}
