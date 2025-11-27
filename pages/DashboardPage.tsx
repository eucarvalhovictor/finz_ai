import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getTransactions, getProfile, getCategories, getCreditCards, addTransaction, updateTransaction } from '../services/api';
import type { AppUser, Transaction, MonthlySummary, CreditCard, Profile } from '../types';
import DashboardCard from '../components/DashboardCard';
import MonthlySummaryChart from '../components/charts/MonthlySummaryChart';
import RecentTransactionsList from '../components/RecentTransactionsList';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import { TrendingUp, TrendingDown, DollarSign, PlusIcon, WalletIcon } from 'lucide-react';

interface DashboardPageProps {
  user: AppUser;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // State for the new transaction modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);


  const fetchDashboardData = useCallback(async () => {
    let isMounted = true;
    
    // Safety timeout: if data fetching takes more than 8 seconds, force stop loading
    const safetyTimeout = setTimeout(() => {
        if (isMounted && loading) {
            console.warn("Dashboard data fetch timed out.");
            setLoading(false);
        }
    }, 8000);

    try {
        setLoading(true);
        const [transData, profileData, catData, cardData] = await Promise.all([
            getTransactions(user.id),
            getProfile(user.id),
            getCategories(user.id),
            getCreditCards(user.id)
        ]);
        
        if (isMounted) {
            setTransactions(transData);
            setCategories(catData);
            setCreditCards(cardData);

            if (profileData) {
                const name = [profileData.first_name, profileData.last_name].filter(Boolean).join(' ');
                setUserName(name || user.email?.split('@')[0] || 'Usuário');
            } else {
                setUserName(user.email?.split('@')[0] || 'Usuário');
            }
        }

    } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        if (isMounted) setUserName(user.email?.split('@')[0] || 'Usuário');
    } finally {
        clearTimeout(safetyTimeout);
        if (isMounted) setLoading(false);
    }
  }, [user.id, user.email]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSaveTransaction = async (
    transactionData: Omit<Transaction, 'id' | 'created_at' | 'user_id'>,
  ) => {
    try {
        const fullTransactionData = { ...transactionData, user_id: user.id };
        await addTransaction(fullTransactionData);
        setIsModalOpen(false);
        await fetchDashboardData(); // Refetch all data
    } catch (error) {
      console.error('Failed to save transaction from dashboard', error);
    }
  };

  const { totalIncome, totalExpenses, balance, totalInvestments } = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'INCOME') {
          acc.totalIncome += t.amount;
        } else {
          acc.totalExpenses += t.amount;
        }
        acc.balance = acc.totalIncome - acc.totalExpenses;

        // Calculate Net Worth based only on "Investimentos" category transactions
        // Assuming Investment is an Expense flow that goes to an Asset
        if (t.category === 'Investimentos') {
            acc.totalInvestments += t.amount;
        }

        return acc;
      },
      { totalIncome: 0, totalExpenses: 0, balance: 0, totalInvestments: 0 }
    );
  }, [transactions]);

  const monthlySummaryData = useMemo((): MonthlySummary[] => {
    const months: { [key: string]: { income: number, expense: number } } = {};
    const ptMonths = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    transactions.forEach(t => {
      const date = new Date(t.date + 'T00:00:00');
      const monthKey = `${ptMonths[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expense: 0 };
      }

      if (t.type === 'INCOME') {
        months[monthKey].income += t.amount;
      } else {
        months[monthKey].expense += t.amount;
      }
    });
    
    const sortedKeys = Object.keys(months).sort((a, b) => {
        const [aMon, aYear] = a.split('/');
        const [bMon, bYear] = b.split('/');
        const aDate = new Date(parseInt('20' + aYear), ptMonths.indexOf(aMon));
        const bDate = new Date(parseInt('20' + bYear), ptMonths.indexOf(bMon));
        return aDate.getTime() - bDate.getTime();
    });

    return sortedKeys.slice(-6).map(key => ({
        month: key,
        income: months[key].income,
        expense: months[key].expense
    }));
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Bem-vindo(a) de volta, {userName}!</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center bg-brand-primary text-black font-bold py-3 px-6 rounded-xl text-lg shadow-md hover:shadow-glow hover:bg-brand-secondary transition-all transform hover:scale-105 duration-300 ease-in-out"
        >
          <PlusIcon className="h-6 w-6 mr-2" />
          Adicionar Transação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <DashboardCard 
            title="Patrimônio Líquido" 
            amount={totalInvestments} 
            icon={<WalletIcon size={24} className="text-brand-primary" />} 
            colorClass="bg-brand-primary/20" 
        />
        <DashboardCard 
            title="Saldo Total" 
            amount={balance} 
            icon={<DollarSign size={24} className="text-blue-300" />} 
            colorClass="bg-blue-500/20" 
        />
        <DashboardCard 
            title="Receitas Totais" 
            amount={totalIncome} 
            icon={<TrendingUp size={24} className="text-green-300" />} 
            colorClass="bg-green-500/20" 
        />
        <DashboardCard 
            title="Despesas Totais" 
            amount={totalExpenses} 
            icon={<TrendingDown size={24} className="text-red-300" />} 
            colorClass="bg-red-500/20" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <MonthlySummaryChart data={monthlySummaryData} />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactionsList transactions={transactions.slice(0, 5)} />
        </div>
      </div>
      
       <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Transação"
      >
        <TransactionForm
          onSave={handleSaveTransaction}
          onClose={() => setIsModalOpen(false)}
          userId={user.id}
          categories={categories}
          creditCards={creditCards}
        />
      </Modal>
    </div>
  );
};

export default DashboardPage;