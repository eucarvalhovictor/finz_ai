import React, { useState } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import { AppConfig, AuthMode } from '../types';
import {
    WalletIcon,
    DashboardIcon,
    CreditCardIcon,
    TrendingUp,
    ShieldIcon,
    PlusIcon,
    ChevronRightIcon,
} from '../components/icons/Icons';

interface LandingPageProps {
    appConfig: AppConfig | null;
    onStartAuth: (mode: AuthMode) => void;
}

// Mock Data para as novas seções
const benefits = [
    {
        icon: <DashboardIcon className="h-8 w-8 text-brand-primary mx-auto mb-3" />,
        title: 'Controle Total',
        description: 'Gerencie suas receitas e despesas em um único lugar, de forma intuitiva e eficiente.',
    },
    {
        icon: <TrendingUp className="h-8 w-8 text-brand-primary mx-auto mb-3" />,
        title: 'Crescimento Inteligente',
        description: 'Visualize seus hábitos de gastos e identifique oportunidades para economizar e investir melhor.',
    },
    {
        icon: <CreditCardIcon className="h-8 w-8 text-brand-primary mx-auto mb-3" />,
        title: 'Cartões na Mão',
        description: 'Acompanhe seus cartões de crédito, limites e faturas, evitando surpresas no fim do mês.',
    },
    {
        icon: <ShieldIcon className="h-8 w-8 text-brand-primary mx-auto mb-3" />,
        title: 'Segurança Garantida',
        description: 'Seus dados financeiros são protegidos com as mais avançadas tecnologias de segurança.',
    },
    {
        icon: <PlusIcon className="h-8 w-8 text-brand-primary mx-auto mb-3" />,
        title: 'Simples e Rápido',
        description: 'Adicione transações em segundos e veja seu impacto financeiro em tempo real.',
    },
    {
        icon: <WalletIcon className="h-8 w-8 text-brand-primary mx-auto mb-3" />,
        title: 'Seu Dinheiro, Suas Regras',
        description: 'Personalize categorias e acompanhe metas para alcançar seus objetivos financeiros.',
    },
];

const testimonials = [
    {
        quote: "O FinzAI mudou a forma como eu lido com meu dinheiro. Agora tenho total controle e consigo planejar meu futuro com mais segurança!",
        author: "Ana Clara S.",
    },
    {
        quote: "Sempre tive dificuldade em acompanhar minhas despesas. Com o FinzAI, tudo se tornou mais simples e visual. Recomendo muito!",
        author: "Marcos V.",
    },
    {
        quote: "A interface é limpa e intuitiva. Conseguir ver meus gastos por categoria e meio de pagamento me ajudou a tomar decisões melhores.",
        author: "Fernanda L.",
    },
    {
        quote: "Pagamento de fatura e controle de limite de cartão de crédito em um só lugar? Essencial para quem usa muito cartão como eu!",
        author: "Carlos P.",
    },
];

const faqItems = [
    {
        question: 'O FinzAI é gratuito?',
        answer: 'Sim, o FinzAI possui um plano Básico gratuito com funcionalidades essenciais para o controle financeiro. Oferecemos também planos Pro e Admin com recursos avançados.',
    },
    {
        question: 'Meus dados são seguros?',
        answer: 'Absolutamente. Utilizamos criptografia de ponta e as melhores práticas de segurança para proteger todas as suas informações financeiras. Seu controle e privacidade são nossa prioridade.',
    },
    {
        question: 'Posso acessar de qualquer dispositivo?',
        answer: 'Sim! O FinzAI é uma aplicação web responsiva, otimizada para funcionar perfeitamente em desktops, tablets e smartphones. Seus dados são sincronizados em tempo real.',
    },
    {
        question: 'Como faço para adicionar minhas transações?',
        answer: 'É muito simples! No seu dashboard, clique no botão "Adicionar Transação" e preencha os detalhes como descrição, valor, data, tipo (receita/despesa), categoria e meio de pagamento.',
    },
];

