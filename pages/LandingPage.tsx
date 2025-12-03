import React, { useState, useEffect, useRef } from 'react';
import AnimatedBackground from '../components/AnimatedBackground'; // Used for footer/other sections if needed, but removed from hero
import { AppConfig, AuthMode } from '../types';
import CookieConsent from '../components/CookieConsent';
import {
    WalletIcon,
    DashboardIcon,
    CreditCardIcon,
    TrendingUp,
    ShieldIcon,
    PlusIcon,
    ChevronRightIcon,
    StarIcon,
    CheckIcon,
    PlayIcon,
    CrownIcon
} from '../components/icons/Icons';

interface LandingPageProps {
    appConfig: AppConfig | null;
    onStartAuth: (mode: AuthMode) => void;
    onViewTerms: () => void;
    onViewPrivacy: () => void;
}

const useOnScreen = (ref: React.RefObject<HTMLElement | null>, rootMargin = "0px") => {
    const [isIntersecting, setIntersecting] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIntersecting(true);
                    observer.disconnect(); 
                }
            },
            { rootMargin }
        );
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => {
            observer.disconnect();
        };
    }, [ref, rootMargin]);
    return isIntersecting;
};

const RevealOnScroll: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = "", delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, "-50px");

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

const benefits = [
    {
        icon: <DashboardIcon className="h-7 w-7 text-brand-primary mx-auto mb-4" />,
        title: 'Controle Total',
        description: 'Gerencie receitas e despesas em um painel unificado, intuitivo e poderoso.',
    },
    {
        icon: <TrendingUp className="h-7 w-7 text-brand-primary mx-auto mb-4" />,
        title: 'Crescimento Real',
        description: 'Identifique gargalos financeiros e otimize seus gastos para investir mais.',
    },
    {
        icon: <CreditCardIcon className="h-7 w-7 text-brand-primary mx-auto mb-4" />,
        title: 'Gestão de Cartões',
        description: 'Acompanhe limites e faturas em tempo real. Nunca mais estoure o orçamento.',
    },
    {
        icon: <ShieldIcon className="h-7 w-7 text-brand-primary mx-auto mb-4" />,
        title: 'Segurança Militar',
        description: 'Criptografia de ponta a ponta para proteger seus dados financeiros mais sensíveis.',
    },
    {
        icon: <PlusIcon className="h-7 w-7 text-brand-primary mx-auto mb-4" />,
        title: 'Lançamentos Rápidos',
        description: 'Adicione transações em segundos, categorizando tudo automaticamente.',
    },
    {
        icon: <WalletIcon className="h-7 w-7 text-brand-primary mx-auto mb-4" />,
        title: 'Metas Claras',
        description: 'Defina objetivos e acompanhe seu progresso visualmente rumo à liberdade.',
    },
];

const plans = [
    {
        name: 'Básico',
        price: 'R$ 15,00',
        period: '/mês',
        features: ['Dashboard Completo', '1 Cartão de Crédito', 'Controle de Receitas/Despesas', 'Pagamento Recorrente (sem consumir limite)'],
        highlight: false
    },
    {
        name: 'Pro',
        price: 'R$ 29,90',
        period: '/mês',
        features: ['Tudo do Básico', 'Cartões de Crédito Ilimitados', 'Módulo de Investimentos', 'Relatórios Avançados', 'Suporte Prioritário'],
        highlight: true
    }
];

const testimonials = [
    {
        quote: "O FinzAI não é apenas um app, é meu CFO pessoal. Consegui dobrar meus investimentos em 6 meses apenas organizando a bagunça.",
        author: "Ana Clara S.",
        role: "Empreendedora"
    },
    {
        quote: "A interface é absurdamente limpa. Finalmente um app financeiro que não parece uma planilha de Excel chata dos anos 90.",
        author: "Marcos V.",
        role: "Designer"
    },
    {
        quote: "Controle de cartão de crédito integrado ao fluxo de caixa é o 'killer feature'. Pagar a fatura e ver o limite voltar é mágico.",
        author: "Carlos P.",
        role: "Engenheiro de Software"
    },
    {
        quote: "Uso o plano Pro e a parte de investimentos me dá uma visão consolidada que nenhum banco me oferece.",
        author: "Fernanda L.",
        role: "Médica"
    }
];

const faqItems = [
    {
        question: 'O FinzAI é realmente gratuito?',
        answer: 'Nossos planos são acessíveis e focados em entregar valor real. O plano Básico custa apenas R$ 15,00 mensais para você organizar suas finanças.',
    },
    {
        question: 'Meus dados bancários estão seguros?',
        answer: 'Segurança é nossa obsessão. Utilizamos criptografia AES-256 (mesmo padrão de bancos) e não vendemos seus dados para terceiros.',
    },
    {
        question: 'Consigo acessar pelo celular?',
        answer: 'Perfeitamente. O FinzAI é um Web App Progressivo (PWA) que funciona de forma fluida em qualquer dispositivo, seja Android, iOS ou Desktop.',
    },
    {
        question: 'Como funciona o controle de cartões?',
        answer: 'Você cadastra o limite total do seu cartão. Ao lançar despesas no crédito, o limite disponível é atualizado automaticamente. Ao pagar a fatura, o limite é restabelecido.',
    },
];

