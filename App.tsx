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
  // const [activePage, setActivePage] = useState<Page>('dashboard'); // REMOVIDO: Agora a página é derivada do location
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
            // FIX: Revert 'onboarding' role to its actual value, do not map to 'basic' here.
            // If profileData exists but role is null, or if fetching fails, default to 'onboarding' for authenticated users.
            // This ensures the app handles new users or users with transient profile fetch issues and directs them to a path.
            setUserRole(profileData?.role || 'onboarding'); // Default to 'onboarding' if role is not explicitly set or fetch fails.
        }
        console.log("[App.fetchUserAndProfile] User role fetched:", profileData?.role, "-> set to", profileData?.role || 'onboarding');
      } catch (e) {
        console.error("[App.fetchUserAndProfile] Error fetching user role", e);
        if (mounted.current) setUserRole('onboarding'); // Default to 'onboarding' on error to prevent infinite loading.
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

    // Fetch initial session once and handle initial user and profile state.
    supabase.auth.getSession().then(async ({ data }) => {
        if (!mounted.current) return;
        console.log("[App] Initial getSession data:", data.session ? `authenticated (${data.session.user.id})` : "unauthenticated");
        setSession(data.session); // Update session state
        // Manually trigger profile fetch for the initial session.
        await fetchUserAndProfile(data.session); 
    });

    // Set up the auth state change listener.
    // This listener will handle subsequent changes (login, logout, token refresh).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted.current) return;
      console.log(`[App.onAuthStateChange] Event: ${_event}, newSession user: ${newSession?.user?.id || 'null'}`);
      
      // Always update the session state with the new session.
      // This will trigger a re-render.
      setSession(newSession); 

      // Always refetch profile data when auth state changes (login, logout, token refresh, initial session).
      // This ensures the userRole is always in sync with the current authentication status.
      await fetchUserAndProfile(newSession);
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
      console.log("[App] Component unmounted. Cleaning up.");
    };
  }, [fetchUserAndProfile]); // Depend only on fetchUserAndProfile which is useCallback-memoized

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

  // NOVO: Função para determinar a página atual baseada na URL
  const getCurrentPageFromLocation = (path: string): Page => {
    switch (path) {
      case '/dashboard':
        return 'dashboard';
      case '/transactions':
        return 'transactions';
      case '/investments':
        return 'investments';
      case '/credit-cards':
        return 'credit-cards';
      case '/profile':
        return 'profile';
      case '/admin':
        return 'admin';
      default:
        // Se a rota não for uma página interna conhecida, mas o usuário está logado, default para dashboard
        return 'dashboard'; 
    }
  };

  // NOVO: Função para renderizar as páginas internas com base na localização atual
  const renderInternalPageContent = (currentLocation: string) => {
    if (!session || !userRole || userRole === 'onboarding') {
        // Isso não deve ser chamado se o userRole for 'onboarding' ou se não houver sessão,
        // pois a lógica externa já redirecionou.
        console.warn("[App.renderInternalPageContent] Called without valid session/role or with onboarding role.");
        return null;
    }
    
    // Converte a string da rota em um tipo Page
    const pageToRender: Page = getCurrentPageFromLocation(currentLocation);

    switch (pageToRender) {
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
        // Fallback para dashboard se a rota interna não for reconhecida, mas o usuário estiver autenticado e não-onboarding.
        return <DashboardPage user={session.user} />;
    }
  };
  
  const handleCheckoutSuccess = async () => {
    if (session) {
      console.log("[App.handleCheckoutSuccess] Checkout completed. Navigating to /dashboard.");
      // O fetchUserAndProfile no onAuthStateChange eventualmente atualizará a role
      // e a re-renderização do App.tsx levará ao Dashboard ou Checkout se a role ainda for 'onboarding'.
      // Chamamos navigate para forçar a mudança de rota.
      navigate('/dashboard'); 
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

  // Rota 2: Usuário autenticado com role definida
  if (session && userRole) {
      console.log(`[App] User ${session.user.id} is authenticated with role '${userRole}'. Current location: '${location}'.`);
      
      // Se um usuário autenticado está em uma rota pública de autenticação, redirecionar.
      if (['/', '/login', '/signup'].includes(location)) {
          if (userRole === 'onboarding') {
              console.log("[App] Authenticated 'onboarding' user on public auth path. Redirecting to '/checkout'.");
              navigate('/checkout');
              return null;
          } else {
              console.log("[App] Authenticated user with valid role on public auth path. Redirecting to '/dashboard'.");
              navigate('/dashboard');
              return null;
          }
      }

      // NOVO: Força usuários 'onboarding' para a página de checkout
      if (userRole === 'onboarding' && location !== '/checkout') {
          console.log("[App] Authenticated 'onboarding' user attempting to access restricted path. Redirecting to '/checkout'.");
          navigate('/checkout');
          return null;
      }

      // Lidar com páginas específicas acessíveis a todos os usuários autenticados (incluindo 'onboarding')
      if (location === '/checkout') {
         console.log("[App] Authenticated user accessing '/checkout'. Displaying checkout page.");
         return <CheckoutPage user={session.user} appConfig={appConfig} onSuccess={handleCheckoutSuccess} />;
      }
      if (location === '/terms') {
        return <TermsPage appConfig={appConfig} onBack={() => navigate('/dashboard')} />;
      }
      if (location === '/privacy') {
        return <PrivacyPage appConfig={appConfig} onBack={() => navigate('/dashboard')} />;
      }

      // FIX: Só renderiza a estrutura principal do aplicativo se o usuário NÃO for 'onboarding'
      if (userRole !== 'onboarding') { 
          console.log("[App] Rendering main application for authenticated user with valid role (not onboarding).");
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
                        activePage={getCurrentPageFromLocation(location)} // Passa a página atual derivada da URL
                        navigate={navigate} // Passa a função navigate para o Sidebar
                        userRole={userRole} 
                        logoUrl={appConfig?.site_logo}
                        siteName={appConfig?.site_name}
                        isMobileOpen={isMobileMenuOpen}
                        setIsMobileOpen={setIsMobileMenuOpen}
                    />
                    
                    <main className="flex-1 overflow-y-auto bg-background px-4 pt-4 sm:p-6 lg:p-8 w-full custom-scrollbar relative overscroll-behavior-y-contain pb-32 md:pb-8">
                        {renderInternalPageContent(location)} {/* Renderiza o conteúdo da página interna baseado na location */}
                    </main>
                </div>
            </div>
          );
      }
  }

  console.log("[App] Fallback: Displaying spinner. This state should ideally not be reached.");
  return <Spinner />;
};

export default App;