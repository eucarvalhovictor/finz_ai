import React, { useState, useEffect } from 'react';
import { InvestmentsIcon } from '../components/icons/Icons';
import { getProfile } from '../services/api';
import type { AppUser, Role } from '../types';
import Spinner from '../components/Spinner';

interface InvestmentsPageProps {
  user: AppUser;
}

const InvestmentsPage: React.FC<InvestmentsPageProps> = ({ user }) => {
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
      const checkAccess = async () => {
          try {
            const profile = await getProfile(user.id);
            if (profile) setUserRole(profile.role);
          } catch (e) {
              console.error(e);
          } finally {
              setCheckingRole(false);
          }
      };
      checkAccess();
  }, [user.id]);

  if (checkingRole) return <Spinner />;

  if (userRole === 'basic') {
      return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 bg-card rounded-2xl border border-border">
              <InvestmentsIcon className="h-20 w-20 text-gray-600 mb-6" />
              <h1 className="text-3xl font-bold text-text-primary mb-2">Recurso Exclusivo Pro</h1>
              <p className="text-text-secondary max-w-md mb-8">
                  O módulo de Investimentos está disponível apenas para membros Pro e Admin. Faça o upgrade para gerenciar seu patrimônio.
              </p>
              <button className="bg-brand-primary text-black font-bold py-3 px-8 rounded-xl opacity-50 cursor-not-allowed">
                  Em breve: Upgrade de Plano
              </button>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Investimentos</h1>
      
      <div className="bg-card p-6 rounded-2xl border border-border shadow-lg min-h-[50vh] flex flex-col justify-center items-center">
        <div className="text-center text-text-secondary">
          <InvestmentsIcon className="h-16 w-16 mx-auto mb-4 text-brand-primary" />
          <h2 className="text-xl font-bold text-text-primary">Página de Investimentos em Construção</h2>
          <p className="mt-2 max-w-xl mx-auto">
            Em breve, você poderá acompanhar seus investimentos e ver sua carteira crescer diretamente aqui no FinzAI.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentsPage;