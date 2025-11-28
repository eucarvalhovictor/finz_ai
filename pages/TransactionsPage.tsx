import React, { useState, useEffect, useCallback } from 'react';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getCategories, getCreditCards } from '../services/api';
import type { AppUser, Transaction, CreditCard } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import { EditIcon, DeleteIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons/Icons';

interface TransactionsPageProps {
  user: AppUser;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Estados para filtro de mês
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-indexed (Jan=1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const fetchAllData = useCallback(async () => {
    let isMounted = true;
    const safetyTimeout = setTimeout(() => {
        if (isMounted && loading) setLoading(false);
    }, 8000);

    try {
      setLoading(true);
      const [transData, catData, cardData] = await Promise.all([
        getTransactions(user.id, currentMonth, currentYear), // Passa mês e ano
        getCategories(user.id),
        getCreditCards(user.id)
      ]);
      if (isMounted) {
        setTransactions(transData);
        setCategories(catData);
        setCreditCards(cardData);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      clearTimeout(safetyTimeout);
      if (isMounted) setLoading(false);
    }
  }, [user.id, currentMonth, currentYear]); // Adiciona dependências de mês e ano

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleOpenModal = (transaction?: Transaction) => {
    setEditingTransaction(transaction || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(false);
  };

  const handleSaveTransaction = async (
    transactionData: Omit<Transaction, 'id' | 'created_at'>,
    id?: string
  ) => {
    try {
      const fullTransactionData = { ...transactionData, user_id: user.id };
      if (id) {
        await updateTransaction(id, fullTransactionData);
      } else {
        await addTransaction(fullTransactionData);
      }
      handleCloseModal();
      await fetchAllData();
    } catch (error) {
      console.error('Failed to save transaction', error);
    }
  };
  
  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(id);
        await fetchAllData(); 
      } catch (error) {
        console.error('Failed to delete transaction', error);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      if (prevMonth === 1) {
        setCurrentYear(prevYear => prevYear - 1);
        return 12;
      }
      return prevMonth - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      if (prevMonth === 12) {
        setCurrentYear(prevYear => prevYear + 1);
        return 1;
      }
      return prevMonth + 1;
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-text-primary">Transações</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-3 rounded-lg text-sm transition-colors"
        >
          <PlusIcon className="h-4 w-4 md:h-5 md:w-5 mr-1" />
          Nova
        </button>
      </div>

      {/* Navegação de Mês */}
      <div className="flex items-center justify-center space-x-4 mb-4">
            <button onClick={handlePreviousMonth} className="p-2 rounded-full hover:bg-white/10 text-text-secondary" aria-label="Mês anterior">
                <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-lg font-semibold text-text-primary">
                {new Date(currentYear, currentMonth - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-white/10 text-text-secondary" aria-label="Próximo mês">
                <ChevronRightIcon className="h-5 w-5" />
            </button>
        </div>

      {loading ? <Spinner /> : (
        <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-medium text-text-secondary uppercase tracking-wider">Desc.</th>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-medium text-text-secondary uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-medium text-text-secondary uppercase tracking-wider hidden md:table-cell">Categ.</th>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">Data</th>
                   <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">Pagto</th>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-right text-[10px] md:text-xs font-medium text-text-secondary uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-800/50">
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm font-medium text-text-primary truncate max-w-[100px] md:max-w-none">{t.description}</div>
                    </td>
                    <td className={`px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm font-semibold ${t.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'INCOME' ? '+ ' : '- '}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-text-secondary hidden md:table-cell">{t.category}</td>
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-text-secondary hidden sm:table-cell">{formatDate(t.date)}</td>
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-text-secondary hidden sm:table-cell">{t.payment_method}</td>
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleOpenModal(t)} className="text-blue-400 hover:text-blue-300" aria-label="Editar transação"><EditIcon className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteTransaction(t.id)} className="text-red-400 hover:text-red-300" aria-label="Excluir transação"><DeleteIcon className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && <p className="text-center text-text-secondary py-8 text-sm">Nenhuma transação encontrada para este mês.</p>}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}
      >
        <TransactionForm
          onSave={handleSaveTransaction}
          onClose={handleCloseModal}
          existingTransaction={editingTransaction}
          userId={user.id}
          categories={categories}
          creditCards={creditCards}
        />
      </Modal>
    </div>
  );
};

export default TransactionsPage;