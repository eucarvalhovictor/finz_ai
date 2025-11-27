import React, { useState, useEffect, useCallback } from 'react';
import { getCreditCards, addCreditCard, deleteCreditCard, getProfile } from '../services/api';
import type { AppUser, CreditCard, Role } from '../types';
import { CreditCardIcon, PlusIcon, DeleteIcon } from '../components/icons/Icons';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';

interface CreditCardsPageProps {
  user: AppUser;
}

const CreditCardForm: React.FC<{ onSave: (card: Omit<CreditCard, 'id'|'created_at'|'user_id'>) => void; userId: string; }> = ({ onSave, userId }) => {
    const [name, setName] = useState('');
    const [lastFour, setLastFour] = useState('');
    const [bank, setBank] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, last_four_digits: lastFour, bank });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Apelido do Cartão (Ex: Nubank Pessoal)</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-background border-border rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm p-3 text-text-primary rounded-xl border" />
            </div>
            <div>
                <label htmlFor="lastFour" className="block text-sm font-medium text-text-secondary">Últimos 4 dígitos</label>
                <input type="text" id="lastFour" value={lastFour} onChange={e => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} required className="mt-1 block w-full bg-background border-border rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm p-3 text-text-primary rounded-xl border" />
            </div>
            <div>
                <label htmlFor="bank" className="block text-sm font-medium text-text-secondary">Banco Emissor</label>
                <input type="text" id="bank" value={bank} onChange={e => setBank(e.target.value)} required className="mt-1 block w-full bg-background border-border rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm p-3 text-text-primary rounded-xl border" />
            </div>
            <div className="flex justify-end">
                <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-4 rounded-xl transition-colors">Salvar Cartão</button>
            </div>
        </form>
    )
}

const CreditCardsPage: React.FC<CreditCardsPageProps> = ({ user }) => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<Role>('basic');

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const [cardsData, profileData] = await Promise.all([
          getCreditCards(user.id),
          getProfile(user.id)
      ]);
      setCards(cardsData);
      if (profileData) setUserRole(profileData.role);
    } catch(error) {
      console.error("Failed to fetch cards", error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleSaveCard = async (cardData: Omit<CreditCard, 'id'|'created_at'|'user_id'>) => {
    try {
      await addCreditCard({ ...cardData, user_id: user.id });
      setIsModalOpen(false);
      await fetchCards();
    } catch (error) {
      console.error("Failed to save card", error);
    }
  }

  const handleDeleteCard = async (cardId: string) => {
      if (window.confirm("Tem certeza que deseja excluir este cartão? Todas as transações associadas a ele perderão o vínculo.")) {
          try {
              await deleteCreditCard(cardId);
              await fetchCards();
          } catch (error) {
              console.error("Failed to delete card", error);
          }
      }
  }

  const handleAddCardClick = () => {
      const limit = userRole === 'basic' ? 1 : userRole === 'pro' ? 5 : 999;
      if (cards.length >= limit) {
          alert(`Seu plano (${userRole.toUpperCase()}) permite apenas ${limit} cartão(ões). Atualize seu plano para adicionar mais.`);
          return;
      }
      setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-text-primary">Meus Cartões de Crédito</h1>
            <p className="text-text-secondary text-sm mt-1">
                Plano Atual: <span className="font-bold text-brand-primary uppercase">{userRole}</span> 
                (Usando {cards.length} de {userRole === 'basic' ? 1 : userRole === 'pro' ? 5 : '∞'} slots)
            </p>
        </div>
        <button onClick={handleAddCardClick} className="flex items-center bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-4 rounded-lg transition-colors">
            <PlusIcon className="h-5 w-5 mr-2" />
            Adicionar Cartão
        </button>
      </div>
      
      {loading ? <Spinner /> : (
        cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map(card => (
              <div key={card.id} className="bg-card p-6 rounded-2xl border border-border shadow-lg flex flex-col justify-between hover:border-brand-primary transition-colors">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-text-primary">{card.name}</h3>
                    <CreditCardIcon className="h-8 w-8 text-brand-primary" />
                  </div>
                  <p className="text-text-secondary mt-1">{card.bank}</p>
                  <p className="font-mono text-lg text-text-primary mt-4 tracking-widest">**** **** **** {card.last_four_digits}</p>
                </div>
                <div className="text-right mt-4">
                  <button onClick={() => handleDeleteCard(card.id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition">
                      <DeleteIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card p-6 rounded-xl border border-border shadow-lg min-h-[50vh] flex flex-col justify-center items-center">
            <div className="text-center text-text-secondary">
              <CreditCardIcon className="h-16 w-16 mx-auto mb-4 text-brand-primary" />
              <h2 className="text-xl font-bold text-text-primary">Nenhum cartão cadastrado</h2>
              <p className="mt-2 max-w-xl mx-auto">
                Adicione seus cartões de crédito para facilitar o lançamento de despesas.
              </p>
            </div>
          </div>
        )
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Novo Cartão">
          <CreditCardForm onSave={handleSaveCard} userId={user.id} />
      </Modal>
    </div>
  );
};

export default CreditCardsPage;