const LandingPage: React.FC<LandingPageProps> = ({ appConfig, onStartAuth, onViewTerms, onViewPrivacy }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        console.log("LandingPage.tsx loaded and rendered.");
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-background relative custom-scrollbar overflow-y-auto overflow-x-hidden scroll-smooth h-full w-full">
            <CookieConsent />
            
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-md border-b border-white/5 py-3 md:py-4 px-4 md:px-6 flex items-center justify-between shadow-2xl transition-all duration-300">
                <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    {appConfig?.site_logo ? (
                        <img src={appConfig.site_logo} alt="Logo" className="h-8 w-8 md:h-8 md:w-8 object-contain hover:scale-110 transition-transform" />
                    ) : (
                        <WalletIcon className="h-8 w-8 md:h-8 md:w-8 text-brand-primary hover:scale-110 transition-transform" />
                    )}
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {['Benefícios', 'Planos', 'Depoimentos', 'Faq'].map((item) => ( 
                        <React.Fragment key={item}>
                            <button 
                                onClick={() => scrollToSection(item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))}
                                className="text-text-secondary hover:text-brand-primary font-medium transition-colors text-xs uppercase tracking-wider"
                            >
                                {item}
                            </button>
                        </React.Fragment>
                    ))}
                </nav>

                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={() => onStartAuth('login')}
                        className="text-text-primary hover:text-brand-primary font-bold py-1.5 px-3 md:py-1.5 md:px-3 text-xs md:text-xs transition-colors rounded-lg"
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => onStartAuth('signup')}
                        className="bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-4 md:py-2 md:px-4 rounded-lg text-xs md:text-xs transition-all shadow-glow hover:shadow-[0_0_25px_rgba(64,255,0,0.5)] transform hover:-translate-y-0.5"
                    >
                        Começar
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section id="hero" className="relative w-full min-h-screen flex flex-col justify-center items-center z-10 px-4 pt-32 pb-32 md:pt-32 md:pb-32 bg-[#050505]">
                <RevealOnScroll className="w-full max-w-5xl flex flex-col items-center text-center">
                    {appConfig?.site_logo ? (
                        <img src={appConfig.site_logo} alt="Logo" className="h-16 w-16 md:h-16 md:w-16 object-contain mx-auto mb-6 drop-shadow-[0_0_15px_rgba(64,255,0,0.3)]" />
                    ) : (
                        <WalletIcon className="h-16 w-16 md:h-16 w-16 text-brand-primary mx-auto mb-6 drop-shadow-[0_0_15px_rgba(64,255,0,0.3)]" />
                    )}
                    
                    {/* H1 Radley Font - Adjusted sizes */}
                    <h1 className="font-radley text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-6xl font-bold text-text-primary mb-6 leading-tight tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-brand-primary to-green-600 bg-[length:200%_auto] animate-gradient font-bold block sm:inline">Domine Suas Finanças</span>{' '}
                        <span className="block mt-2 sm:mt-0 sm:inline">Com Inteligência.</span>
                    </h1>
                    
                    {/* Description - Adjusted text size */}
                    <p className="text-lg md:text-xl lg:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
                        Deixe de sobreviver e comece a prosperar. O sistema definitivo para quem quer controle total, previsibilidade e crescimento patrimonial.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <button
                            onClick={() => onStartAuth('signup')}
                            className="bg-brand-primary hover:bg-brand-secondary text-black font-extrabold py-3 px-6 md:py-3.5 md:px-7 rounded-lg text-base md:text-base transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(64,255,0,0.4)] hover:shadow-[0_0_50px_rgba(64,255,0,0.6)] w-full sm:w-auto"
                        >
                            Assuma o Controle Agora
                        </button>
                        <button
                            onClick={() => scrollToSection('beneficios')}
                            className="bg-white/5 hover:bg-white/10 text-text-primary border border-white/10 font-bold py-3 px-6 md:py-3.5 md:px-7 rounded-lg text-base md:text-base transition-all transform hover:scale-105 backdrop-blur-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <PlayIcon className="h-5 w-5 md:h-6 md:w-6" />
                            Ver Demonstração
                        </button>
                    </div>
                </RevealOnScroll>
                
                <div className="absolute bottom-6 md:bottom-10 animate-bounce hidden sm:block">
                    <ChevronRightIcon className="h-6 w-6 md:h-8 md:w-8 text-text-secondary rotate-90" />
                </div>
            </section>

            {/* Why Choose Finz? (Benefits) */}
            <section id="beneficios" className="relative w-full flex flex-col justify-center items-center bg-[#0a0a0a] z-10 px-4 py-28 md:py-28 scroll-mt-16 border-t border-white/5">
                <div className="max-w-7xl mx-auto text-center w-full">
                    <RevealOnScroll>
                        <h2 className="font-radley text-3xl md:text-4xl lg:text-4xl font-bold text-text-primary mb-6 md:mb-8 leading-tight">
                            Por que o Finz é <span className="text-brand-primary">melhor?</span>
                        </h2>
                        <p className="text-lg md:text-lg text-text-secondary mb-12 md:mb-16 max-w-3xl mx-auto px-2">
                            Esqueça planilhas complexas e apps que não te entendem. Criamos a experiência financeira definitiva.
                        </p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"> {/* Adjusted gap */}
                        {benefits.map((benefit, index) => (
                            <RevealOnScroll key={index} delay={index * 100} className="h-full">
                                <div className="group bg-[#121212] p-6 md:p-8 lg:p-8 rounded-2xl border border-border hover:border-brand-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(64,255,0,0.1)] overflow-hidden"> {/* Added overflow-hidden */}
                                    <div className="flex flex-col items-center text-center h-full">
                                        {benefit.icon}
                                        <h3 className="text-xl md:text-2xl lg:text-2xl font-bold text-text-primary mb-3 group-hover:text-brand-primary transition-colors">{benefit.title}</h3>
                                        <p className="text-base md:text-base text-text-secondary leading-relaxed flex-grow break-words px-2">{benefit.description}</p> {/* Added px-2 */}
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            <section id="planos" className="relative w-full flex flex-col justify-center items-center bg-[#0a0a0a] z-10 px-4 py-28 md:py-28 scroll-mt-16 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center w-full">
                    <RevealOnScroll>
                        <h2 className="font-radley text-3xl md:text-4xl lg:text-4xl font-bold text-text-primary mb-6 md:mb-8 leading-tight">
                            Planos que Cabem no <span className="text-brand-primary">seu Bolso</span>
                        </h2>
                        <p className="text-lg md:text-lg text-text-secondary mb-12 md:mb-16 max-w-2xl mx-auto px-2">
                            Evolua conforme seu patrimônio cresce. Sem contratos de fidelidade, cancele a qualquer momento.
                        </p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {plans.map((plan, index) => (
                            <RevealOnScroll key={index} delay={index * 100} className="h-full">
                                <div className={`relative bg-[#121212] p-6 md:p-7 rounded-2xl border-2 flex flex-col h-full 
                                    ${plan.highlight ? 'border-brand-primary shadow-[0_0_30px_rgba(64,255,0,0.2)]' : 'border-border'}`}>
                                    {plan.highlight && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-black font-bold px-4 py-1.5 rounded-lg text-xs uppercase tracking-wider flex items-center gap-2">
                                            <StarIcon className="h-4 w-4" /> Mais Popular
                                        </div>
                                    )}
                                    <h3 className="text-2xl md:text-3xl lg:text-3xl font-bold text-text-primary mb-4">{plan.name}</h3>
                                    <div className="mb-6 flex items-baseline">
                                        <span className="text-4xl md:text-5xl lg:text-5xl font-black text-brand-primary">{plan.price}</span>
                                        <span className="text-base text-text-secondary ml-2">{plan.period}</span>
                                    </div>
                                    <ul className="text-left space-y-3 flex-grow mb-8">
                                        {plan.features.map((feature, fIndex) => (
                                            <li key={fIndex} className="flex items-center text-text-secondary text-base md:text-base">
                                                <CheckIcon className="h-5 w-5 text-brand-primary mr-3 flex-shrink-0" /> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => onStartAuth('signup')}
                                        className={`mt-auto w-full py-3 md:py-3.5 rounded-xl text-base md:text-base font-bold transition-all transform hover:scale-105 
                                            ${plan.highlight ? 'bg-brand-primary text-black hover:bg-brand-secondary shadow-[0_0_20px_rgba(64,255,0,0.4)]' : 'bg-white/5 text-text-primary hover:bg-white/10 border border-border'}`}
                                    >
                                        Começar no Plano {plan.name}
                                    </button>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="depoimentos" className="relative w-full flex flex-col justify-center items-center bg-[#0a0a0a] z-10 px-4 py-28 md:py-28 scroll-mt-16 border-t border-white/5">
                <div className="max-w-7xl mx-auto text-center w-full">
                    <RevealOnScroll>
                        <h2 className="font-radley text-xl md:text-2xl lg:text-2xl font-bold text-text-primary mb-2 leading-tight">
                            Aprovado por <span className="text-brand-primary">+100 clientes</span>
                        </h2>
                        <div className="flex justify-center items-center mb-1 space-x-0.5">
                            <StarIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                            <StarIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                            <StarIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                            <StarIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                            <StarIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                        </div>
                        <p className="text-xs sm:text-sm md:text-sm text-text-secondary mb-6 max-w-3xl mx-auto px-2">
                            <span className="font-bold text-text-primary">4.9/5</span> de média baseada em avaliações reais
                        </p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {testimonials.map((testimonial, index) => (
                            <RevealOnScroll key={index} delay={index * 100} className="h-full">
                                <div className="bg-[#121212] p-4 rounded-2xl border border-border h-full flex flex-col justify-between">
                                    <p className="text-sm md:text-base text-text-primary mb-6 flex-grow">"{testimonial.quote}"</p>
                                    <div className="text-xs md:text-sm text-text-secondary">
                                        <p className="font-bold text-text-primary">{testimonial.author}</p>
                                        <p>{testimonial.role}</p>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="relative w-full flex flex-col justify-center items-center bg-[#0a0a0a] z-10 px-4 py-28 md:py-28 scroll-mt-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto text-center w-full">
                    <RevealOnScroll>
                        <h2 className="font-radley text-3xl md:text-4xl lg:text-4xl font-bold text-text-primary mb-6 md:mb-8 leading-tight">
                            Perguntas <span className="text-brand-primary">Frequentes</span>
                        </h2>
                        <p className="text-lg md:text-lg text-text-secondary mb-12 md:mb-16 max-w-2xl mx-auto px-2">
                            Tire suas dúvidas rapidamente sobre o FinzAI e nossos serviços.
                        </p>
                    </RevealOnScroll>

                    <div className="space-y-4 text-left">
                        {faqItems.map((item, index) => (
                            <RevealOnScroll key={index} delay={index * 100}>
                                <div className="bg-[#121212] rounded-2xl border border-border overflow-hidden">
                                    <button
                                        className="w-full flex justify-between items-center p-5 cursor-pointer text-text-primary hover:bg-white/5 transition-colors"
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                        aria-expanded={openFaq === index}
                                        aria-controls={`faq-answer-${index}`}
                                    >
                                        <span className="text-lg md:text-xl lg:text-xl font-semibold">{item.question}</span>
                                        <ChevronRightIcon className={`h-6 w-6 text-brand-primary transition-transform ${openFaq === index ? 'rotate-90' : ''}`} />
                                    </button>
                                    <div
                                        id={`faq-answer-${index}`}
                                        className={`px-5 pt-0 overflow-hidden transition-[max-height,padding] duration-500 ease-in-out ${
                                            openFaq === index ? 'max-h-[200px] pb-5' : 'max-h-0'
                                        }`}
                                    >
                                        <p className="text-base md:text-base text-text-secondary leading-relaxed">{item.answer}</p>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0a0a0a] text-text-secondary py-12 md:py-12 border-t border-white/5 px-4 z-10 relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        {appConfig?.site_logo ? (
                            <img src={appConfig.site_logo} alt="Logo" className="h-8 w-8 object-contain mb-3" />
                        ) : (
                            <WalletIcon className="h-8 w-8 text-brand-primary mb-3" />
                        )}
                        <span className="font-radley text-xl font-bold text-text-primary mb-2">{appConfig?.site_name || 'FinzAI'}</span>
                        <p className="text-sm max-w-sm">Seu controle financeiro inteligente para prosperar.</p>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:gap-x-12 text-sm md:text-sm">
                        <button onClick={() => scrollToSection('beneficios')} className="hover:text-brand-primary transition-colors whitespace-nowrap">Benefícios</button>
                        <button onClick={() => scrollToSection('planos')} className="hover:text-brand-primary transition-colors whitespace-nowrap">Planos</button>
                        <button onClick={() => scrollToSection('depoimentos')} className="hover:text-brand-primary transition-colors whitespace-nowrap">Depoimentos</button>
                        <button onClick={() => scrollToSection('faq')} className="hover:text-brand-primary transition-colors whitespace-nowrap">FAQ</button>
                        <button onClick={onViewTerms} className="hover:text-brand-primary transition-colors whitespace-nowrap">Termos de Uso</button>
                        <button onClick={onViewPrivacy} className="hover:text-brand-primary transition-colors whitespace-nowrap">Política de Privacidade</button>
                    </nav>

                    <div className="text-center md:text-right text-sm md:text-sm">
                        <p>&copy; {new Date().getFullYear()} {appConfig?.site_name || 'FinzAI'}. Todos os direitos reservados.</p>
                        <p>Feito com ❤️ por Finz Devs</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;