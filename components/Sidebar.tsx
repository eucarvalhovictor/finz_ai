
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { WalletIcon, DashboardIcon, TransactionsIcon, InsightsIcon, LogoutIcon, InvestmentsIcon, CreditCardIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon, ShieldIcon, CloseIcon } from './icons/Icons';
import type { Page, Role } from '../types';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  userRole: Role;
  logoUrl?: string;
  siteName?: string;
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

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, userRole, logoUrl, siteName }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  }

  const toggleMobileMenu = () => {
      setIsMobileOpen(!isMobileOpen);
  }

  const handleNavClick = (page: Page) => {
      setActivePage(page);
      setIsMobileOpen(false); // Close mobile menu on navigate
  }

  const isAdmin = userRole === 'admin';
  const isProOrAdmin = userRole === 'pro' || userRole === 'admin';

  return (
    <>
        {/* Mobile Trigger Button */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-40">
             <div className="flex items-center">
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
                ) : (
                    <WalletIcon className="h-8 w-8 text-brand-primary" />
                )}
                <span className="ml-2 font-bold text-lg text-text-primary">{siteName || 'FinzAI'}</span>
             </div>
             <button 
                onClick={toggleMobileMenu}
                className="text-text-primary font-bold bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10"
             >
                 Menu
             </button>
        </div>

        {/* Mobile Overlay */}
        {isMobileOpen && (
            <div 
                className="fixed inset-0 bg-black/80 z-40 md:hidden"
                onClick={() => setIsMobileOpen(false)}
            />
        )}

        {/* Sidebar Container */}
        <aside 
            className={`
                fixed md:static inset-y-0 left-0 z-50
                bg-sidebar flex flex-col justify-between border-r border-border transition-all duration-300 ease-in-out p-4
                ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
                ${isCollapsed && !isMobileOpen ? 'md:w-24' : 'md:w-72'}
                md:flex
            `}
        >
        <div>
            {/* Header: Logo, Title & Toggle */}
            <div className={`flex flex-col mb-6 transition-all duration-300`}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-4`}>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="bg-brand-primary/10 p-2 rounded-xl">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
                            ) : (
                                <WalletIcon className="h-8 w-8 text-brand-primary" />
                            )}
                        </div>
                        {!isCollapsed && <h1 className="text-2xl font-bold ml-3 text-text-primary tracking-tight">{siteName || 'FinzAI'}</h1>}
                    </div>
                    
                    {/* Desktop Toggle */}
                    <button 
                        onClick={toggleSidebar}
                        className={`hidden md:block p-2 rounded-lg text-text-secondary hover:bg-white/5 hover:text-brand-primary transition-colors`}
                    >
                        {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile "Recolher Menu" Button */}
                <div className="md:hidden w-full mb-4">
                     <button 
                        onClick={() => setIsMobileOpen(false)}
                        className="w-full flex items-center justify-center space-x-2 bg-white/5 text-text-secondary py-2 rounded-xl hover:bg-white/10"
                    >
                        <CloseIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Recolher Menu</span>
                    </button>
                </div>

                {/* Plan Badge (Only visible when expanded) */}
                {!isCollapsed && (
                    <div className="bg-card/50 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center animate-fade-in-up">
                        <span className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">Plano Atual</span>
                        <div className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-widest border border-brand-primary/20 w-full text-center">
                            {userRole}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
            <NavItem
                icon={<DashboardIcon className="h-6 w-6" />}
                label="Dashboard"
                isActive={activePage === 'dashboard'}
                onClick={() => handleNavClick('dashboard')}
                isCollapsed={isCollapsed}
            />
            <NavItem
                icon={<TransactionsIcon className="h-6 w-6" />}
                label="Transações"
                isActive={activePage === 'transactions'}
                onClick={() => handleNavClick('transactions')}
                isCollapsed={isCollapsed}
            />
            
            {isProOrAdmin && (
                <NavItem
                    icon={<InvestmentsIcon className="h-6 w-6" />}
                    label="Investimentos"
                    isActive={activePage === 'investments'}
                    onClick={() => handleNavClick('investments')}
                    isCollapsed={isCollapsed}
                />
            )}

            <NavItem
                icon={<CreditCardIcon className="h-6 w-6" />}
                label="Cartões"
                isActive={activePage === 'credit-cards'}
                onClick={() => handleNavClick('credit-cards')}
                isCollapsed={isCollapsed}
            />
            
            {isProOrAdmin && (
                <NavItem
                    icon={<InsightsIcon className="h-6 w-6" />}
                    label="Análise IA"
                    isActive={activePage === 'insights'}
                    onClick={() => handleNavClick('insights')}
                    isCollapsed={isCollapsed}
                />
            )}

            {isAdmin && (
                <NavItem
                    icon={<ShieldIcon className="h-6 w-6" />}
                    label="Admin"
                    isActive={activePage === 'admin'}
                    onClick={() => handleNavClick('admin')}
                    isCollapsed={isCollapsed}
                />
            )}
            </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-2 border-t border-border pt-4 mt-4">
            <NavItem
                icon={<UserIcon className="h-6 w-6" />}
                label="Meu Perfil"
                isActive={activePage === 'profile'}
                onClick={() => handleNavClick('profile')}
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
    </>
  );
};

export default Sidebar;
