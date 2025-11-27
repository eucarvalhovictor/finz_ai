import React, { useState, useEffect, useCallback } from 'react';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getCategories, getCreditCards } from '../services/api';
import type { AppUser, Transaction, CreditCard } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import { EditIcon, DeleteIcon, PlusIcon } from '../components/icons/Icons';

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

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [transData, catData, cardData] = await Promise.all([
        getTransactions(user.id),
        getCategories(user.id),
        getCreditCards(user.id)
      ]);
      setTransactions(transData);
      setCategories(catData);
      setCreditCards(cardData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

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
      await fetchAllData(); // Refetch data
    } catch (error) {
      console.error('Failed to save transaction', error);
    }
  };
  
  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(id);
        await fetchAllData(); // Refetch data
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">Transações</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova Transação
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Descrição</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider hidden md:table-cell">Categoria</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">Data</th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">Pagamento</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{t.description}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${t.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'INCOME' ? '+ ' : '- '}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary hidden md:table-cell">{t.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary hidden sm:table-cell">{formatDate(t.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary hidden sm:table-cell">{t.payment_method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleOpenModal(t)} className="text-blue-400 hover:text-blue-300"><EditIcon className="h-5 w-5" /></button>
                        <button onClick={() => handleDeleteTransaction(t.id)} className="text-red-400 hover:text-red-300"><DeleteIcon className="h-5 w-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && <p className="text-center text-text-secondary py-8">Nenhuma transação encontrada.</p>}
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