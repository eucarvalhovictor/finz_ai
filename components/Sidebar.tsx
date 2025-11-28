
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { DashboardIcon, TransactionsIcon, InsightsIcon, LogoutIcon, InvestmentsIcon, CreditCardIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon, ShieldIcon, CloseIcon } from './icons/Icons';
import type { Page, Role } from '../types';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  userRole: Role;
  logoUrl?: string;
  siteName?: string;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
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
    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${
      isActive
        ? 'bg-brand-primary text-black font-semibold shadow-[0_0_10px_rgba(64,255,0,0.3)]'
        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
    } ${isCollapsed ? 'justify-center' : ''}`}
    title={isCollapsed ? label : ''}
  >
    {icon}
    {!isCollapsed && <span className="ml-4 font-medium">{label}</span>}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, userRole, isMobileOpen, setIsMobileOpen }) => {
  // Desktop defaults to collapsed (true)
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  }

  const handleNavClick = (page: Page) => {
      setActivePage(page);
      setIsMobileOpen(false); // Close mobile menu on navigate
  }

  const isAdmin = userRole === 'admin';
  const isProOrAdmin = userRole === 'pro' || userRole === 'admin';

  // Lógica Crucial: 
  // Se for Mobile e estiver aberto, NÃO está colapsado (mostra texto).
  // Se for Desktop, respeita o estado `isCollapsed`.
  // O menu mobile nunca deve aparecer recolhido (só ícones).
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const effectiveCollapsed = isMobileOpen ? false : isCollapsed;

  return (
    <>
        {/* Mobile Overlay */}
        {isMobileOpen && (
            <div 
                className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                onClick={() => setIsMobileOpen(false)}
            />
        )}

        {/* Sidebar Container */}
        <aside 
            className={`
                fixed md:static inset-y-0 left-0 z-50
                bg-sidebar flex flex-col border-r border-border transition-all duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0 w-64 pt-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
                ${isCollapsed && !isMobileOpen ? 'md:w-24' : 'md:w-72'}
                md:flex md:h-full
            `}
        >
        <div className="flex flex-col h-full p-4">
            
            {/* Mobile "Fechar Menu" Header inside Sidebar */}
            <div className="md:hidden flex justify-between items-center mb-6 pt-2">
                 <h2 className="text-lg font-bold text-text-primary">Menu</h2>
                 <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 bg-white/5 rounded-lg text-text-secondary hover:text-white"
                >
                    <CloseIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Desktop Toggle Button */}
            <div className="hidden md:block mb-4">
                 <button 
                    onClick={toggleSidebar}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2 rounded-lg text-text-secondary hover:bg-white/5 hover:text-brand-primary transition-colors border border-transparent hover:border-white/10`}
                >
                    {!isCollapsed && <span className="text-sm font-medium">Recolher Menu</span>}
                    {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
                </button>
            </div>

             {/* Plan Badge */}
             {!effectiveCollapsed && (
                <div className="mb-6 bg-card/50 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center animate-fade-in-up">
                    <span className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">Plano Atual</span>
                    <div className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-widest border border-brand-primary/20 w-full text-center">
                        {userRole}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
                <NavItem
                    icon={<DashboardIcon className="h-6 w-6" />}
                    label="Dashboard"
                    isActive={activePage === 'dashboard'}
                    onClick={() => handleNavClick('dashboard')}
                    isCollapsed={effectiveCollapsed}
                />
                <NavItem
                    icon={<TransactionsIcon className="h-6 w-6" />}
                    label="Transações"
                    isActive={activePage === 'transactions'}
                    onClick={() => handleNavClick('transactions')}
                    isCollapsed={effectiveCollapsed}
                />
                
                {isProOrAdmin && (
                    <NavItem
                        icon={<InvestmentsIcon className="h-6 w-6" />}
                        label="Investimentos"
                        isActive={activePage === 'investments'}
                        onClick={() => handleNavClick('investments')}
                        isCollapsed={effectiveCollapsed}
                    />
                )}

                <NavItem
                    icon={<CreditCardIcon className="h-6 w-6" />}
                    label="Cartões"
                    isActive={activePage === 'credit-cards'}
                    onClick={() => handleNavClick('credit-cards')}
                    isCollapsed={effectiveCollapsed}
                />
                
                {isProOrAdmin && (
                    <NavItem
                        icon={<InsightsIcon className="h-6 w-6" />}
                        label="Análise IA"
                        isActive={activePage === 'insights'}
                        onClick={() => handleNavClick('insights')}
                        isCollapsed={effectiveCollapsed}
                    />
                )}

                {isAdmin && (
                    <NavItem
                        icon={<ShieldIcon className="h-6 w-6" />}
                        label="Admin"
                        isActive={activePage === 'admin'}
                        onClick={() => handleNavClick('admin')}
                        isCollapsed={effectiveCollapsed}
                    />
                )}
            </nav>

            {/* Footer Actions */}
            <div className="space-y-2 border-t border-border pt-4 mt-4">
                <NavItem
                    icon={<UserIcon className="h-6 w-6" />}
                    label="Meu Perfil"
                    isActive={activePage === 'profile'}
                    onClick={() => handleNavClick('profile')}
                    isCollapsed={effectiveCollapsed}
                />
                <button
                onClick={handleLogout}
                className={`flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors duration-200 group ${effectiveCollapsed ? 'justify-center' : ''}`}
                title="Sair"
                >
                <LogoutIcon className="h-6 w-6 text-red-500 group-hover:text-red-400" />
                {!effectiveCollapsed && <span className="ml-4 font-medium">Sair</span>}
                </button>
            </div>
        </div>
        </aside>
    </>
  );
};

export default Sidebar;
