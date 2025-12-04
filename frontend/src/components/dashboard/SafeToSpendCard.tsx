import React from 'react';
import { Card } from '../ui/Card';

interface SafeToSpendCardProps {
  amount: number;
  description?: string;
}

export const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({
  amount,
  description = 'Available across Spending Accounts',
}) => {
  return (
    <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white" padding="lg">
      <p className="text-primary-100 text-sm font-medium uppercase tracking-wider mb-2">
        Safe to Spend
      </p>
      <h2 className="text-5xl font-display font-bold mb-2">
        ${(amount / 100).toFixed(2)}
      </h2>
      <p className="text-primary-200 text-sm">
        {description}
      </p>
    </Card>
  );
};
