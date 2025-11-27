
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
        className="block w-full bg-background border border-border rounded-lg shadow-sm focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-sm py-2 px-3 text-text-primary placeholder-text-secondary/50"
    />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select
        {...props}
        className="block w-full bg-background border border-border rounded-lg shadow-sm focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-sm py-2 px-3 text-text-primary"
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
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
       
       <div className="flex-1 space-y-3">
            {/* Toggle Tipo Compacto */}
            <div className="flex bg-background rounded-lg border border-border p-0.5 h-8 md:h-10">
                <button 
                    type="button" 
                    onClick={() => setType('INCOME')} 
                    className={`flex-1 rounded-md text-xs font-bold transition-all ${type === 'INCOME' ? 'bg-green-600 text-white' : 'text-text-secondary'}`}
                >
                    Receita
                </button>
                <button 
                    type="button" 
                    onClick={() => setType('EXPENSE')} 
                    className={`flex-1 rounded-md text-xs font-bold transition-all ${type === 'EXPENSE' ? 'bg-red-600 text-white' : 'text-text-secondary'}`}
                >
                    Despesa
                </button>
            </div>

            {/* Descrição */}
            <div>
                <label htmlFor="description" className="block text-[10px] md:text-xs font-medium text-text-secondary mb-0.5">Descrição</label>
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
            <div className="flex gap-2">
                <div className="flex-1">
                <label htmlFor="amount" className="block text-[10px] md:text-xs font-medium text-text-secondary mb-0.5">Valor (R$)</label>
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
                <div className="w-[45%]">
                    <label htmlFor="date" className="block text-[10px] md:text-xs font-medium text-text-secondary mb-0.5">Data</label>
                    <FormInput
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    />
                </div>
            </div>

            {/* Categoria */}
            <div>
                <label htmlFor="category" className="block text-[10px] md:text-xs font-medium text-text-secondary mb-0.5">Categoria</label>
                <FormInput
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                list="category-suggestions"
                placeholder="Selecione..."
                />
                <datalist id="category-suggestions">
                {allCategories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
            </div>

            {/* Meio de Pagamento (Segmented) */}
            <div>
                <label className="block text-[10px] md:text-xs font-medium text-text-secondary mb-1">Meio de Pagamento</label>
                <div className="flex bg-background rounded-lg border border-border p-0.5 h-8">
                    {['Dinheiro', 'Pix', 'Cartão'].map((method) => {
                        if (type === 'INCOME' && method === 'Cartão') return null;
                        return (
                            <button
                                key={method}
                                type="button"
                                onClick={() => setPaymentMethod(method as any)}
                                className={`flex-1 rounded-md text-[10px] md:text-xs font-bold transition-all ${paymentMethod === method ? 'bg-brand-primary text-black shadow-sm' : 'text-text-secondary'}`}
                            >
                                {method}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            {/* Área Cartão de Crédito */}
            {paymentMethod === 'Cartão' && type === 'EXPENSE' && (
                <div className="space-y-2 p-2 border border-border rounded-lg bg-background/30">
                    {!hasCreditCards ? (
                        <p className="text-yellow-500 text-xs text-center p-2">Sem cartões cadastrados.</p>
                    ) : (
                        <>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label htmlFor="card" className="block text-[10px] md:text-xs font-medium text-text-secondary mb-0.5">Cartão</label>
                                    <FormSelect id="card" value={cardId || ''} onChange={e => setCardId(e.target.value)} required>
                                        <option value="">...</option>
                                        {creditCards.map(card => (
                                            <option key={card.id} value={card.id}>{card.name} ({card.last_four_digits})</option>
                                        ))}
                                    </FormSelect>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] md:text-xs font-medium text-text-secondary mb-0.5">Tipo</label>
                                    <FormSelect value={paymentType} onChange={e => setPaymentType(e.target.value as any)}>
                                        <option value="À Vista">À Vista</option>
                                        <option value="Parcelado">Parcelado</option>
                                    </FormSelect>
                                </div>
                            </div>

                            {paymentType === 'Parcelado' && (
                                <div>
                                    <label htmlFor="installments" className="block text-[10px] md:text-xs font-medium text-text-secondary mb-0.5">Parcelas</label>
                                    <FormInput
                                        type="number"
                                        id="installments"
                                        value={installments}
                                        onChange={(e) => setInstallments(e.target.valueAsNumber || '')}
                                        min="2"
                                        max="24"
                                        required
                                        placeholder="Qtd"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
       </div>

       {/* Botões de Ação Fixos no Rodapé */}
       <div className="flex gap-3 pt-3 mt-auto border-t border-border md:border-t-0">
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
