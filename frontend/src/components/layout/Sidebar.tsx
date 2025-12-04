import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/transactions', label: 'Transactions', icon: '💸' },
  { path: '/accounts', label: 'Accounts', icon: '💳' },
  { path: '/categories', label: 'Categories', icon: '🏷️' },
  { path: '/debts', label: 'Debts', icon: '💰' },
  { path: '/visualizations', label: 'Visualizations', icon: '📊' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-72 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 flex flex-col">
      {/* Logo/Brand */}
      <div className="px-6 py-6 border-b border-slate-200">
        <h1 className="text-2xl font-display font-bold text-primary-600">
          ExpensesTracker
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-6 py-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="text-slate-600 font-medium">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">A. User</p>
            <p className="text-xs text-slate-500">View Profile</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-sm text-slate-600 hover:text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};
