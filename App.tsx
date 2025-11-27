
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

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<Role>('basic');
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    let mounted = true;

    const initApp = async () => {
      const loadingTimeout = setTimeout(() => {
          if (mounted && loading) {
              console.warn("App initialization timed out, forcing load.");
              setLoading(false);
          }
      }, 5000);

      try {
          // Fetch Site Config
          const config = await getAppConfig();
          if (mounted) {
              setAppConfig(config);
              // Apply Site Config
              if (config.site_name) document.title = config.site_name;
              if (config.site_description) {
                  let meta = document.querySelector('meta[name="description"]');
                  if (!meta) {
                      meta = document.createElement('meta');
                      meta.setAttribute('name', 'description');
                      document.head.appendChild(meta);
                  }
                  meta.setAttribute('content', config.site_description);
              }
              if (config.site_favicon) {
                   let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                   if (!link) {
                       link = document.createElement('link');
                       link.rel = 'icon';
                       document.head.appendChild(link);
                   }
                   link.href = config.site_favicon;
              }
          }

          const { data } = await supabase.auth.getSession();
          
          if (mounted) {
              setSession(data.session);
              
              if (data.session) {
                  try {
                      const profile = await getProfile(data.session.user.id);
                      if (profile) setUserRole(profile.role);
                  } catch (e) {
                      console.error("Error fetching user role", e);
                  }
              }
          }
      } catch (err) {
          console.error("Initialization error:", err);
      } finally {
          clearTimeout(loadingTimeout);
          if (mounted) setLoading(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      if (session) {
        setActivePage('dashboard');
        try {
            const profile = await getProfile(session.user.id);
            if (profile) setUserRole(profile.role);
        } catch (e) {
            console.error("Error fetching user role", e);
        }
      } else {
          setUserRole('basic');
      }
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, []);

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
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-xl text-text-primary animate-pulse">Carregando {appConfig?.site_name || 'FinzAI'}...</div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      {!session ? (
        <AuthComponent />
      ) : (
        <div className="flex h-screen bg-background flex-col md:flex-row">
          <Sidebar 
            activePage={activePage} 
            setActivePage={setActivePage} 
            userRole={userRole} 
            logoUrl={appConfig?.site_logo}
            siteName={appConfig?.site_name}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 mt-16 md:mt-0">
            {renderPage()}
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
