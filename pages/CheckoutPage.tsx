import React, { useState } from 'react';
import { AppConfig, AppUser, Role } from '../types';
import { updateProfile } from '../services/api';
import { WalletIcon, CrownIcon, CheckIcon } from '../components/icons/Icons';
import Spinner from '../components/Spinner';

interface CheckoutPageProps {
    user: AppUser;
    appConfig: AppConfig | null;
    onSuccess: () => void;
}

const plans = [
    {
        name: 'Básico',
        role: 'basic' as Role,
        price: 'R$ 15,00',
        period: '/mês',
        features: ['Dashboard Completo', '1 Cartão de Crédito', 'Controle de Receitas/Despesas', 'Pagamento Recorrente'],
        highlight: false
    },
    {
        name: 'Pro',
        role: 'pro' as Role,
        price: 'R$ 29,90',
        period: '/mês',
        features: ['Tudo do Básico', 'Cartões de Crédito Ilimitados', 'Módulo de Investimentos', 'Relatórios Avançados', 'Suporte Prioritário'],
        highlight: true
    }
];

const CheckoutPage: React.FC<CheckoutPageProps> = ({ user, appConfig, onSuccess }) => {
    const [selectedPlan, setSelectedPlan] = useState<Role>('pro');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update user's role in the database
            await updateProfile(user.id, { role: selectedPlan });

            // Call the success callback to navigate to the dashboard
            onSuccess();

        } catch (err: any) {
            console.error("Failed to update profile during checkout:", err);
            setError("Ocorreu um erro ao ativar seu plano. Tente novamente.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4 custom-scrollbar">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    {appConfig?.site_logo ? (
                        <img src={appConfig.site_logo} alt="Logo" className="h-12 w-12 object-contain mx-auto mb-4" />
                    ) : (
                        <WalletIcon className="h-12 w-12 text-brand-primary mx-auto mb-4" />
                    )}
                    <h1 className="text-3xl font-bold text-text-primary">Complete sua Assinatura</h1>
                    <p className="text-text-secondary mt-2">Escolha o plano ideal para sua jornada financeira.</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Plan Selection */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-text-primary">1. Escolha seu plano</h2>
                        {plans.map((plan) => (
                            <div
                                key={plan.role}
                                onClick={() => setSelectedPlan(plan.role)}
                                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                    selectedPlan === plan.role ? 'border-brand-primary bg-card shadow-lg' : 'border-border bg-card/50'
                                }`}
                            >
                                {plan.highlight && (
                                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-black font-bold px-3 py-1 rounded-lg text-xs uppercase tracking-wider flex items-center gap-2">
                                        <CrownIcon className="h-4 w-4" />
                                        Recomendado
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                                        <div className="flex items-baseline">
                                            <span className="text-2xl font-black text-text-primary">{plan.price}</span>
                                            <span className="text-text-secondary ml-1 text-sm">{plan.period}</span>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${selectedPlan === plan.role ? 'bg-brand-primary border-brand-primary' : 'border-border'}`}>
                                       {selectedPlan === plan.role && <CheckIcon className="h-4 w-4 text-black" />}
                                    </div>
                                </div>
                                <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-brand-primary flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Payment Form */}
                    <div className="bg-card p-6 rounded-2xl border border-border">
                        <h2 className="text-xl font-semibold text-text-primary mb-4">2. Pagamento</h2>
                        <form onSubmit={handlePayment} className="space-y-4">
                             <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Nome no Cartão</label>
                                <input type="text" required placeholder="Nome completo" className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Número do Cartão</label>
                                <input type="text" required placeholder="0000 0000 0000 0000" inputMode="numeric" pattern="[\d\s]{16,19}" autoComplete="cc-number" maxLength={19} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Validade (MM/AA)</label>
                                    <input type="text" required placeholder="MM/AA" className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                </div>
                                 <div className="flex-1">
                                    <label className="block text-xs font-medium text-text-secondary mb-1">CVC</label>
                                    <input type="text" required placeholder="123" className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                </div>
                            </div>
                            
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            
                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-brand-primary hover:bg-brand-secondary text-black font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center"
                                >
                                    {loading ? <Spinner size="sm" /> : `Pagar e Ativar Plano`}
                                </button>
                                <p className="text-xs text-text-secondary text-center mt-3">Pagamento seguro. Cancele quando quiser.</p>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CheckoutPage;
