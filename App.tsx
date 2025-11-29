import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';
import { getProfile, getAppConfig } from './services/api';
import type { Role, AppConfig } from './types';
import AuthComponent from './components/Auth';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import InvestmentsPage from './pages/InvestmentsPage';
import CreditCardsPage from './pages/CreditCardsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import LandingPage from './pages/LandingPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CheckoutPage from './pages/CheckoutPage'; 
import { Page } from './types';
import { WalletIcon } from './components/icons/Icons';
import Spinner from './components/Spinner';

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes in milliseconds

const getLocationFromHash = () => {
    let path = window.location.hash.substring(1); 
    if (!path) {
        return '/';
    }
    if (!path.startsWith('/')) {
        path = '/' + path;
    }
    return path;
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [location, setLocation] = useState(getLocationFromHash());
  const mounted = useRef(true); 

  const navigate = useCallback((path: string) => {
    const newPath = path.startsWith('/') ? path : '/' + path;
    console.log(`[App.navigate] Attempting to set hash to '${newPath}'. Current hash: '${window.location.hash}'`);
    if (`#${newPath}` !== window.location.hash) {
      window.location.hash = newPath;
    } else {
      setLocation(newPath); // Still update internal state even if hash didn't change
    }
  }, []); 
  
  useEffect(() => {
    const handleHashChange = () => {
      const newLocation = getLocationFromHash();
      console.log(`[App.handleHashChange] Hash changed from '${location}' to '${newLocation}'`);
      setLocation(newLocation);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [location]); // Dependência adicionada para registrar 'location' corretamente

  const fetchUserAndProfile = useCallback(async (currentSession: Session | null) => {
    if (!mounted.current) return;
    console.log("[App.fetchUserAndProfile] Initiating fetch for session:", currentSession?.user?.id ? "authenticated" : "unauthenticated");
    setLoading(true); // Sempre setar loading como true ao iniciar a busca
    if (currentSession) {
      try {
        const profileData = await getProfile(currentSession.user.id);
        if (mounted.current) {
            // Treat 'onboarding' role as 'basic' for navigation purposes.
            // New signups now go directly to 'basic' role, but this handles legacy or direct DB manipulation.
            setUserRole(profileData?.role === 'onboarding' ? 'basic' : profileData?.role || null);
        }
        console.log("[App.fetchUserAndProfile] User role fetched:", profileData?.role);
      } catch (e) {
        console.error("[App.fetchUserAndProfile] Error fetching user role", e);
        if (mounted.current) setUserRole(null); // Resetar role em caso de erro
      } finally {
        if (mounted.current) setLoading(false); // Finalizar loading após a busca (sucesso ou falha)
        console.log("[App.fetchUserAndProfile] Loading set to false.");
      }
    } else {
      if (mounted.current) {
        setUserRole(null);
        const currentPath = getLocationFromHash();
        console.log("[App.fetchUserAndProfile] User unauthenticated. Current path:", currentPath);
        if (!['/', '/login', '/signup', '/terms', '/privacy'].includes(currentPath)) {
            console.log("[App.fetchUserAndProfile] Redirecting unauthenticated user to '/'");
            navigate('/');
        }
        setLoading(false); // Finalizar loading para usuários deslogados
        console.log("[App.fetchUserAndProfile] Loading set to false for unauthenticated user.");
      }
    }
  }, [navigate]); // navigate é uma dependência

  useEffect(() => {
    mounted.current = true; 
    console.log("[App] Component mounted. Starting initial data fetch.");

    getAppConfig().then(config => {
        if(mounted.current && config) {
            setAppConfig(config);
            applySiteConfig(config);
        }
    }).catch(err => console.error("[App] Config fetch error:", err));

    supabase.auth.getSession().then(async ({ data }) => {
        if (!mounted.current) return;
        console.log("[App] Initial getSession data:", data.session ? `authenticated (${data.session.user.id})` : "unauthenticated");
        // Apenas setar a sessão. O onAuthStateChange será disparado com a sessão inicial.
        setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted.current) return;
      console.log(`[App.onAuthStateChange] Event: ${_event}, newSession user: ${newSession?.user?.id || 'null'}`);
      
      const oldUserId = session?.user?.id;
      const newUserId = newSession?.user?.id;

      // Se a sessão de usuário mudou ou houve uma transição de/para autenticado
      if (oldUserId !== newUserId || (!session && newSession) || (session && !newSession)) {
          setSession(newSession); 
          await fetchUserAndProfile(newSession);
      } else {
          // Se a sessão não mudou de usuário (ex: token refresh), apenas atualiza o objeto session
          setSession(newSession);
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
      console.log("[App] Component unmounted. Cleaning up.");
    };
  }, [fetchUserAndProfile, session?.user?.id]); // Adiciona session?.user?.id como dependência

  const applySiteConfig = (config: AppConfig) => {
      if (config.site_name) document.title = config.site_name;
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
           const existingIcons = document.querySelectorAll("link[rel*='icon']");
           existingIcons.forEach(el => el.remove());
           const link = document.createElement('link');
           link.type = 'image/x-icon';
           link.rel = 'icon';
           link.href = config.site_favicon;
           document.head.appendChild(link);
      }
  };

  useEffect(() => {
      if (appConfig) applySiteConfig(appConfig);
  }, [appConfig]);

  useEffect(() => {
      if (!session) return;
      let timeoutId: ReturnType<typeof setTimeout>;
      const handleLogout = async () => {
          console.log("[App.inactivity] Sessão expirada por inatividade.");
          await supabase.auth.signOut();
          alert("Sua sessão expirou após 15 minutos de inatividade. Por favor, faça login novamente.");
          navigate('/');
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
  }, [session, navigate]); 

  const renderPage = () => {
    // Only render internal pages if session and userRole are ready and not null
    if (!session || !userRole) { // Simplified check
        console.log("[App.renderPage] Not rendering internal page: session or role not ready.");
        return null; 
    }

    switch (activePage) {
      case 'dashboard':
        return <DashboardPage user={session.user} />;
      case 'transactions':
        return <TransactionsPage user={session.user} />;
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
  
  const handleCheckoutSuccess = async () => {
    if (session) {
      console.log("[App.handleCheckoutSuccess] Checkout completed. Refetching profile.");
      setLoading(true);
      try {
          const profile = await getProfile(session.user.id);
          if (profile && profile.role && profile.role !== 'onboarding') {
            if (mounted.current) {
                setUserRole(profile.role);
                console.log("[App.handleCheckoutSuccess] Profile updated to non-onboarding role. Navigating to /dashboard.");
                navigate('/dashboard');
            }
          } else {
              console.warn("[App.handleCheckoutSuccess] Role was not updated to a paid plan after checkout. Staying on checkout flow or navigating to dashboard if 'onboarding' is now allowed.");
              if (mounted.current) {
                // If it's still 'onboarding', treat as 'basic' as per the new rule
                setUserRole(profile?.role === 'onboarding' ? 'basic' : profile?.role || null); 
                navigate('/dashboard'); // Go to dashboard, even if role is 'onboarding' (now treated as basic)
              }
          }
      } catch (e) {
          console.error("[App.handleCheckoutSuccess] Erro ao atualizar role após checkout", e);
          if (mounted.current) {
            setUserRole(null); 
            navigate('/dashboard'); // In case of error, redirect to dashboard.
          }
      } finally {
          if (mounted.current) setLoading(false);
          console.log("[App.handleCheckoutSuccess] Loading set to false.");
      }
    }
  };

  if (loading) {
    console.log("[App] Displaying spinner (loading).");
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background space-y-4">
        <Spinner size="lg" />
        <p className="text-text-secondary animate-pulse text-sm">Carregando...</p>
      </div>
    );
  }

  // Rota 1: Usuários não autenticados
  if (!session) {
      console.log("[App] User is NOT authenticated. Current location:", location);
      switch(location) {
          case '/login':
              return <AuthComponent appConfig={appConfig} defaultMode="login" navigate={navigate} />;
          case '/signup':
              return <AuthComponent appConfig={appConfig} defaultMode="signup" navigate={navigate} />;
          case '/terms':
              return <TermsPage appConfig={appConfig} onBack={() => navigate('/')} />;
          case '/privacy':
              return <PrivacyPage appConfig={appConfig} onBack={() => navigate('/')} />;
          case '/':
              return <LandingPage 
                        appConfig={appConfig} 
                        onStartAuth={(mode) => navigate(mode === 'login' ? '/login' : '/signup')} 
                        onViewTerms={() => navigate('/terms')}
                        onViewPrivacy={() => navigate('/privacy')}
                     />;
          default:
              console.log("[App] Unauthenticated user trying to access restricted path. Redirecting to '/'.");
              navigate('/');
              return null;
      }
  }

  // Rota 2: Usuário autenticado com role definida (basic, pro, admin, ou 'onboarding' que agora é tratada como 'basic')
  if (session && userRole) { // Simplified condition
      console.log(`[App] User ${session.user.id} is authenticated with role '${userRole}'. Current location: '${location}'.`);
      if (['/', '/login', '/signup'].includes(location)) {
        console.log("[App] Authenticated user on public auth path. Redirecting to '/dashboard'.");
        navigate('/dashboard');
        return null;
      }
      
      // Allow authenticated users to access checkout if they want (e.g., upgrade)
      if (location === '/checkout') {
         console.log("[App] Authenticated user with valid role accessing '/checkout'. Displaying checkout page.");
         return <CheckoutPage user={session.user} appConfig={appConfig} onSuccess={handleCheckoutSuccess} />;
      }

      if (location === '/terms') {
        return <TermsPage appConfig={appConfig} onBack={() => navigate('/dashboard')} />;
      }
      if (location === '/privacy') {
        return <PrivacyPage appConfig={appConfig} onBack={() => navigate('/dashboard')} />;
      }

      console.log("[App] Rendering main application for authenticated user with valid role.");
      return (
        <div className="font-sans h-[100dvh] bg-background text-text-primary flex flex-col">
            <header className="md:hidden flex-none h-16 bg-card border-b border-border z-30 flex items-center justify-end px-4 shadow-sm relative">
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
                    {appConfig?.site_logo ? (
                        <img src={appConfig.site_logo} alt="Logo" className="h-12 w-12 object-contain" />
                    ) : (
                        <WalletIcon className="h-12 w-12 text-brand-primary" />
                    )}
                    </div>
                    <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="text-text-primary font-bold bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 z-10"
                    >
                        Menu
                    </button>
            </header>

            <header className="hidden md:flex flex-none h-16 bg-card border-b border-border z-30 items-center justify-center shadow-md">
                    <div className="flex items-center">
                    {appConfig?.site_logo ? (
                        <img src={appConfig.site_logo} alt="Logo" className="h-12 w-12 object-contain" />
                    ) : (
                        <WalletIcon className="h-12 w-12 text-brand-primary" />
                    )}
                    </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar 
                    activePage={activePage} 
                    setActivePage={setActivePage} 
                    userRole={userRole} 
                    logoUrl={appConfig?.site_logo}
                    siteName={appConfig?.site_name}
                    isMobileOpen={isMobileMenuOpen}
                    setIsMobileOpen={setIsMobileMenuOpen}
                />
                
                <main className="flex-1 overflow-y-auto bg-background px-4 pt-4 sm:p-6 lg:p-8 w-full custom-scrollbar relative overscroll-behavior-y-contain pb-32 md:pb-8">
                    {renderPage()}
                </main>
            </div>
        </div>
      );
  }

  console.log("[App] Fallback: Displaying spinner. This state should ideally not be reached.");
  return <Spinner />;
};

export default App;