import React, { useEffect } from 'react';
import { WalletIcon, ChevronLeftIcon } from '../components/icons/Icons';
import { AppConfig } from '../types';

interface TermsPageProps {
    appConfig: AppConfig | null;
    onBack: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ appConfig, onBack }) => {
    useEffect(() => window.scrollTo(0, 0), []);

    return (
        <div className="min-h-screen bg-background text-text-primary p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={onBack}
                    className="flex items-center text-text-secondary hover:text-brand-primary mb-8 transition-colors group"
                >
                    <ChevronLeftIcon className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Voltar para Início
                </button>
                
                <header className="mb-12 border-b border-border pb-8">
                     <div className="flex items-center gap-3 mb-6">
                        {appConfig?.site_logo ? (
                            <img src={appConfig.site_logo} alt="Logo" className="h-10 w-10 object-contain" />
                        ) : (
                            <WalletIcon className="h-10 w-10 text-brand-primary" />
                        )}
                        <span className="font-radley text-2xl font-bold">{appConfig?.site_name || 'FinzAI'}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Termos de Uso</h1>
                    <p className="text-text-secondary">Última atualização: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="space-y-8 text-text-secondary leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">1. Aceitação dos Termos</h2>
                        <p>Ao acessar e utilizar a plataforma {appConfig?.site_name || 'FinzAI'}, você concorda integralmente com estes Termos de Uso e com nossa Política de Privacidade. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">2. Uso da Plataforma</h2>
                        <p>Nossa plataforma oferece ferramentas para gestão financeira pessoal. Você concorda em utilizar o serviço apenas para fins lícitos e de acordo com as leis vigentes. É proibido tentar acessar áreas restritas, engenharia reversa ou qualquer ação que comprometa a segurança do sistema.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">3. Contas e Assinaturas</h2>
                        <p>Para acessar recursos avançados, pode ser necessário criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais. Os planos pagos (Básico e Pro) são cobrados mensalmente e podem ser cancelados a qualquer momento.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">4. Limitação de Responsabilidade</h2>
                        <p>O {appConfig?.site_name || 'FinzAI'} fornece informações baseadas nos dados inseridos pelo usuário. Não nos responsabilizamos por decisões financeiras tomadas com base no uso da plataforma. O serviço é fornecido "como está".</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;