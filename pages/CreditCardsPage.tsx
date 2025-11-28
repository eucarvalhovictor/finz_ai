import React, { useState, useEffect, useCallback } from 'react';
import { getCreditCards, addCreditCard, deleteCreditCard, getProfile, updateCreditCard, getTransactionsByCardIdAndMonth } from '../services/api';
import type { AppUser, CreditCard, Role } from '../types';
import { CreditCardIcon, PlusIcon, DeleteIcon } from '../components/icons/Icons';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import CreditCardForm from '../components/CreditCardForm'; // Usar o CreditCardForm existente
import PayCreditCardModal from '../components/PayCreditCardModal'; // NOVO COMPONENTE

interface CreditCardsPageProps {
  user: AppUser;
}

const CreditCardsPage: React.FC<CreditCardsPageProps> = ({ user }) => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<Role>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false); // NOVO: Estado para modal de pagamento
  const [selectedCardToPay, setSelectedCardToPay] = useState<CreditCard | null>(null); // NOVO: Cartão selecionado para pagar

  const fetchCards = useCallback(async () => {
    let isMounted = true;
    const safetyTimeout = setTimeout(() => {
        if (isMounted && loading) setLoading(false);
    }, 8000);

    setLoading(true);
    try {
      const [cardsData, profileData] = await Promise.all([
          getCreditCards(user.id),
          getProfile(user.id)
      ]);
      if (isMounted) {
          setCards(cardsData);
          if (profileData) setUserRole(profileData.role);
      }
    } catch(error) {
      console.error("Failed to fetch cards", error);
    } finally {
      clearTimeout(safetyTimeout);
      if (isMounted) setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleSaveCard = async (cardData: Omit<CreditCard, 'id'|'created_at'|'user_id'|'limit_available'> & {limit_total: number}) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await addCreditCard({ ...cardData, user_id: user.id }); // limit_available é inicializado na API
      setIsModalOpen(false);
      await fetchCards();
    } catch (error: any) {
      console.error("Failed to save card", error);
      setFormError(error.message || "Erro ao salvar cartão.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteCard = async (cardId: string) => {
      if (window.confirm("Excluir este cartão?")) {
          try {
              await deleteCreditCard(cardId);
              await fetchCards();
          } catch (error) {
              console.error("Failed to delete card", error);
              alert("Erro ao excluir cartão.");
          }
      }
  }

  const handleAddCardClick = () => {
      const limit = userRole === 'basic' ? 1 : userRole === 'pro' ? 5 : 999;
      if (cards.length >= limit) {
          alert(`Plano ${userRole.toUpperCase()} limita a ${limit} cartões.`);
          return;
      }
      setFormError(null);
      setIsModalOpen(true);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-text-primary">Cartões</h1>
            <p className="text-text-secondary text-xs mt-0.5">
                Plano: <span className="font-bold text-brand-primary uppercase">{userRole}</span> 
                ({cards.length}/{userRole === 'basic' ? 1 : userRole === 'pro' ? 5 : '∞'})
            </p>
        </div>
        <button onClick={handleAddCardClick} className="flex items-center bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-3 rounded-lg text-sm transition-colors">
            <PlusIcon className="h-4 w-4 mr-1" />
            Adicionar
        </button>
      </div>
      
      {loading ? <Spinner /> : (
        cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.map(card => (
              <div key={card.id} className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col justify-between hover:border-brand-primary transition-colors">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-base md:text-lg font-bold text-text-primary truncate">{card.name}</h3>
                    <CreditCardIcon className="h-6 w-6 text-brand-primary flex-shrink-0" />
                  </div>
                  <p className="text-text-secondary text-xs mt-1 truncate">{card.bank}</p>
                  <p className="font-mono text-base text-text-primary mt-3 tracking-widest">**** **** **** {card.last_four_digits}</p>
                </div>
                <div className="text-right mt-3 flex justify-end items-center gap-2"> {/* NOVO: Flex para botões */}
                  <p className="text-xs text-text-secondary">Disponível: <span className="font-bold text-brand-primary">{formatCurrency(card.limit_available)}</span></p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCardToPay(card); setIsPayModalOpen(true); }}
                    className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 p-1.5 rounded-lg text-xs font-medium transition"
                    title="Pagar Fatura"
                  >
                      Pagar Fatura
                  </button>
                  <button onClick={() => handleDeleteCard(card.id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition" title="Excluir">
                      <DeleteIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card p-6 rounded-xl border border-border shadow-lg min-h-[30vh] flex flex-col justify-center items-center">
            <div className="text-center text-text-secondary">
              <CreditCardIcon className="h-12 w-12 mx-auto mb-3 text-brand-primary" />
              <h2 className="text-lg font-bold text-text-primary">Sem cartões</h2>
              <p className="mt-1 text-sm max-w-xs mx-auto">Adicione cartões para gerenciar suas despesas.</p>
            </div>
          </div>
        )
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Cartão">
          <CreditCardForm 
            onSave={handleSaveCard} 
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={isSubmitting}
            error={formError}
          />
      </Modal>

      {/* NOVO: Modal para Pagamento de Fatura */}
      <PayCreditCardModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        card={selectedCardToPay}
        user={user}
        onPaymentSuccess={fetchCards} // Refetch cards after successful payment
      />
    </div>
  );
};

export default CreditCardsPage;