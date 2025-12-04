import React from 'react';
import { Card } from '../ui/Card';
import type { Account } from '../../types';

interface AccountCardProps {
  account: Account;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const balanceAmount = account.balanceCents / 100;
  const percentage = account.allocationPercentage;

  // Calculate health color based on balance
  const getHealthColor = () => {
    if (balanceAmount < 0) return 'bg-rose-500';
    if (balanceAmount < 50) return 'bg-amber-500';
    return 'bg-success';
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-display font-semibold text-slate-900">
            {account.name}
          </h3>
          {account.isDefault && (
            <span className="text-xs text-primary-600 font-medium">Default</span>
          )}
        </div>
        <span className="text-sm text-slate-500">{percentage}%</span>
      </div>

      <p className="text-3xl font-display font-bold text-slate-900 mb-4">
        ${balanceAmount.toFixed(2)}
      </p>

      {/* Balance Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${getHealthColor()} transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </Card>
  );
};
