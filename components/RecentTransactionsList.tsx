import React from 'react';
import { Transaction } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './icons/Icons';

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({ transactions }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  return (
    <div className="bg-card p-6 rounded-2xl border border-border h-full">
      <h3 className="text-xl font-bold text-text-primary mb-6">Últimas Transações</h3>
      {transactions.length > 0 ? (
        <ul className="space-y-5">
          {transactions.map((t) => (
            <li key={t.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-4 ${t.type === 'INCOME' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {t.type === 'INCOME' ? <ArrowUpIcon className="h-5 w-5 text-green-400" /> : <ArrowDownIcon className="h-5 w-5 text-red-400" />}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{t.description}</p>
                  <p className="text-sm text-text-secondary">{formatDate(t.date)} - {t.category}</p>
                </div>
              </div>
              <p className={`font-bold text-base ${t.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(t.amount)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-text-secondary">Nenhuma transação recente encontrada.</p>
        </div>
      )}
    </div>
  );
};

export default RecentTransactionsList;