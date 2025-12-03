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
        price: 15.00,
        priceFormatted: 'R$ 15,00',
        period: '/mês',
        features: ['Dashboard Completo', '1 Cartão de Crédito', 'Controle de Receitas/Despesas', 'Pagamento Recorrente'],
        highlight: false
    },
    {
        name: 'Pro',
        role: 'pro' as Role,
        price: 29.90, // PREÇO ATUALIZADO
        priceFormatted: 'R$ 29,90', // PREÇO ATUALIZADO
        period: '/mês',
        features: ['Tudo do Básico', 'Cartões de Crédito Ilimitados', 'Módulo de Investimentos', 'Relatórios Avançados', 'Suporte Prioritário'],
        highlight: true
    }
];

const CheckoutPage: React.FC<CheckoutPageProps> = ({ user, appConfig, onSuccess }) => {
    const [selectedPlan, setSelectedPlan] = useState<Role>('pro');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Campos do Formulário
    const [cpf, setCpf] = useState('');
    const [billingFullName, setBillingFullName] = useState(`${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim());
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCep = e.target.value.replace(/\D/g, '').slice(0, 8); // Apenas números, max 8
        setCep(newCep);

        if (newCep.length === 8) {
            // Simular preenchimento automático
            console.log("Simulando busca de CEP:", newCep);
            // Em uma aplicação real, você faria uma chamada de API para um serviço de CEP (ex: ViaCEP)
            await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay
            // Aqui você preencheria os campos de endereço com os dados da API
            setLogradouro('Rua Exemplo');
            setBairro('Bairro Teste');
            setCidade('Cidade Fictícia');
            setUf('SP');
        } else {
            setLogradouro('');
            setBairro('');
            setCidade('');
            setUf('');
        }
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedNumber = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19); // Adiciona espaço a cada 4 dígitos
        setCardNumber(formattedNumber);
    };

    const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito
        if (input.length > 2) {
            input = input.substring(0, 2) + '/' + input.substring(2, 4); // Adiciona '/' após o mês
        }
        setCardExpiry(input.slice(0, 5));
    };

    const handleApplyCoupon = () => {
        if (couponCode === 'PROMO10') {
            setDiscount(currentPlan ? currentPlan.price * 0.1 : 0); // 10% de desconto
            alert('Cupom aplicado com sucesso!');
        } else {
            setDiscount(0);
            alert('Cupom inválido!');
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!currentPlan) {
            setError("Nenhum plano selecionado.");
            setLoading(false);
            return;
        }

        // Simulação de validação básica dos campos do formulário
        if (!cpf || !billingFullName || !cep || !logradouro || !numero || !cidade || !uf || !cardName || !cardNumber || !cardExpiry || !cardCvv) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            setLoading(false);
            return;
        }
        // Validações mais complexas (Regex para CPF, cartão, etc.) seriam adicionadas aqui em um app real.

        try {
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 2500)); // Aumentar o delay para simular pagamento real

            // Update user's role in the database
            await updateProfile(user.id, { role: selectedPlan });

            // CRITICAL FIX: Clear the "new signup" flag from session storage.
            // This allows the App to finally trust the DB role (which is now 'basic' or 'pro', not 'onboarding').
            sessionStorage.removeItem('finz_new_signup');

            // Call the success callback to navigate to the dashboard
            onSuccess();

        } catch (err: any) {
            console.error("Failed to update profile during checkout:", err);
            setError("Ocorreu um erro ao ativar seu plano. Tente novamente.");
            setLoading(false);
        }
    };
    
    const currentPlan = plans.find(p => p.role === selectedPlan);
    const totalPrice = currentPlan ? currentPlan.price - discount : 0;

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 custom-scrollbar">
            <div className="w-full max-w-6xl mx-auto">
                <header className="text-center mb-8">
                    {appConfig?.site_logo ? (
                        <img src={appConfig.site_logo} alt="Logo" className="h-12 w-12 object-contain mx-auto mb-4" />
                    ) : (
                        <WalletIcon className="h-12 w-12 text-brand-primary mx-auto mb-4" />
                    )}
                    <h1 className="text-3xl font-bold text-text-primary">Complete sua Assinatura</h1>
                    <p className="text-text-secondary mt-2">Escolha o plano e preencha os dados para ativar sua conta.</p>
                </header>
                
                 <form onSubmit={handlePayment} className="grid lg:grid-cols-1 xl:grid-cols-5 gap-8 lg:gap-12 items-start">
                    {/* Coluna de Formulários */}
                    <div className="lg:col-span-1 xl:col-span-3 space-y-8">
                        {/* Seleção de Plano */}
                         <div className="space-y-4">
                             <h2 className="text-xl font-semibold text-text-primary">Escolha seu plano</h2>
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
                                            <CrownIcon className="h-4 w-4" /> Recomendado
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                                            <div className="flex items-baseline">
                                                <span className="text-2xl font-black text-text-primary">{plan.priceFormatted}</span>
                                                <span className="text-text-secondary ml-1 text-sm">{plan.period}</span>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${selectedPlan === plan.role ? 'bg-brand-primary border-brand-primary' : 'border-border'}`}>
                                        {selectedPlan === plan.role && <CheckIcon className="h-4 w-4 text-black" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 1. Dados para Faturamento */}
                        <div className="bg-card p-6 rounded-2xl border border-border">
                            <h2 className="text-xl font-semibold text-text-primary mb-4">1. Dados para faturamento</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">CPF *</label>
                                    <input type="text" required placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                    <p className="text-xs text-text-secondary mt-1">Necessário para emissão da nota fiscal.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Nome completo para faturamento *</label>
                                    <input type="text" required placeholder="Seu nome completo" value={billingFullName} onChange={(e) => setBillingFullName(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                </div>
                            </div>
                        </div>

                        {/* 2. Endereço */}
                        <div className="bg-card p-6 rounded-2xl border border-border">
                             <h2 className="text-xl font-semibold text-text-primary mb-4">2. Endereço</h2>
                             <div className="space-y-4">
                                <div>
                                     <label className="block text-xs font-medium text-text-secondary mb-1">CEP *</label>
                                     <input type="text" required placeholder="00000-000" value={cep} onChange={handleCEPChange} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                     <p className="text-xs text-text-secondary mt-1">Digite o CEP para preenchimento automático do endereço.</p>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-text-secondary mb-1">Logradouro</label>
                                        <input type="text" required placeholder="Rua, Avenida..." value={logradouro} onChange={(e) => setLogradouro(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                    </div>
                                    <div>
                                         <label className="block text-xs font-medium text-text-secondary mb-1">Número *</label>
                                        <input type="text" required placeholder="123" value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                    </div>
                                </div>
                                 <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Complemento</label>
                                    <input type="text" placeholder="Apartamento, bloco, etc. (opcional)" value={complemento} onChange={(e) => setComplemento(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-text-secondary mb-1">Bairro</label>
                                        <input type="text" required placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-secondary mb-1">UF</label>
                                        <input type="text" required placeholder="UF" value={uf} onChange={(e) => setUf(e.target.value)} maxLength={2} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                    </div>
                                </div>
                                 <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Cidade</label>
                                    <input type="text" required placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                </div>
                             </div>
                        </div>

                         {/* 3. Dados do cartão */}
                        <div className="bg-card p-6 rounded-2xl border border-border">
                             <h2 className="text-xl font-semibold text-text-primary mb-4">3. Dados do cartão de crédito</h2>
                             <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Nome no cartão *</label>
                                    <input type="text" required placeholder="Nome como impresso no cartão" value={cardName} onChange={(e) => setCardName(e.target.value)} autoComplete="cc-name" className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Número do cartão *</label>
                                    <input type="text" required placeholder="0000 0000 0000 0000" inputMode="numeric" pattern="[\d\s]{16,19}" autoComplete="cc-number" maxLength={19} value={cardNumber} onChange={handleCardNumberChange} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-text-secondary mb-1">Validade *</label>
                                        <input type="text" required placeholder="MM/AA" pattern="(0[1-9]|1[0-2])\/\d{2}" maxLength={5} value={cardExpiry} onChange={handleCardExpiryChange} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-text-secondary mb-1">CVV *</label>
                                        <input type="text" required placeholder="123" inputMode="numeric" pattern="\d{3,4}" maxLength={4} value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0,4))} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                    
                    {/* Coluna de Resumo */}
                    <div className="lg:col-span-1 xl:col-span-2 lg:sticky lg:top-8 space-y-6 bg-card p-6 rounded-2xl border border-border">
                        <h2 className="text-xl font-semibold text-text-primary mb-4 border-b border-border pb-4">Resumo do pedido</h2>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-text-secondary">Plano Mensal</span>
                            <span className="font-bold text-text-primary">{currentPlan?.priceFormatted}{currentPlan?.period}</span>
                        </div>

                         <div className="text-xs text-text-secondary space-y-1">
                            <p className="font-bold">Forma de cobrança:</p>
                            <p>Cobrança recorrente mensal de {currentPlan?.priceFormatted} até cancelamento.</p>
                         </div>

                        <div className="border-t border-border pt-4">
                            <label htmlFor="coupon" className="text-sm font-medium text-text-primary">Possui cupom de desconto?</label>
                            <div className="flex gap-2 mt-2">
                                <input type="text" id="coupon" placeholder="Digite o código do cupom" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1 bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary text-sm"/>
                                <button type="button" onClick={handleApplyCoupon} className="bg-white/10 text-text-primary font-bold px-4 rounded-xl text-sm hover:bg-white/20">Aplicar</button>
                            </div>
                            {discount > 0 && <p className="text-green-400 text-sm mt-1">Desconto aplicado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount)}</p>}
                        </div>

                        <div className="flex justify-between items-center text-lg font-bold border-t border-border pt-4">
                             <span className="text-text-primary">Total</span>
                             <span className="text-brand-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}</span>
                        </div>

                        <div className="pt-2">
                             <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-brand-primary hover:bg-brand-secondary text-black font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center text-lg"
                            >
                                {loading ? <Spinner size="sm" /> : `Pagar ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}`}
                            </button>
                            <p className="text-xs text-text-secondary text-center mt-3">Pagamento 100% seguro e criptografado.</p>
                        </div>

                         <div className="border-t border-border pt-4 text-center text-sm text-text-secondary">
                            <p><span className="font-bold text-brand-primary">Garantia de 7 dias.</span> Não ficou satisfeito? Devolvemos 100% do seu dinheiro.</p>
                         </div>
                         {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;