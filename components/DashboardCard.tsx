import React from 'react';

interface DashboardCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  colorClass: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, amount, icon, colorClass }) => {
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);

  return (
    <div className="bg-card p-4 md:p-6 rounded-2xl border border-border">
      <div className="flex items-center justify-between">
        <p className="text-text-secondary font-medium">{title}</p>
        <div className={`p-1.5 md:p-2 rounded-full ${colorClass}`}>
          {icon}
        </div>
      </div>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mt-4">{formattedAmount}</p>
    </div>
  );
};

export default DashboardCard;