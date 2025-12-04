import React from 'react';
import { Card } from '../ui/Card';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  type,
}) => {
  const color = type === 'income' ? 'text-success' : 'text-danger';

  return (
    <Card>
      <p className="text-slate-600 text-sm font-medium mb-2">{title}</p>
      <p className={`text-3xl font-display font-bold ${color}`}>
        ${(amount / 100).toFixed(2)}
      </p>
    </Card>
  );
};
