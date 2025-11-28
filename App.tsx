
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';
import { getProfile, getAppConfig } from './services/api';
import type { Role, AppConfig } from './types';
import AuthComponent from './components/Auth';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import InsightsPage from './pages/InsightsPage';
import InvestmentsPage from './pages/InvestmentsPage';
import CreditCardsPage from './pages/CreditCardsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import { Page } from './types';
import { WalletIcon } from './components/icons/Icons';
import Spinner from './components/Spinner';

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes in milliseconds

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<Role>('basic');
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    let mounted = true;

    const initApp = async () => {
      // 1. Configuração do listener de Auth
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        
        if (session) {
          if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
              setActivePage('dashboard');
          }
          
          getProfile(session.user.id)
            .then(profile => {
                if (mounted && profile) setUserRole(profile.role);
            })
            .catch(e => console.error("Error fetching user role", e));
        } else {
            setUserRole('basic');
        }
        setLoading(false);
      });

      // 2. Verificação inicial e Carregamento de Config
      try {
        const [configResult, sessionResult] = await Promise.allSettled([
            getAppConfig(),
            supabase.auth.getSession()
        ]);

        if (!mounted) return;

        // Tratar Configurações e aplicar imediatamente
        if (configResult.status === 'fulfilled') {
            const config = configResult.value;
            setAppConfig(config);
            applySiteConfig(config);
        }

        // Tratar Sessão Inicial
        if (sessionResult.status === 'fulfilled') {
            const { data } = sessionResult.value;
            if (data.session) {
                setSession(data.session);
                try {
                    const profile = await getProfile(data.session.user.id);
                    if (mounted && profile) setUserRole(profile.role);
                } catch (e) { console.error(e); }
            }
        }

      } catch (err) {
          console.error("Initialization error:", err);
      } finally {
          if (mounted) setLoading(false);
      }

      return () => {
        subscription.unsubscribe();
      };
    };

    initApp();

    return () => {
        mounted = false;
    };
  }, []);

  // Helper function for SEO updates
  const applySiteConfig = (config: AppConfig) => {
      if (config.site_name) {
          document.title = config.site_name;
      }
      
      const updateMeta = (name: string, content: string | undefined) => {
          if (!content) return;
          let meta = document.querySelector(`meta[name="${name}"]`);
          if (!meta) {
              meta = document.createElement('meta');
              meta.setAttribute('name', name);
              document.head.appendChild(meta);
          }
          meta.setAttribute('content', content);
      };

      updateMeta('description', config.site_description);
      updateMeta('keywords', config.site_keywords);
      updateMeta('author', config.site_author);
      
      const updateOg = (property: string, content: string | undefined) => {
         if (!content) return;
          let meta = document.querySelector(`meta[property="${property}"]`);
          if (!meta) {
              meta = document.createElement('meta');
              meta.setAttribute('property', property);
              document.head.appendChild(meta);
          }
          meta.setAttribute('content', content);
      }
      updateOg('og:title', config.site_name);
      updateOg('og:description', config.site_description);
      updateOg('og:image', config.site_og_image);

      if (config.site_favicon) {
           // Remove existing icons to force update
           const existingIcons = document.querySelectorAll("link[rel*='icon']");
           existingIcons.forEach(el => el.remove());

           const link = document.createElement('link');
           link.type = 'image/x-icon';
           link.rel = 'icon';
           link.href = config.site_favicon;
           document.head.appendChild(link);
      }
  };

  // Re-apply config if it changes
  useEffect(() => {
      if (appConfig) {
          applySiteConfig(appConfig);
      }
  }, [appConfig]);

  // Inactivity Timer Effect
  useEffect(() => {
      if (!session) return;

      let timeoutId: ReturnType<typeof setTimeout>;

      const handleLogout = async () => {
          console.log("Sessão expirada por inatividade.");
          await supabase.auth.signOut();
          alert("Sua sessão expirou após 15 minutos de inatividade. Por favor, faça login novamente.");
      };

      const resetTimer = () => {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(handleLogout, INACTIVITY_LIMIT);
      };

      const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
      events.forEach(event => document.addEventListener(event, resetTimer));
      resetTimer();

      return () => {
          if (timeoutId) clearTimeout(timeoutId);
          events.forEach(event => document.removeEventListener(event, resetTimer));
      };
  }, [session]);

  const renderPage = () => {
    if (!session) return null;
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage user={session.user} />;
      case 'transactions':
        return <TransactionsPage user={session.user} />;
      case 'insights':
        return <InsightsPage user={session.user} />;
      case 'investments':
        return <InvestmentsPage user={session.user} />;
      case 'credit-cards':
        return <CreditCardsPage user={session.user} />;
      case 'profile':
        return <ProfilePage user={session.user} />;
      case 'admin':
        return <AdminPage user={session.user} />;
      default:
        return <DashboardPage user={session.user} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background space-y-4">
        <Spinner size="lg" />
        <p className="text-text-secondary animate-pulse text-sm">Carregando {appConfig?.site_name || 'FinzAI'}...</p>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-background text-text-primary">
      {!session ? (
        <AuthComponent />
      ) : (
        <>
            {/* Desktop Sticky Header */}
            <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 items-center justify-center shadow-md">
                 <div className="flex items-center">
                    {appConfig?.site_logo ? (
                        <img src={appConfig.site_logo} alt="Logo" className="h-8 w-8 object-contain" />
                    ) : (
                        <WalletIcon className="h-8 w-8 text-brand-primary" />
                    )}
                    <span className="ml-2 font-bold text-xl text-text-primary tracking-tight">{appConfig?.site_name || 'FinzAI'}</span>
                 </div>
            </header>

            <div className="flex pt-0 md:pt-16 h-screen">
            <Sidebar 
                activePage={activePage} 
                setActivePage={setActivePage} 
                userRole={userRole} 
                logoUrl={appConfig?.site_logo}
                siteName={appConfig?.site_name}
            />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 mt-16 md:mt-0 bg-background">
                {renderPage()}
            </main>
            </div>
        </>
      )}
    </div>
  );
};

export default App;
