import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { WalletIcon, DashboardIcon, TransactionsIcon, InsightsIcon, LogoutIcon, InvestmentsIcon, CreditCardIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon, ShieldIcon } from './icons/Icons';
import type { Page, Role } from '../types';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  userRole: Role;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}> = ({ icon, label, isActive, onClick, isCollapsed }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-brand-primary text-black font-semibold'
        : 'text-text-secondary hover:bg-border hover:text-text-primary'
    } ${isCollapsed ? 'justify-center' : ''}`}
    title={isCollapsed ? label : ''}
  >
    {icon}
    {!isCollapsed && <span className="ml-4 font-medium">{label}</span>}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, userRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  }

  const isAdmin = userRole === 'admin';
  const isProOrAdmin = userRole === 'pro' || userRole === 'admin';

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-sidebar p-4 flex flex-col justify-between border-r border-border transition-all duration-300 relative`}>
      
      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-10 bg-brand-primary rounded-full p-1 text-black shadow-glow hover:scale-110 transition-transform"
      >
        {isCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
      </button>

      <div>
        <div className={`flex items-center mb-12 ${isCollapsed ? 'justify-center' : ''} transition-all`}>
          <WalletIcon className="h-10 w-10 text-brand-primary flex-shrink-0" />
          {!isCollapsed && <h1 className="text-2xl font-bold ml-3 text-text-primary whitespace-nowrap overflow-hidden">FinzAI</h1>}
        </div>
        <nav className="space-y-3">
          <NavItem
            icon={<DashboardIcon className="h-6 w-6" />}
            label="Dashboard"
            isActive={activePage === 'dashboard'}
            onClick={() => setActivePage('dashboard')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<TransactionsIcon className="h-6 w-6" />}
            label="Transações"
            isActive={activePage === 'transactions'}
            onClick={() => setActivePage('transactions')}
             isCollapsed={isCollapsed}
          />
          
          {/* Investments: Pro & Admin Only */}
          {isProOrAdmin && (
             <NavItem
                icon={<InvestmentsIcon className="h-6 w-6" />}
                label="Investimentos"
                isActive={activePage === 'investments'}
                onClick={() => setActivePage('investments')}
                isCollapsed={isCollapsed}
            />
          )}

           <NavItem
            icon={<CreditCardIcon className="h-6 w-6" />}
            label="Cartões"
            isActive={activePage === 'credit-cards'}
            onClick={() => setActivePage('credit-cards')}
            isCollapsed={isCollapsed}
          />
          
          {/* AI Insights: Pro & Admin Only */}
          {isProOrAdmin && (
              <NavItem
                icon={<InsightsIcon className="h-6 w-6" />}
                label="Análise IA"
                isActive={activePage === 'insights'}
                onClick={() => setActivePage('insights')}
                isCollapsed={isCollapsed}
              />
          )}

           {/* Admin Panel: Admin Only */}
           {isAdmin && (
              <NavItem
                icon={<ShieldIcon className="h-6 w-6" />}
                label="Admin"
                isActive={activePage === 'admin'}
                onClick={() => setActivePage('admin')}
                isCollapsed={isCollapsed}
              />
          )}
        </nav>
      </div>

      <div className="space-y-3">
        <NavItem
            icon={<UserIcon className="h-6 w-6" />}
            label="Meu Perfil"
            isActive={activePage === 'profile'}
            onClick={() => setActivePage('profile')}
            isCollapsed={isCollapsed}
        />
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors duration-200 group ${isCollapsed ? 'justify-center' : ''}`}
          title="Sair"
        >
          <LogoutIcon className="h-6 w-6 text-red-500 group-hover:text-red-400" />
          {!isCollapsed && <span className="ml-4 font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;