import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';
import { getProfile, getAppConfig } from './services/api';
import type { Role, AppConfig, Page } from './types';
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
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estado para detectar carregamento demorado (loop infinito)
  const [showEmergencyExit, setShowEmergencyExit] = useState(false);
  
  const [location, setLocation] = useState(getLocationFromHash());
  const mounted = useRef(true); 

  const navigate = useCallback((path: string) => {
    const newPath = path.startsWith('/') ? path : '/' + path;
    console.log(`[App.navigate] Attempting to set hash to '${newPath}'. Current hash: '${window.location.hash}'`);
    if (`#${newPath}` !== window.location.hash) {
      window.location.hash = newPath;
    } 
    // Always update internal state immediately, even if hash didn't change (e.g., if already on the path).
    // This ensures consistency and helps prevent infinite re-renders or missed state updates.
    setLocation(newPath); 
  }, []); 
  
  useEffect(() => {
    // This useEffect should only set up the hashchange listener once.
    // The listener's callback should directly update `location` state.
    const handleHashChange = () => {
      const newLocation = getLocationFromHash();
      console.log(`[App.handleHashChange] Hash changed to '${newLocation}'`);
      setLocation(newLocation); // This update will trigger a re-render
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []); // NO DEPENDENCIES here. Listener is set up once.

  // Monitor de carregamento demorado (Safety Timeout)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (loading) {
        timer = setTimeout(() => {
            if (mounted.current) setShowEmergencyExit(true);
        }, 5000); // Se carregar por mais de 5 segundos, mostra botão de emergência
    } else {
        setShowEmergencyExit(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleEmergencySignOut = async () => {
      console.warn("Emergency Sign Out Triggered");
      try {
          setLoading(true);
          // Limpa tudo que pode estar corrompido
          sessionStorage.clear();
          localStorage.clear();
          await supabase.auth.signOut();
      } catch (e) {
          console.error("Error during emergency signout", e);
      } finally {
          window.location.hash = '';
          window.location.reload(); // Força recarregamento limpo
      }
  };

  const fetchUserAndProfile = useCallback(async (currentSession: Session | null) => {
    if (!mounted.current) return;
    console.log("[App.fetchUserAndProfile] Initiating fetch for session:", currentSession?.user?.id ? "authenticated" : "unauthenticated");
    setLoading(true); 
    
    try {
        if (currentSession) {
        // SECURITY FIX: Check for the new signup flag in SessionStorage.
        // If present, this user JUST signed up and MUST be treated as 'onboarding',
        // regardless of what the database says (race condition protection).
        const isNewSignup = sessionStorage.getItem('finz_new_signup') === 'true';

        if (isNewSignup) {
            console.log("[App.fetchUserAndProfile] 'finz_new_signup' flag detected. Forcing role to 'onboarding'.");
            if (mounted.current) {
                setUserRole('onboarding');
                setLoading(false);
            }
            return; // Skip DB fetch entirely to prevent reading stale 'basic' role
        }

        let profileData = null;
        let retries = 0;
        const maxRetries = 5; 
        const retryDelay = 700; // milliseconds

        while (retries < maxRetries) {
            try {
                profileData = await getProfile(currentSession.user.id);
                // If profile is found and role is not null, AND it's not 'basic' (meaning it's onboarding/pro/admin)
                // OR if it's explicitly 'onboarding', we are good.
                if (profileData && profileData.role && profileData.role !== 'basic') {
                    console.log(`[App.fetchUserAndProfile] Profile with role '${profileData.role}' found after ${retries} tries.`);
                    break; 
                }
                if (profileData && profileData.role === 'basic' && retries < maxRetries -1) {
                    // If it's 'basic' but we expect 'onboarding' (new user), retry
                    console.warn(`[App.fetchUserAndProfile] Profile role is 'basic' (possibly default). Retrying in ${retryDelay}ms to check for updates...`);
                    await new Promise(res => setTimeout(res, retryDelay));
                } else if (!profileData || profileData.role === null) {
                    // Profile not found or role is null, retry assuming latency
                    console.warn(`[App.fetchUserAndProfile] Profile data or role is null. Retrying in ${retryDelay}ms...`);
                    await new Promise(res => setTimeout(res, retryDelay));
                } else {
                    // If it's 'basic' and max retries reached, or it's already a valid role, break.
                    break;
                }
            } catch (e: any) {
                console.error(`[App.fetchUserAndProfile] Error fetching profile (retry ${retries + 1}/${maxRetries}):`, e);
                if (e.code === 'PGRST116') { // Profile not found
                    console.warn("[App.fetchUserAndProfile] Profile record not found yet. Retrying in case of latency...");
                    await new Promise(res => setTimeout(res, retryDelay));
                } else {
                    // Other errors, don't retry, just treat as missing profile and default to onboarding.
                    profileData = null; 
                    break;
                }
            }
            retries++;
        }

        if (mounted.current) {
            let determinedRole: Role;
            if (profileData && profileData.role) {
                determinedRole = profileData.role;
            } else {
                // FALLBACK CRÍTICO: Se falhar tudo, define como onboarding para não quebrar a UI
                console.warn("[App.fetchUserAndProfile] Could not determine role from DB. Defaulting to 'onboarding' to prevent infinite loop.");
                determinedRole = 'onboarding'; 
            }
            setUserRole(determinedRole);
            console.log("[App.fetchUserAndProfile] Final determined user role:", determinedRole);
        }

        } else { // User is not authenticated
        if (mounted.current) {
            setUserRole(null);
            const currentPath = getLocationFromHash();
            console.log("[App.fetchUserAndProfile] User unauthenticated. Current path:", currentPath);
            if (!['/', '/login', '/signup', '/terms', '/privacy'].includes(currentPath)) {
                console.log("[App.fetchUserAndProfile] Redirecting unauthenticated user to '/'");
                navigate('/');
            }
        }
        }
    } catch (err) {
        console.error("[App.fetchUserAndProfile] Critical error in auth flow:", err);
        // Em caso de erro crítico não tratado, força logout para resetar estado
        if (mounted.current) {
             // Não chamamos handleEmergencySignOut aqui para evitar loop de reload, mas paramos o loading
        }
    } finally {
        if (mounted.current) setLoading(false); 
        console.log("[App.fetchUserAndProfile] Loading set to false.");
    }
  }, [navigate]); 

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted.current) return;
      console.log(`[App.onAuthStateChange] Event: ${_event}, newSession user: ${newSession?.user?.id || 'null'}`);
      
      setSession(newSession); 
      await fetchUserAndProfile(newSession);
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
      console.log("[App] Component unmounted. Cleaning up.");
    };
  }, [fetchUserAndProfile]); 

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
        return 'dashboard'; 
    }
  };

  // NOVO: Função para renderizar as páginas internas com base na localização atual
  const renderInternalPageContent = (currentLocation: string) => {
    if (!session || !userRole || userRole === 'onboarding') {
        console.warn("[App.renderInternalPageContent] Called without valid session/role or with onboarding role.");
        return null;
    }
    
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
        return <DashboardPage user={session.user} />;
    }
  };
  
  // NOVO: Função para renderizar o layout principal do aplicativo (com sidebar)
  const renderMainAppLayout = (currentPage: Page) => (
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
                activePage={currentPage} 
                navigate={navigate} 
                userRole={userRole as Role} // userRole is guaranteed not null here
                logoUrl={appConfig?.site_logo}
                siteName={appConfig?.site_name}
                isMobileOpen={isMobileMenuOpen}
                setIsMobileOpen={setIsMobileMenuOpen}
            />
            <main className="flex-1 overflow-y-auto bg-background px-4 pt-4 sm:p-6 lg:p-8 w-full custom-scrollbar relative overscroll-behavior-y-contain pb-32 md:pb-8">
                {renderInternalPageContent(location)}
            </main>
        </div>
    </div>
  );

  const handleCheckoutSuccess = async () => {
    if (session) {
      console.log("[App.handleCheckoutSuccess] Checkout completed. Navigating to /dashboard.");
      // We rely on CheckoutPage to clear the sessionStorage flag.
      // fetchUserAndProfile will be called eventually or we can force it, 
      // but navigating triggers re-render.
      navigate('/dashboard'); 
    }
  };

  if (loading) {
    console.log("[App] Displaying spinner (loading).");
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background space-y-6 relative">
        <Spinner size="lg" />
        <p className="text-text-secondary animate-pulse text-sm">Carregando...</p>
        
        {/* EMERGENCY EXIT BUTTON */}
        {showEmergencyExit && (
            <div className="absolute bottom-20 flex flex-col items-center animate-fade-in-up">
                <p className="text-red-400 text-xs mb-2">Está demorando muito?</p>
                <button 
                    onClick={handleEmergencySignOut}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-2 rounded-xl text-sm font-bold transition-all"
                >
                    Sair e Recarregar (Reset)
                </button>
            </div>
        )}
      </div>
    );
  }

  // --- Lógica de Roteamento ---

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

  // Rota 2: Usuário autenticado (com session e userRole definidos)
  if (session && userRole) {
      console.log(`[App] User ${session.user.id} is authenticated with role '${userRole}'. Current location: '${location}'.`);
      
      let targetLocation = location; // A localização que vamos tentar renderizar

      // Redirecionamento para usuários 'onboarding' ou em rotas públicas de autenticação
      const isPublicAuthPath = ['/', '/login', '/signup'].includes(location);

      if (userRole === 'onboarding') {
          // Force onboarding users to checkout, blocking Landing Page access immediately
          if (isPublicAuthPath || location !== '/checkout') {
              console.log("[App] Authenticated 'onboarding' user on public path or restricted path. Redirecting to '/checkout'.");
              targetLocation = '/checkout';
              // Perform immediate navigation to avoid flicker, but render the checkout component in this pass if possible
              if (location !== targetLocation) {
                  navigate(targetLocation);
              }
          }
      } else { // userRole is 'basic', 'pro', or 'admin'
          if (isPublicAuthPath) {
              console.log("[App] Authenticated user with valid role on public auth path. Redirecting to '/dashboard'.");
              targetLocation = '/dashboard';
              if (location !== targetLocation) {
                  navigate(targetLocation);
              }
          }
      }

      // Agora, renderiza o componente baseado na targetLocation final
      switch (targetLocation) {
          case '/checkout':
              return <CheckoutPage user={session.user} appConfig={appConfig} onSuccess={handleCheckoutSuccess} />;
          case '/terms':
              return <TermsPage appConfig={appConfig} onBack={() => navigate('/dashboard')} />;
          case '/privacy':
              return <PrivacyPage appConfig={appConfig} onBack={() => navigate('/dashboard')} />;
          default:
              // Se o usuário não é 'onboarding', renderiza o layout principal.
              // Se fosse 'onboarding', o bloco if acima já teria mudado targetLocation para /checkout.
              if (userRole !== 'onboarding') {
                  return renderMainAppLayout(getCurrentPageFromLocation(targetLocation));
              }
              // Caso extremo: userRole é onboarding, targetLocation não é /checkout (ex: transição de estado).
              // Renderiza CheckoutPage preventivamente para evitar "loading" infinito ou null.
              return <CheckoutPage user={session.user} appConfig={appConfig} onSuccess={handleCheckoutSuccess} />;
      }
  }

  // Fallback final: Se chegamos aqui, temos sessão mas userRole é nulo e loading é false (O que não deveria acontecer com o novo try/finally).
  // Se acontecer, mostramos o botão de emergência.
  console.warn("[App] Fallback state reached. Session exists but rendering failed.");
  return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background space-y-6">
        <Spinner size="lg" />
        <p className="text-red-400 text-sm">Erro de estado. Por favor, reinicie.</p>
        <button 
            onClick={handleEmergencySignOut}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-2 rounded-xl text-sm font-bold transition-all"
        >
            Sair e Corrigir
        </button>
      </div>
  );
};

export default App;