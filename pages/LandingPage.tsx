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
    const isVisible = useOnScreen(ref, "-50px"); // Margin ajustada para disparar mais cedo no mobile

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
        icon: <DashboardIcon className="h-8 w-8 text-brand-primary mx-auto mb-3" />,
        title: 'Controle Total',
        description: 'Gerencie receitas e despesas em um painel unificado, intuitivo e poderoso.',
    },
    {
        icon: <TrendingUp className="h-8 w-8 text-brand-primary mx-auto mb-3" />,
        title: 'Crescimento Real',
        description: 'Identifique gargalos financeiros e otimize seus gastos para investir mais.',
    },
    {
        icon: <CreditCardIcon className="h-8 w-8 text-brand-primary mx-auto mb-3" />,
        title: 'Gestão de Cartões',
        description: 'Acompanhe limites e faturas em tempo real. Nunca mais estoure o orçamento.',
    },
    {
        icon: <ShieldIcon className="h-8 w-8 text-brand-primary mx-auto mb-3" />,
        title: 'Segurança Militar',
        description: 'Criptografia de ponta a ponta para proteger seus dados financeiros mais sensíveis.',
    },
    {
        icon: <PlusIcon className="h-8 w-8 text-brand-primary mx-auto mb-3" />,
        title: 'Lançamentos Rápidos',
        description: 'Adicione transações em segundos, categorizando tudo automaticamente.',
    },
    {
        icon: <WalletIcon className="h-8 w-8 text-brand-primary mx-auto mb-3" />,
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
        price: 'R$ 29,90', // MODIFICADO: Preço atualizado
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
                        <img src={appConfig.site_logo} alt="Logo" className="h-8 w-8 md:h-10 md:w-10 object-contain hover:scale-110 transition-transform" />
                    ) : (
                        <WalletIcon className="h-8 w-8 md:h-10 md:w-10 text-brand-primary hover:scale-110 transition-transform" />
                    )}
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {['Benefícios', 'Planos', 'Depoimentos', 'Faq'].map((item) => ( 
                        <React.Fragment key={item}>
                            <button 
                                onClick={() => scrollToSection(item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))}
                                className="text-text-secondary hover:text-brand-primary font-medium transition-colors text-sm uppercase tracking-wider"
                            >
                                {item}
                            </button>
                        </React.Fragment>
                    ))}
                </nav>

                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={() => onStartAuth('login')}
                        className="text-text-primary hover:text-brand-primary font-bold py-1.5 px-3 md:py-2 md:px-4 text-xs md:text-sm transition-colors rounded-lg"
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => onStartAuth('signup')}
                        className="bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-4 md:py-2.5 md:px-5 rounded-lg text-xs md:text-sm transition-all shadow-glow hover:shadow-[0_0_25px_rgba(64,255,0,0.5)] transform hover:-translate-y-0.5"
                    >
                        Começar
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            {/* ADJUSTED: Changed padding to min-h-screen for better responsiveness on 1366x768 screens */}
            <section className="relative w-full min-h-[95vh] flex flex-col justify-center items-center z-10 px-4 pt-28 pb-16 md:pt-32 bg-[#050505]">
                <RevealOnScroll className="w-full max-w-5xl flex flex-col items-center text-center">
                    {appConfig?.site_logo ? (
                        <img src={appConfig.site_logo} alt="Logo" className="h-16 w-16 md:h-24 md:w-24 object-contain mx-auto mb-6 md:mb-8 drop-shadow-[0_0_15px_rgba(64,255,0,0.3)]" />
                    ) : (
                        <WalletIcon className="h-16 w-16 md:h-24 md:w-24 text-brand-primary mx-auto mb-6 md:mb-8 drop-shadow-[0_0_15px_rgba(64,255,0,0.3)]" />
                    )}
                    
                    {/* H1 Radley Font - Adjusted sizes for Laptop (md:text-6xl instead of 7xl) */}
                    <h1 className="font-radley text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-4 md:mb-6 leading-tight tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-brand-primary to-green-600 bg-[length:200%_auto] animate-gradient font-bold block sm:inline">Domine Suas Finanças</span>{' '}
                        <span className="block mt-2 sm:mt-0 sm:inline">Com Inteligência.</span>
                    </h1>
                    
                    <p className="text-base sm:text-lg md:text-2xl text-text-secondary mb-8 md:mb-10 max-w-2xl leading-relaxed">
                        Deixe de sobreviver e comece a prosperar. O sistema definitivo para quem quer controle total, previsibilidade e crescimento patrimonial.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-5 w-full justify-center">
                        <button
                            onClick={() => onStartAuth('signup')}
                            className="bg-brand-primary hover:bg-brand-secondary text-black font-extrabold py-3 px-6 md:py-4 md:px-10 rounded-lg text-base md:text-lg transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(64,255,0,0.4)] hover:shadow-[0_0_50px_rgba(64,255,0,0.6)] w-full sm:w-auto"
                        >
                            Assuma o Controle Agora
                        </button>
                        <button
                            onClick={() => scrollToSection('beneficios')}
                            className="bg-white/5 hover:bg-white/10 text-text-primary border border-white/10 font-bold py-3 px-6 md:py-4 md:px-10 rounded-lg text-base md:text-lg transition-all transform hover:scale-105 backdrop-blur-sm flex items-center justify-center gap-2 w-full sm:w-auto"
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
            {/* ADJUSTED: Increased vertical padding (py-20 md:py-24) to avoid overlap */}
            <section id="beneficios" className="relative w-full flex flex-col justify-center items-center bg-[#0a0a0a] z-10 px-4 py-20 md:py-24 scroll-mt-16 border-t border-white/5">
                <div className="max-w-7xl mx-auto text-center w-full">
                    <RevealOnScroll>
                        <h2 className="font-radley text-3xl md:text-5xl font-bold text-text-primary mb-6 md:mb-8 leading-tight">
                            Por que o Finz é <span className="text-brand-primary">melhor?</span>
                        </h2>
                        <p className="text-base md:text-lg text-text-secondary mb-12 md:mb-16 max-w-3xl mx-auto px-2">
                            Esqueça planilhas complexas e apps que não te entendem. Criamos a experiência financeira definitiva.
                        </p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {benefits.map((benefit, index) => (
                            <RevealOnScroll key={index} delay={index * 100} className="h-full">
                                <div className="group bg-[#121212] p-6 md:p-8 rounded-2xl border border-border hover:border-brand-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(64,255,0,0.1)] hover:-translate-y-2 h-full flex flex-col items-center">
                                    <div className="p-3 md:p-4 bg-white/5 rounded-xl mb-4 md:mb-6 group-hover:bg-brand-primary/20 transition-colors">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3 md:mb-4 group-hover:text-brand-primary transition-colors">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            {/* ADJUSTED: Increased vertical padding */}
            <section id="planos" className="relative w-full flex flex-col justify-center items-center bg-[#111] z-10 px-4 py-20 md:py-24 scroll-mt-16 border-t border-white/5">
                 <div className="max-w-7xl mx-auto text-center w-full">
                    <RevealOnScroll>
                        <h2 className="font-radley text-3xl md:text-5xl font-bold text-text-primary mb-6 md:mb-8">
                            Planos que Cabem no <span className="text-brand-primary block sm:inline">seu Bolso</span>
                        </h2>
                        <p className="text-base md:text-lg text-text-secondary mb-12 md:mb-16 max-w-2xl mx-auto">
                            Evolua conforme seu patrimônio cresce. Sem contratos de fidelidade.
                        </p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto items-stretch">
                        {plans.map((plan, index) => (
                            <RevealOnScroll key={index} delay={index * 150} className="h-full">
                                <div className={`relative flex flex-col h-full p-6 md:p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-2 ${plan.highlight ? 'bg-[#151515] border-brand-primary shadow-[0_0_40px_rgba(64,255,0,0.15)] md:scale-105 z-20' : 'bg-[#151515]/50 border-border hover:border-white/20 z-10'}`}>
                                    {plan.highlight && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-black font-bold px-3 py-1 md:px-4 rounded-lg text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 whitespace-nowrap shadow-lg">
                                            <CrownIcon className="h-3 w-3 md:h-4 md:w-4" />
                                            Mais Popular
                                        </div>
                                    )}
                                    <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
                                    <div className="mb-6 flex items-baseline justify-center">
                                        <span className="text-3xl md:text-4xl font-black text-text-primary">{plan.price}</span>
                                        {plan.period && <span className="text-text-secondary ml-1 text-sm md:text-base">{plan.period}</span>}
                                    </div>
                                    <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-left">
                                        {plan.features.map((feat, i) => (
                                            <li key={i} className="flex items-start text-text-secondary">
                                                <CheckIcon className={`h-4 w-4 md:h-5 md:w-5 mr-3 flex-shrink-0 ${plan.highlight ? 'text-brand-primary' : 'text-gray-500'}`} />
                                                <span className="text-sm">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => onStartAuth('signup')}
                                        className={`w-full py-3 md:py-4 rounded-lg font-bold transition-all text-sm md:text-base ${
                                            plan.highlight 
                                            ? 'bg-brand-primary hover:bg-brand-secondary text-black shadow-lg hover:shadow-brand-primary/50' 
                                            : 'bg-white/10 hover:bg-white/20 text-text-primary'
                                        }`}
                                    >
                                        Escolher {plan.name}
                                    </button>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            {/* ADJUSTED: Increased vertical padding */}
            <section id="depoimentos" className="relative w-full flex flex-col justify-center items-center bg-[#050505] z-10 px-4 py-20 md:py-24 scroll-mt-16 border-t border-white/5">
                <div className="max-w-7xl mx-auto text-center w-full">
                    <RevealOnScroll>
                        <h2 className="font-radley text-3xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
                            Aprovado por <span className="text-brand-primary block sm:inline">+100 clientes</span>
                        </h2>
                        <div className="flex flex-col items-center justify-center mb-12 md:mb-16">
                             <div className="flex items-center space-x-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon key={star} className="h-5 w-5 md:h-6 md:w-6 text-yellow-400 fill-yellow-400" />
                                ))}
                             </div>
                             <p className="text-text-secondary font-medium text-sm md:text-base">
                                 <span className="text-text-primary font-bold">4.9/5</span> de média baseada em avaliações reais
                             </p>
                        </div>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {testimonials.map((testimonial, index) => (
                            <RevealOnScroll key={index} delay={index * 100}>
                                <div className="bg-[#121212] p-6 md:p-8 rounded-2xl border border-border text-left hover:border-brand-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
                                    <div className="flex-1">
                                        <div className="mb-4 md:mb-6 opacity-30">
                                            <svg className="h-8 w-8 md:h-10 md:w-10 text-brand-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.896 14.321 15.923 14.929 15.081C15.537 14.239 16.29 13.565 17.189 13.058C18.089 12.551 19.062 12.298 20.108 12.298V9C18.735 9.07 17.472 9.563 16.319 10.479C15.166 11.395 14.399 12.569 14.017 14V9H11V21H14.017ZM8.017 21L8.017 18C8.017 16.896 8.321 15.923 8.929 15.081C9.537 14.239 10.29 13.565 11.189 13.058C12.089 12.551 13.062 12.298 14.108 12.298V9C12.735 9.07 11.472 9.563 10.319 10.479C9.166 11.395 8.399 12.569 8.017 14V9H5V21H8.017Z"/></svg>
                                        </div>
                                        <p className="text-text-primary text-base md:text-xl italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                                    </div>
                                    <div className="flex items-center mt-auto border-t border-white/5 pt-6">
                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-brand-primary to-green-800 flex items-center justify-center font-bold text-black text-base md:text-lg mr-4">
                                            {testimonial.author.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-primary text-sm md:text-base">{testimonial.author}</p>
                                            <p className="text-text-secondary text-xs md:text-sm">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            {/* ADJUSTED: Increased vertical padding */}
            <section id="faq" className="relative w-full flex flex-col justify-center items-center bg-[#0a0a0a] z-10 px-4 py-20 md:py-24 scroll-mt-16 border-t border-white/5">
                <div className="max-w-4xl mx-auto w-full">
                    <RevealOnScroll className="text-center mb-12 md:mb-16">
                        <h2 className="font-radley text-3xl md:text-5xl font-bold text-text-primary mb-4">
                            Perguntas <span className="text-brand-primary">Frequentes</span>
                        </h2>
                        <p className="text-text-secondary text-sm md:text-base">Tire suas dúvidas e comece com confiança.</p>
                    </RevealOnScroll>
                    
                    <div className="space-y-3 md:space-y-4">
                        {faqItems.map((item, index) => (
                            <RevealOnScroll key={index} delay={index * 50}>
                                <div className="bg-[#121212] border border-border rounded-xl overflow-hidden hover:border-brand-primary/30 transition-colors">
                                    <button
                                        className="flex justify-between items-center w-full p-4 md:p-6 text-left"
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    >
                                        <span className="text-base md:text-xl font-bold text-text-primary pr-4">{item.question}</span>
                                        <ChevronRightIcon className={`h-5 w-5 md:h-6 md:w-6 flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-90 text-brand-primary' : 'text-text-secondary'}`} />
                                    </button>
                                    <div 
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                    >
                                        <p className="px-4 pb-4 md:px-6 md:pb-6 text-text-secondary text-sm md:text-base leading-relaxed">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative w-full py-8 md:py-12 bg-card border-t border-border z-10 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center">
                         {appConfig?.site_logo ? (
                            <img src={appConfig.site_logo} alt="Logo" className="h-6 w-6 md:h-8 md:w-8 object-contain opacity-50 grayscale hover:grayscale-0 transition-all" />
                        ) : (
                            <WalletIcon className="h-6 w-6 md:h-8 md:w-8 text-text-secondary" />
                        )}
                        <span className="ml-3 text-text-secondary text-xs md:text-sm">&copy; {new Date().getFullYear()} {appConfig?.site_name || 'FinzAI'}.</span>
                    </div>
                    {/* Fix: Wrap the navigation links in a common parent element (e.g., a div) */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-text-secondary">
                        <button onClick={onViewTerms} className="hover:text-brand-primary transition-colors">Termos de Uso</button>
                        <button onClick={onViewPrivacy} className="hover:text-brand-primary transition-colors">Privacidade</button>
                        <a href="#" className="hover:text-brand-primary transition-colors">Suporte</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;