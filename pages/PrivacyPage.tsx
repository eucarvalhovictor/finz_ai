import React, { useEffect } from 'react';
import { WalletIcon, ChevronLeftIcon } from '../components/icons/Icons';
import { AppConfig } from '../types';

interface PrivacyPageProps {
    appConfig: AppConfig | null;
    onBack: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ appConfig, onBack }) => {
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
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Política de Privacidade</h1>
                    <p className="text-text-secondary">Última atualização: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="space-y-8 text-text-secondary leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">1. Coleta de Dados</h2>
                        <p>Coletamos informações essenciais para o funcionamento do serviço, como nome, e-mail e dados financeiros inseridos manualmente por você. Não temos acesso direto às suas contas bancárias a menos que integradas explicitamente.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">2. Uso das Informações</h2>
                        <p>Seus dados são utilizados exclusivamente para:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Fornecer e personalizar o dashboard financeiro;</li>
                            <li>Processar pagamentos de assinaturas;</li>
                            <li>Melhorar a segurança e funcionalidade da plataforma.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">3. Proteção e Segurança</h2>
                        <p>Utilizamos criptografia de ponta a ponta e padrões de segurança da indústria para proteger seus dados. Seus dados financeiros não são vendidos ou compartilhados com terceiros para fins de marketing.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">4. Cookies</h2>
                        <p>Utilizamos cookies para memorizar suas preferências e sessão de login. Você pode gerenciar suas preferências de cookies através das configurações do seu navegador ou do nosso banner de consentimento.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;