const LandingPage: React.FC<LandingPageProps> = ({ appConfig, onStartAuth }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center relative custom-scrollbar overflow-y-auto"> {/* Changed overflow-hidden to overflow-y-auto */}
            <AnimatedBackground />

            {/* Fixed Header (Tarja Preta) */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center">
                    {appConfig?.site_logo ? (
                        <img src={appConfig.site_logo} alt="Logo" className="h-10 w-10 object-contain" /> {/* Smaller logo for header */}
                    ) : (
                        <WalletIcon className="h-10 w-10 text-brand-primary" />
                    )}
                    <span className="ml-2 text-xl font-bold text-text-primary">{appConfig?.site_name || 'FinzAI'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onStartAuth('login')}
                        className="bg-white/5 hover:bg-white/10 text-text-primary font-bold py-2 px-4 rounded-lg text-sm transition-all"
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => onStartAuth('signup')}
                        className="bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-4 rounded-lg text-sm transition-all"
                    >
                        Comece Grátis
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative w-full pt-28 pb-20 md:pt-40 md:pb-32 flex flex-col justify-center items-center z-10 px-4"> {/* Adjusted pt */}
                <div className="w-full max-w-2xl flex flex-col items-center">
                    {appConfig?.site_logo ? (
                        <img src={appConfig.site_logo} alt="Logo" className="h-28 w-28 object-contain mx-auto mb-6 animate-fade-in-up" />
                    ) : (
                        <WalletIcon className="h-28 w-28 text-brand-primary mx-auto mb-6 animate-fade-in-up" />
                    )}
                    <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-4 animate-fade-in-up">
                        {appConfig?.site_name || 'FinzAI'}
                    </h1>
                    <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-xl animate-fade-in-up delay-100">
                        {appConfig?.site_description || 'Seu controle financeiro inteligente e simplificado.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
                        <button
                            onClick={() => onStartAuth('login')}
                            className="bg-brand-primary hover:bg-brand-secondary text-black font-bold py-3 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-glow-sm"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => onStartAuth('signup')}
                            className="bg-white/5 hover:bg-white/10 text-text-primary border border-border font-bold py-3 px-8 rounded-xl text-lg transition-all transform hover:scale-105"
                        >
                            Comece Grátis
                        </button>
                    </div>
                </div>
            </section>

            {/* Why Choose Finz? Section */}
            <section className="relative w-full py-16 bg-background z-10 px-4">
                <div className="max-w-7xl mx-auto text-center animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                        Por que escolher o Finz?
                    </h2>
                    <p className="text-lg text-text-secondary mb-12 max-w-2xl mx-auto">
                        Transforme a maneira como você gerencia suas finanças com uma plataforma projetada para você.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="bg-card p-6 rounded-2xl border border-border text-center animate-fade-in-up" style={{ animationDelay: `${0.1 * index}s` }}>
                                {benefit.icon}
                                <h3 className="text-xl font-semibold text-text-primary mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-text-secondary">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="relative w-full py-16 bg-background z-10 px-4">
                <div className="max-w-7xl mx-auto text-center animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                        O que nossos usuários dizem
                    </h2>
                    <p className="text-lg text-text-secondary mb-12 max-w-2xl mx-auto">
                        Veja como o Finz tem feito a diferença na vida financeira de milhares de pessoas.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-card p-6 rounded-2xl border border-border text-left animate-fade-in-up" style={{ animationDelay: `${0.1 * index}s` }}>
                                <p className="text-text-primary text-lg italic mb-4">"{testimonial.quote}"</p>
                                <p className="font-semibold text-brand-primary">- {testimonial.author}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative w-full py-16 bg-background z-10 px-4">
                <div className="max-w-7xl mx-auto text-center animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-12">
                        Perguntas Frequentes
                    </h2>
                    <div className="max-w-3xl mx-auto text-left">
                        {faqItems.map((item, index) => (
                            <div key={index} className="bg-card p-4 rounded-xl border border-border mb-3 animate-fade-in-up" style={{ animationDelay: `${0.1 * index}s` }}>
                                <button
                                    className="flex justify-between items-center w-full text-text-primary text-lg font-semibold py-2"
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    {item.question}
                                    <ChevronRightIcon className={`h-5 w-5 transition-transform ${openFaq === index ? 'rotate-90 text-brand-primary' : ''}`} />
                                </button>
                                {openFaq === index && (
                                    <p className="mt-2 text-text-secondary text-base pb-2 animate-fade-in">
                                        {item.answer}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final Call to Action - Pode ser uma versão mais simples da hero CTA */}
            <section className="relative w-full py-20 bg-background z-10 px-4">
                <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                        Pronto para o controle financeiro?
                    </h2>
                    <p className="text-lg text-text-secondary mb-8">
                        Junte-se a milhares de usuários que transformaram suas finanças com o FinzAI.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onStartAuth('signup')}
                            className="bg-brand-primary hover:bg-brand-secondary text-black font-bold py-3 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-glow-sm"
                        >
                            Comece Grátis Agora
                        </button>
                        <button
                            onClick={() => onStartAuth('login')}
                            className="bg-white/5 hover:bg-white/10 text-text-primary border border-border font-bold py-3 px-8 rounded-xl text-lg transition-all transform hover:scale-105"
                        >
                            Já sou cliente
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative w-full py-8 bg-card border-t border-border z-10 px-4">
                <div className="max-w-7xl mx-auto text-center text-text-secondary text-sm">
                    <p>&copy; {new Date().getFullYear()} {appConfig?.site_name || 'FinzAI'}. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;