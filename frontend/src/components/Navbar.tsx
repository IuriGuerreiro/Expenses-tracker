import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      padding: '15px 0',
      borderBottom: '2px solid #e0e0e0'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/dashboard" style={{
          fontSize: '20px',
          fontWeight: 'bold',
          textDecoration: 'none',
          color: '#2196F3'
        }}>
          ExpensesTracker
        </Link>
      </div>
      <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333', padding: '5px 10px' }}>
          Dashboard
        </Link>
        <Link to="/categories" style={{ textDecoration: 'none', color: '#333', padding: '5px 10px' }}>
          Categories
        </Link>
        <Link to="/transactions" style={{ textDecoration: 'none', color: '#333', padding: '5px 10px' }}>
          Transactions
        </Link>
        <Link to="/debts" style={{ textDecoration: 'none', color: '#333', padding: '5px 10px' }}>
          Debts
        </Link>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          Logout
        </button>
      </nav>
    </div>
  );
}
