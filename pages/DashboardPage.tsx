import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getTransactions, getProfile, getCategories, getCreditCards, addTransaction } from '../services/api';
import type { AppUser, Transaction, MonthlySummary, CreditCard } from '../types';
import DashboardCard from '../components/DashboardCard';
import MonthlySummaryChart from '../components/charts/MonthlySummaryChart';
import RecentTransactionsList from '../components/RecentTransactionsList';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import { TrendingUp, TrendingDown, DollarSign, PlusIcon, WalletIcon } from 'lucide-react';
import PaymentMethodChart from '../components/charts/PaymentMethodChart'; // NOVO

interface DashboardPageProps {
  user: AppUser;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    let isMounted = true;
    
    const safetyTimeout = setTimeout(() => {
        if (isMounted && loading) {
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
        await fetchDashboardData(); 
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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-xs md:text-sm text-text-secondary mt-0.5">Olá, {userName}!</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center bg-brand-primary text-black font-bold py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-glow hover:bg-brand-secondary transition-all transform hover:scale-105 duration-300 ease-in-out"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <DashboardCard 
            title="Patrimônio" 
            amount={totalInvestments} 
            icon={<WalletIcon size={20} className="text-brand-primary" />} 
            colorClass="bg-brand-primary/20" 
        />
        <DashboardCard 
            title="Saldo Total" 
            amount={balance} 
            icon={<DollarSign size={20} className="text-blue-300" />} 
            colorClass="bg-blue-500/20" 
        />
        <DashboardCard 
            title="Receitas" 
            amount={totalIncome} 
            icon={<TrendingUp size={20} className="text-green-300" />} 
            colorClass="bg-green-500/20" 
        />
        <DashboardCard 
            title="Despesas" 
            amount={totalExpenses} 
            icon={<TrendingDown size={20} className="text-red-300" />} 
            colorClass="bg-red-500/20" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        <div className="lg:col-span-3 min-w-0">
          <MonthlySummaryChart data={monthlySummaryData} />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactionsList transactions={transactions.slice(0, 5)} />
        </div>
      </div>
      
      {/* Novo Gráfico: Gastos por Meio de Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 md:gap-6">
        <div className="lg:col-span-1">
            <PaymentMethodChart transactions={transactions} />
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