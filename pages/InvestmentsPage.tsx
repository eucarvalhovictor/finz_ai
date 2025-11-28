
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { InvestmentsIcon, PlusIcon, DeleteIcon, TrendingUp } from '../components/icons/Icons';
import { getProfile, getInvestments, addInvestment, deleteInvestment } from '../services/api';
import type { AppUser, Role, Investment } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface InvestmentsPageProps {
  user: AppUser;
}

const COLORS = ['#40ff00', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4081'];

const INVESTMENT_TYPES = [
    'CDB', 'Poupança', 'LCI', 'LCA', 'FII', 'Ações', 'Tesouro Direto', 'Cripto', 'Outros'
];

const InvestmentsPage: React.FC<InvestmentsPageProps> = ({ user }) => {
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState(INVESTMENT_TYPES[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
        setLoading(true);
        const [profile, invData] = await Promise.all([
            getProfile(user.id),
            getInvestments(user.id)
        ]);
        if (profile) setUserRole(profile.role);
        setInvestments(invData);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
        setCheckingRole(false);
    }
  }, [user.id]);

  useEffect(() => {
      fetchData();
  }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!amount || !name) return;
      setIsSubmitting(true);
      try {
          await addInvestment({
              user_id: user.id,
              name,
              type,
              amount: Number(amount),
              date: new Date().toISOString().split('T')[0]
          });
          setIsModalOpen(false);
          setName('');
          setAmount('');
          fetchData();
      } catch (e) {
          console.error(e);
          alert("Erro ao salvar investimento.");
      } finally {
          setIsSubmitting(false);
      }
  }

  const handleDelete = async (id: string) => {
      if (window.confirm("Deseja excluir este investimento?")) {
          try {
              await deleteInvestment(id);
              fetchData();
          } catch(e) { console.error(e); }
      }
  }

  const chartData = useMemo(() => {
      const data: { [key: string]: number } = {};
      investments.forEach(inv => {
          data[inv.type] = (data[inv.type] || 0) + inv.amount;
      });
      return Object.keys(data).map(key => ({ name: key, value: data[key] }));
  }, [investments]);

  const totalInvested = useMemo(() => investments.reduce((acc, curr) => acc + curr.amount, 0), [investments]);

  if (checkingRole || loading) return <Spinner />;

  if (userRole === 'basic') {
      return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 bg-card rounded-2xl border border-border">
              <InvestmentsIcon className="h-20 w-20 text-gray-600 mb-6" />
              <h1 className="text-2xl font-bold text-text-primary mb-2">Recurso Exclusivo Pro</h1>
              <p className="text-text-secondary max-w-md mb-8">
                  O módulo de Investimentos está disponível apenas para membros Pro e Admin.
              </p>
              <button className="bg-brand-primary text-black font-bold py-3 px-8 rounded-xl opacity-50 cursor-not-allowed">
                  Em breve: Upgrade de Plano
              </button>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Carteira de Investimentos</h1>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-4 rounded-lg text-sm md:text-base transition-colors"
        >
            <PlusIcon className="h-5 w-5 mr-2" /> Novo Aporte
        </button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card p-6 rounded-2xl border border-border flex items-center justify-between">
              <div>
                  <p className="text-text-secondary text-sm font-medium">Total Investido</p>
                  <p className="text-3xl font-bold text-text-primary mt-2">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvested)}
                  </p>
              </div>
              <div className="p-3 bg-brand-primary/20 rounded-full">
                  <InvestmentsIcon className="h-8 w-8 text-brand-primary" />
              </div>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border flex items-center justify-between">
              <div>
                  <p className="text-text-secondary text-sm font-medium">Rentabilidade Estimada (Mensal)</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvested * 0.008)}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">Baseado em 0.8% a.m.</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                  <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-1 bg-card p-6 rounded-2xl border border-border min-h-[300px]">
              <h3 className="text-lg font-bold mb-4 text-text-primary">Alocação por Tipo</h3>
              {investments.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: '#121212', borderColor: '#27272a', color: '#f4f4f5' }} formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                      Sem dados para gráfico.
                  </div>
              )}
          </div>

          {/* List */}
          <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border overflow-hidden">
              <h3 className="text-lg font-bold mb-4 text-text-primary">Meus Ativos</h3>
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                      <thead className="bg-gray-900/50">
                          <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Nome</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Tipo</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Valor</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Ações</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-text-primary">
                          {investments.length > 0 ? investments.map(inv => (
                              <tr key={inv.id} className="hover:bg-gray-800/50">
                                  <td className="px-4 py-3 font-medium">{inv.name}</td>
                                  <td className="px-4 py-3 text-sm text-text-secondary">
                                      <span className="bg-white/5 px-2 py-1 rounded text-xs">{inv.type}</span>
                                  </td>
                                  <td className="px-4 py-3 font-bold text-brand-primary">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.amount)}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                      <button onClick={() => handleDelete(inv.id)} className="text-red-400 hover:text-red-300 p-1">
                                          <DeleteIcon className="h-4 w-4" />
                                      </button>
                                  </td>
                              </tr>
                          )) : (
                              <tr><td colSpan={4} className="text-center py-8 text-text-secondary">Nenhum investimento cadastrado.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Investimento">
          <form onSubmit={handleSave} className="space-y-4">
              <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Nome do Ativo</label>
                  <input 
                    type="text" required placeholder="Ex: CDB Banco Inter, MXRF11" 
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-2 md:p-3 text-text-primary focus:ring-brand-primary"
                  />
              </div>
              <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Tipo</label>
                  <select 
                    value={type} onChange={e => setType(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-2 md:p-3 text-text-primary focus:ring-brand-primary"
                  >
                      {INVESTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Valor Atual (R$)</label>
                  <input 
                    type="number" step="0.01" required placeholder="0,00" 
                    value={amount} onChange={e => setAmount(e.target.valueAsNumber || '')}
                    className="w-full bg-background border border-border rounded-xl p-2 md:p-3 text-text-primary focus:ring-brand-primary"
                  />
              </div>
              <div className="flex justify-end pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 text-sm text-text-secondary">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-black font-bold py-2 px-6 rounded-xl hover:bg-brand-secondary transition-colors">
                      {isSubmitting ? 'Salvando...' : 'Adicionar'}
                  </button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default InvestmentsPage;
