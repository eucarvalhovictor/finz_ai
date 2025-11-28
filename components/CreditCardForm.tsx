import React, { useState } from 'react';
import { CreditCard } from '../types';

interface CreditCardFormProps {
    onSave: (card: Omit<CreditCard, 'id'|'created_at'|'user_id'|'limit_available'> & {limit_total: number}) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    error: string | null;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ onSave, onCancel, isSubmitting, error }) => {
    const [name, setName] = useState('');
    const [lastFour, setLastFour] = useState('');
    const [bank, setBank] = useState('');
    const [limitTotal, setLimitTotal] = useState<number | ''>(''); // Novo estado para o limite total

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (limitTotal === '') { // Validação básica para o novo campo
            alert("Por favor, informe o limite total do cartão.");
            return;
        }
        onSave({ name, last_four_digits: lastFour, bank, limit_total: Number(limitTotal) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-xs font-medium text-text-secondary">Apelido do Cartão</label>
                <input 
                    type="text" id="name" value={name} onChange={e => setName(e.target.value)} required 
                    placeholder="Ex: Nubank Principal"
                    className="mt-1 block w-full bg-background border border-border rounded-xl p-2 md:p-3 text-sm text-text-primary focus:ring-brand-primary" 
                />
            </div>
            <div>
                <label htmlFor="lastFour" className="block text-xs font-medium text-text-secondary">Últimos 4 dígitos</label>
                <input 
                    type="text" id="lastFour" value={lastFour} onChange={e => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} required placeholder="1234"
                    className="mt-1 block w-full bg-background border border-border rounded-xl p-2 md:p-3 text-sm text-text-primary focus:ring-brand-primary" 
                />
            </div>
            <div>
                <label htmlFor="bank" className="block text-xs font-medium text-text-secondary">Banco Emissor</label>
                <input 
                    type="text" id="bank" value={bank} onChange={e => setBank(e.target.value)} required placeholder="Ex: Itaú, Nubank"
                    className="mt-1 block w-full bg-background border border-border rounded-xl p-2 md:p-3 text-sm text-text-primary focus:ring-brand-primary" 
                />
            </div>
            <div> {/* Novo campo para o limite total */}
                <label htmlFor="limitTotal" className="block text-xs font-medium text-text-secondary">Limite Total (R$)</label>
                <input
                    type="number" id="limitTotal" value={limitTotal} onChange={e => setLimitTotal(e.target.valueAsNumber || '')} required min="0" step="0.01"
                    placeholder="1000,00"
                    className="mt-1 block w-full bg-background border border-border rounded-xl p-2 md:p-3 text-sm text-text-primary focus:ring-brand-primary"
                />
            </div>
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2 rounded-lg text-xs">
                    {error}
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 text-xs md:text-sm text-text-secondary hover:text-text-primary">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-black font-bold py-2 px-6 rounded-xl text-sm disabled:opacity-50">
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    )
}

export default CreditCardForm;