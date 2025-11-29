import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/Icons';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('finz_cookie_consent');
        if (!consent) {
            // Pequeno delay para animação de entrada
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('finz_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('finz_cookie_consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[100] animate-fade-in-up">
            <div className="bg-card/95 backdrop-blur-md border border-border p-5 rounded-2xl shadow-2xl flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">🍪</span>
                    <div>
                        <h4 className="font-bold text-text-primary mb-1">Cookies & Privacidade</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Nós utilizamos cookies para melhorar sua experiência e analisar o tráfego. Ao continuar, você concorda com nossos termos.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 mt-1">
                    <button 
                        onClick={handleDecline}
                        className="flex-1 py-2 px-3 text-xs font-bold text-text-secondary hover:text-text-primary bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        Recusar
                    </button>
                    <button 
                        onClick={handleAccept}
                        className="flex-1 py-2 px-3 text-xs font-bold text-black bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors shadow-glow"
                    >
                        Aceitar Cookies
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;