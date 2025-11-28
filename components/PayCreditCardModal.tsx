import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { CreditCard } from '../types';
import { getTransactionsByCardIdAndMonth, updateCreditCard } from '../services/api';
import { AppUser } from '../types';
import Spinner from './Spinner';

interface PayCreditCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: CreditCard | null; // Pode ser null inicialmente
    user: AppUser;
    onPaymentSuccess: () => void;
}

const PayCreditCardModal: React.FC<PayCreditCardModalProps> = ({ isOpen, onClose, card, user, onPaymentSuccess }) => {
    const [payFullAmount, setPayFullAmount] = useState(true);
    const [partialAmount, setPartialAmount] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [currentMonthBalance, setCurrentMonthBalance] = useState(0);
    const [fetchingBalance, setFetchingBalance] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const fetchBalance = useCallback(async () => {
        if (!card?.id || !user?.id) return;
        setFetchingBalance(true);
        setError(null);
        try {
            const cardTransactions = await getTransactionsByCardIdAndMonth(user.id, card.id, currentMonth, currentYear);
            const balance = cardTransactions.reduce((acc, t) => acc + t.amount, 0);
            setCurrentMonthBalance(balance);
            setPartialAmount(balance > 0 ? balance : ''); // Default partial amount to outstanding balance, or empty if 0
        } catch (err) {
            console.error("Failed to fetch card balance:", err);
            setError("Não foi possível carregar o saldo do cartão.");
            setCurrentMonthBalance(0);
        } finally {
            setFetchingBalance(false);
        }
    }, [card?.id, user?.id, currentMonth, currentYear]);

    useEffect(() => {
        if (isOpen && card) {
            fetchBalance();
        } else {
            // Reset state when modal closes
            setPayFullAmount(true);
            setPartialAmount('');
            setError(null);
        }
    }, [isOpen, card, fetchBalance]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!card) {
            setError("Nenhum cartão selecionado para pagamento.");
            setLoading(false);
            return;
        }

        let amountToPay = 0;
        if (payFullAmount) {
            amountToPay = currentMonthBalance;
        } else {
            if (partialAmount === '' || Number(partialAmount) <= 0) {
                setError("Informe um valor válido para pagamento parcial.");
                setLoading(false);
                return;
            }
            amountToPay = Number(partialAmount);
        }
        
        if (amountToPay === 0) {
            setError("O valor do pagamento não pode ser zero.");
            setLoading(false);
            return;
        }

        try {
            // Calculate new available limit, ensuring it doesn't exceed total limit
            const newAvailableLimit = Math.min(card.limit_total, card.limit_available + amountToPay);

            await updateCreditCard(card.id, { limit_available: newAvailableLimit });
            onPaymentSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error processing credit card payment:", err);
            setError(err.message || "Erro ao processar o pagamento do cartão.");
        } finally {
            setLoading(false);
        }
    };

    if (!card || !isOpen) return null; // Renderiza o modal apenas se estiver aberto e um cartão estiver selecionado

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Pagar Fatura - ${card.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {fetchingBalance ? (
                    <div className="flex items-center justify-center p-6"><Spinner /></div>
                ) : error && !fetchingBalance ? (
                    <p className="text-red-400 text-center">{error}</p>
                ) : (
                    <>
                        <p className="text-sm text-text-secondary">
                            Saldo de despesas para o mês de{' '}
                            <span className="font-bold text-brand-primary">
                                {new Date(currentYear, currentMonth - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </span>:{' '}
                            <span className="font-bold text-lg text-red-400">
                                {formatCurrency(currentMonthBalance)}
                            </span>
                        </p>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="payFull"
                                checked={payFullAmount}
                                onChange={() => setPayFullAmount(!payFullAmount)}
                                className="h-4 w-4 text-brand-primary bg-background border-border rounded focus:ring-brand-primary"
                            />
                            <label htmlFor="payFull" className="text-sm text-text-primary cursor-pointer">
                                Pagar valor total da fatura ({formatCurrency(currentMonthBalance)})
                            </label>
                        </div>

                        {!payFullAmount && (
                            <div>
                                <label htmlFor="partialAmount" className="block text-xs font-medium text-text-secondary mb-1">
                                    Valor pago (R$)
                                </label>
                                <input
                                    type="number"
                                    id="partialAmount"
                                    value={partialAmount}
                                    onChange={(e) => setPartialAmount(e.target.valueAsNumber || '')}
                                    min="0.01"
                                    step="0.01"
                                    required
                                    className="w-full bg-background border border-border rounded-xl p-2 md:p-3 text-sm text-text-primary focus:ring-brand-primary"
                                />
                            </div>
                        )}
                    </>
                )}

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-xs md:text-sm text-text-secondary hover:text-text-primary">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading || fetchingBalance} className="bg-brand-primary text-black font-bold py-2 px-6 rounded-xl text-sm disabled:opacity-50">
                        {loading ? 'Processando...' : 'Confirmar Pagamento'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default PayCreditCardModal;