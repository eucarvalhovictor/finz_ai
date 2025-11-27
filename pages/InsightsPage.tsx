import React, { useState, useEffect } from 'react';
import { getFinancialInsight } from '../services/geminiService';
import { getTransactions, getProfile } from '../services/api';
import type { AppUser, Role } from '../types';
import Spinner from '../components/Spinner';
import { InsightsIcon } from '../components/icons/Icons';
import ReactMarkdown from 'react-markdown';


interface InsightsPageProps {
  user: AppUser;
}

const InsightsPage: React.FC<InsightsPageProps> = ({ user }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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


  const handleGenerateInsight = async () => {
    setLoading(true);
    setError(null);
    setInsight(null);
    try {
      const transactions = await getTransactions(user.id);
      const result = await getFinancialInsight(transactions);
      setInsight(result);
    } catch (err: any) {
      setError("Falha ao gerar análise. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingRole) return <Spinner />;

  if (userRole === 'basic') {
      return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 bg-card rounded-2xl border border-border">
              <InsightsIcon className="h-20 w-20 text-gray-600 mb-6" />
              <h1 className="text-3xl font-bold text-text-primary mb-2">Recurso Exclusivo Pro</h1>
              <p className="text-text-secondary max-w-md mb-8">
                  A Análise Financeira com Inteligência Artificial está disponível apenas para membros Pro e Admin. Faça o upgrade para receber dicas personalizadas.
              </p>
              <button className="bg-brand-primary text-black font-bold py-3 px-8 rounded-xl opacity-50 cursor-not-allowed">
                  Em breve: Upgrade de Plano
              </button>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Análise com IA</h1>
        <button
          onClick={handleGenerateInsight}
          disabled={loading}
          className="flex items-center bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Spinner /> <span className="ml-2">Analisando...</span></>
          ) : (
            <><InsightsIcon className="h-5 w-5 mr-2" /> Gerar Nova Análise</>
          )}
        </button>
      </div>
      
      <div className="bg-card p-6 rounded-xl border border-border shadow-lg min-h-[50vh] flex flex-col justify-center items-center">
        {loading && (
            <div className="text-center text-text-secondary">
                <Spinner/>
                <p className="mt-4">FinzAI está analisando suas finanças...</p>
                <p className="text-sm">Isso pode levar alguns instantes.</p>
            </div>
        )}

        {!loading && error && (
            <div className="text-center text-red-400">
                <h3 className="text-lg font-semibold">Ocorreu um Erro</h3>
                <p>{error}</p>
            </div>
        )}

        {!loading && !insight && !error && (
            <div className="text-center text-text-secondary">
                <InsightsIcon className="h-16 w-16 mx-auto mb-4 text-brand-primary" />
                <h2 className="text-xl font-bold text-text-primary">Sua análise financeira pessoal</h2>
                <p className="mt-2 max-w-xl mx-auto">Clique no botão "Gerar Nova Análise" para que a inteligência artificial do FinzAI avalie suas transações e forneça dicas personalizadas para você economizar e atingir seus objetivos.</p>
            </div>
        )}
        
        {insight && (
            <div className="prose prose-invert prose-lg max-w-none w-full text-text-primary">
                <ReactMarkdown
                 components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-brand-primary" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-2 border-b border-border pb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-brand-primary" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-1" {...props} />,
                 }}
                >
                    {insight}
                </ReactMarkdown>
            </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;