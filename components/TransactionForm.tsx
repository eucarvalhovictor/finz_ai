
import React, { useState, useEffect } from 'react';
import { Transaction, CreditCard } from '../types';

interface TransactionFormProps {
  onSave: (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>, id?: string) => void;
  onClose: () => void;
  existingTransaction?: Transaction | null;
  userId: string;
  categories: string[];
  creditCards: CreditCard[];
}

const DEFAULT_CATEGORIES = [
    'Alimentação',
    'Casa',
    'Transporte',
    'Lazer',
    'Entretenimento',
    'Saúde',
    'Educação',
    'Salário',
    'Investimentos',
    'Presentes',
    'Serviços',
    'Outros'
];

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        {...props}
        className="mt-1 block w-full bg-background border border-border rounded-xl shadow-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm p-3 text-text-primary placeholder-text-secondary/50"
    />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select
        {...props}
        className="mt-1 block w-full bg-background border border-border rounded-xl shadow-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm p-3 text-text-primary"
    >
        {props.children}
    </select>
);


const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, onClose, existingTransaction, userId, categories, creditCards }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Dinheiro' | 'Pix' | 'Cartão'>('Dinheiro');
  const [cardId, setCardId] = useState<string | undefined>(undefined);
  const [paymentType, setPaymentType] = useState<'À Vista' | 'Parcelado'>('À Vista');
  const [installments, setInstallments] = useState<number | ''>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combine user categories with default ones and remove duplicates
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories])).sort();

  useEffect(() => {
    if (existingTransaction) {
      setDescription(existingTransaction.description);
      setAmount(existingTransaction.amount);
      setDate(existingTransaction.date);
      setType(existingTransaction.type);
      setCategory(existingTransaction.category);
      setPaymentMethod(existingTransaction.payment_method || 'Dinheiro');
      setCardId(existingTransaction.card_id);
      setPaymentType(existingTransaction.payment_type || 'À Vista');
      setInstallments(existingTransaction.installments || 1);
    }
  }, [existingTransaction]);

  // Handle Logic switch: If Income, Card is not allowed
  useEffect(() => {
    if (type === 'INCOME' && paymentMethod === 'Cartão') {
        setPaymentMethod('Dinheiro');
        setCardId(undefined);
    }
  }, [type, paymentMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === '' || !description || !category) return;
    if (paymentMethod === 'Cartão' && !cardId && type === 'EXPENSE') {
        alert('Por favor, selecione um cartão de crédito.');
        return;
    }
    setIsSubmitting(true);
    
    const isCreditExpense = paymentMethod === 'Cartão' && type === 'EXPENSE';

    const newTransaction: any = {
      description,
      amount: +amount,
      date,
      type,
      category,
      payment_method: paymentMethod,
      card_id: isCreditExpense ? cardId : null,
      payment_type: isCreditExpense ? paymentType : null,
      installments: isCreditExpense && paymentType === 'Parcelado' ? Number(installments) : null,
    };
    
    await onSave(newTransaction, existingTransaction?.id);
    setIsSubmitting(false);
  };
  
  const hasCreditCards = creditCards.length > 0;
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full gap-4">
       
       {/* Toggle Tipo */}
       <div className="bg-background p-1 rounded-xl border border-border flex">
          <button 
            type="button" 
            onClick={() => setType('INCOME')} 
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'INCOME' ? 'bg-green-500 text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Receita
          </button>
          <button 
            type="button" 
            onClick={() => setType('EXPENSE')} 
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'EXPENSE' ? 'bg-red-500 text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Despesa
          </button>
       </div>

       <div>
        <label htmlFor="description" className="block text-xs font-medium text-text-secondary mb-1">Descrição</label>
        <FormInput
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Ex: Supermercado"
        />
      </div>
      
      {/* Valor e Data lado a lado */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="amount" className="block text-xs font-medium text-text-secondary mb-1">Valor (R$)</label>
          <FormInput
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.valueAsNumber || '')}
            required
            step="0.01"
            min="0"
            placeholder="0,00"
          />
        </div>
        <div className="w-2/5">
            <label htmlFor="date" className="block text-xs font-medium text-text-secondary mb-1">Data</label>
            <FormInput
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
        </div>
      </div>

       <div>
        <label htmlFor="category" className="block text-xs font-medium text-text-secondary mb-1">Categoria</label>
        <FormInput
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          list="category-suggestions"
          placeholder="Selecione ou digite..."
        />
        <datalist id="category-suggestions">
          {allCategories.map(cat => <option key={cat} value={cat} />)}
        </datalist>
      </div>

      <div className="space-y-3 p-3 border border-border rounded-xl bg-background/50">
          <h4 className="text-xs font-medium text-text-secondary">Meio de Pagamento</h4>
          <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setPaymentMethod('Dinheiro')} className={`py-2 px-1 text-xs rounded-lg font-semibold transition-all ${paymentMethod === 'Dinheiro' ? 'bg-brand-primary text-black' : 'bg-card border border-border text-text-secondary'}`}>
                  Dinheiro
              </button>
               <button type="button" onClick={() => setPaymentMethod('Pix')} className={`py-2 px-1 text-xs rounded-lg font-semibold transition-all ${paymentMethod === 'Pix' ? 'bg-brand-primary text-black' : 'bg-card border border-border text-text-secondary'}`}>
                  Pix
              </button>
               {type === 'EXPENSE' && (
                <button type="button" onClick={() => setPaymentMethod('Cartão')} className={`py-2 px-1 text-xs rounded-lg font-semibold transition-all ${paymentMethod === 'Cartão' ? 'bg-brand-primary text-black' : 'bg-card border border-border text-text-secondary'}`}>
                    Cartão
                </button>
               )}
          </div>
          
          {paymentMethod === 'Cartão' && type === 'EXPENSE' && (
              <div className="space-y-3 animate-fade-in-up pt-2 border-t border-border mt-2">
                  {!hasCreditCards ? (
                      <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-3 rounded-xl text-xs">
                          <p className="font-bold">Nenhum cartão encontrado.</p>
                          <p>Cadastre um cartão no menu "Cartões".</p>
                      </div>
                  ) : (
                      <>
                        <div>
                            <label htmlFor="card" className="block text-xs font-medium text-text-secondary mb-1">Selecione o Cartão</label>
                            <FormSelect id="card" value={cardId || ''} onChange={e => setCardId(e.target.value)} required>
                                <option value="">Selecione...</option>
                                {creditCards.map(card => (
                                    <option key={card.id} value={card.id}>{card.name} (Final {card.last_four_digits})</option>
                                ))}
                            </FormSelect>
                        </div>

                        <div className="flex gap-2">
                            <button type="button" onClick={() => setPaymentType('À Vista')} className={`flex-1 py-2 text-xs rounded-lg font-semibold transition-all ${paymentType === 'À Vista' ? 'bg-brand-primary text-black' : 'bg-card border border-border text-text-secondary'}`}>
                                À Vista
                            </button>
                            <button type="button" onClick={() => setPaymentType('Parcelado')} className={`flex-1 py-2 text-xs rounded-lg font-semibold transition-all ${paymentType === 'Parcelado' ? 'bg-brand-primary text-black' : 'bg-card border border-border text-text-secondary'}`}>
                                Parcelado
                            </button>
                        </div>

                        {paymentType === 'Parcelado' && (
                            <div className="animate-fade-in-up">
                                <label htmlFor="installments" className="block text-xs font-medium text-text-secondary mb-1">Parcelas</label>
                                <FormInput
                                    type="number"
                                    id="installments"
                                    value={installments}
                                    onChange={(e) => setInstallments(e.target.valueAsNumber || '')}
                                    min="2"
                                    max="24"
                                    required
                                    placeholder="2"
                                />
                            </div>
                        )}
                      </>
                  )}
              </div>
          )}
      </div>

      <div className="flex gap-3 pt-2 mt-auto">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 text-sm font-semibold text-text-primary bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-border"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || (paymentMethod === 'Cartão' && type === 'EXPENSE' && !hasCreditCards)}
          className="flex-1 py-3 text-sm font-semibold bg-brand-primary hover:bg-brand-secondary text-black rounded-xl transition-colors disabled:opacity-50"
        >
          {isSubmitting ? '...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
