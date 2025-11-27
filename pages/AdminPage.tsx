
import React, { useState, useEffect, useMemo } from 'react';
import { getAllProfiles, updateUserRole, getProfile, updateProfile, getAppConfig, updateAppConfig } from '../services/api';
import { supabase } from '../services/supabase';
import type { AppUser, Profile, Role, AppConfig } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { ShieldIcon, EditIcon, PlusIcon, UserIcon, DashboardIcon, TrendingUp } from '../components/icons/Icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface AdminPageProps {
  user: AppUser;
}

const AdminPage: React.FC<AdminPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'settings'>('metrics');
  const [profiles, setProfiles] = useState<(Profile & { email?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Settings State
  const [siteConfig, setSiteConfig] = useState<AppConfig>({
      site_name: '', site_description: '', site_logo: '', site_favicon: '', site_keywords: '', site_author: '', site_og_image: ''
  });

  // Modal State for Users
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [newUserMode, setNewUserMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'basic' as Role });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
        try {
            const currentUserProfile = await getProfile(user.id);
            if (currentUserProfile?.role !== 'admin') {
                setAuthorized(false);
                setLoading(false);
                return;
            }
            setAuthorized(true);
            await fetchProfiles();
            const config = await getAppConfig();
            setSiteConfig(config);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };
    fetchAdminData();
  }, [user.id]);

  const fetchProfiles = async () => {
      const allProfiles = await getAllProfiles();
      setProfiles(allProfiles);
  }

  const handleOpenEdit = (profile: Profile) => {
      setEditingProfile(profile);
      setNewUserMode(false);
      setFormData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '', 
          password: '',
          role: profile.role
      });
      setIsUserModalOpen(true);
  }

  const handleOpenCreate = () => {
      setEditingProfile(null);
      setNewUserMode(true);
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'basic' });
      setIsUserModalOpen(true);
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormLoading(true);
      try {
          if (newUserMode) {
              // Create New User
              const { data, error } = await supabase.auth.signUp({
                  email: formData.email,
                  password: formData.password,
                  options: {
                      data: {
                          first_name: formData.firstName,
                          last_name: formData.lastName
                      }
                  }
              });
              if (error) throw error;
              if (data.user) {
                  alert("Usuário criado! Atenção: Devido a limitações de segurança do navegador, você pode ter sido desconectado. Por favor, faça login novamente.");
                  window.location.reload();
              }
          } else if (editingProfile) {
              // Update Existing Profile
              // Note: Changing the actual auth email requires backend admin privileges or user confirmation.
              // Here we update the profile record which serves as the display/contact email.
              await updateProfile(editingProfile.id, {
                  first_name: formData.firstName,
                  last_name: formData.lastName,
                  role: formData.role,
                  email: formData.email
              });
              await updateUserRole(editingProfile.id, formData.role);
              await fetchProfiles();
              setIsUserModalOpen(false);
          }
      } catch (error: any) {
          alert("Erro: " + error.message);
      } finally {
          setFormLoading(false);
      }
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormLoading(true);
      try {
          await updateAppConfig(siteConfig);
          alert("Configurações atualizadas! Atualize a página para ver as mudanças.");
      } catch (error: any) {
          console.error(error);
          alert("Erro ao salvar configurações: " + (error.message || "Erro desconhecido"));
      } finally {
          setFormLoading(false);
      }
  }

  // Filtering Logic
  const filteredProfiles = useMemo(() => {
      return profiles.filter(p => {
          const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
          const email = p.email || '';
          const search = searchTerm.toLowerCase();
          return fullName.includes(search) || email.toLowerCase().includes(search);
      });
  }, [profiles, searchTerm]);

  // Metrics Logic
  const metrics = useMemo(() => {
      const totalUsers = profiles.length;
      const basicCount = profiles.filter(p => p.role === 'basic').length;
      const proCount = profiles.filter(p => p.role === 'pro').length;
      const adminCount = profiles.filter(p => p.role === 'admin').length;

      // Estimated Revenue (Mock: Basic=0, Pro=29.90, Admin=0)
      const estimatedRevenue = proCount * 29.90;

      const planData = [
          { name: 'Básico', value: basicCount, color: '#94a3b8' },
          { name: 'Pro', value: proCount, color: '#40ff00' },
          { name: 'Admin', value: adminCount, color: '#ef4444' }
      ];

      return { totalUsers, basicCount, proCount, adminCount, estimatedRevenue, planData };
  }, [profiles]);

  if (loading) return <Spinner />;
  if (!authorized) return <div className="text-center text-red-500 mt-10">Acesso Negado</div>;

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-3xl font-bold text-text-primary flex items-center">
          <ShieldIcon className="h-8 w-8 text-brand-primary mr-3" />
          Painel Administrativo
      </h1>

      {/* Tabs */}
      <div className="flex space-x-2 md:space-x-4 border-b border-border overflow-x-auto pb-1">
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`py-2 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'metrics' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
              Métricas
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`py-2 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'users' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
              Gerenciar Usuários
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
              Configurações do Site
          </button>
      </div>

      {activeTab === 'metrics' && (
          <div className="space-y-6 animate-fade-in-up">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-card p-6 rounded-2xl border border-border">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-text-secondary font-medium">Total de Usuários</h3>
                          <div className="p-2 bg-blue-500/20 rounded-full"><UserIcon className="h-6 w-6 text-blue-400" /></div>
                      </div>
                      <p className="text-3xl font-bold text-text-primary">{metrics.totalUsers}</p>
                  </div>
                  <div className="bg-card p-6 rounded-2xl border border-border">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-text-secondary font-medium">Faturamento Estimado</h3>
                          <div className="p-2 bg-green-500/20 rounded-full"><TrendingUp className="h-6 w-6 text-green-400" /></div>
                      </div>
                      <p className="text-3xl font-bold text-text-primary">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.estimatedRevenue)}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">Baseado em assinaturas Pro ativas</p>
                  </div>
                  <div className="bg-card p-6 rounded-2xl border border-border">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-text-secondary font-medium">Plano Mais Popular</h3>
                          <div className="p-2 bg-yellow-500/20 rounded-full"><DashboardIcon className="h-6 w-6 text-yellow-400" /></div>
                      </div>
                      <p className="text-3xl font-bold text-text-primary">
                          {metrics.planData.reduce((a, b) => a.value > b.value ? a : b).name}
                      </p>
                  </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart: Plan Distribution */}
                  <div className="bg-card p-6 rounded-2xl border border-border h-96">
                      <h3 className="text-xl font-bold mb-6 text-text-primary">Distribuição de Planos</h3>
                      <ResponsiveContainer width="100%" height="90%">
                          <PieChart>
                              <Pie
                                  data={metrics.planData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={5}
                                  dataKey="value"
                              >
                                  {metrics.planData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                              </Pie>
                              <RechartsTooltip contentStyle={{ backgroundColor: '#121212', borderColor: '#27272a', color: '#f4f4f5' }} />
                              <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>

                  {/* Bar Chart: User Growth (Mock Data for Visual) */}
                  <div className="bg-card p-6 rounded-2xl border border-border h-96">
                      <h3 className="text-xl font-bold mb-6 text-text-primary">Crescimento (Últimos 6 Meses)</h3>
                      <ResponsiveContainer width="100%" height="90%">
                           <BarChart data={[
                               {name: 'Mai', users: metrics.totalUsers - 5},
                               {name: 'Jun', users: metrics.totalUsers - 3},
                               {name: 'Jul', users: metrics.totalUsers - 2},
                               {name: 'Ago', users: metrics.totalUsers - 1},
                               {name: 'Set', users: metrics.totalUsers},
                               {name: 'Out', users: metrics.totalUsers + 2}, // Mock projection
                           ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                              <XAxis dataKey="name" stroke="#a1a1aa" />
                              <YAxis stroke="#a1a1aa" />
                              <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#121212', borderColor: '#27272a', color: '#f4f4f5' }} />
                              <Bar dataKey="users" fill="#40ff00" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'users' && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="w-full md:w-1/2">
                    <input 
                        type="text" 
                        placeholder="Buscar usuário por nome ou e-mail..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl px-4 py-2 text-text-primary focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className="w-full md:w-auto flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-4 rounded-xl transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" /> Novo Usuário
                </button>
            </div>
            <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                    <thead className="bg-gray-900/50">
                        <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">E-mail</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Cargo</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-text-primary">
                        {filteredProfiles.length > 0 ? filteredProfiles.map((profile) => (
                        <tr key={profile.id} className="hover:bg-gray-800/50">
                            <td className="px-6 py-4">
                                <div className="font-bold">{profile.first_name} {profile.last_name}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-text-secondary">{profile.email || 'Não informado'}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                                    profile.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                    profile.role === 'pro' ? 'bg-brand-primary/20 text-brand-primary' :
                                    'bg-gray-700 text-gray-300'
                                }`}>
                                    {profile.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => handleOpenEdit(profile)}
                                    className="text-brand-primary hover:text-brand-secondary p-2 bg-brand-primary/10 rounded-lg transition-colors"
                                    title="Editar Usuário"
                                >
                                    <EditIcon className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                                    Nenhum usuário encontrado com "{searchTerm}".
                                </td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>
            </div>
          </div>
      )}

      {activeTab === 'settings' && (
          <div className="bg-card p-6 md:p-8 rounded-2xl border border-border animate-fade-in-up">
              <h2 className="text-xl font-bold mb-6">Configurações Gerais & SEO</h2>
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Site (Title)</label>
                          <input 
                            type="text" 
                            value={siteConfig.site_name} 
                            onChange={e => setSiteConfig({...siteConfig, site_name: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Autor</label>
                          <input 
                            type="text" 
                            value={siteConfig.site_author || ''} 
                            onChange={e => setSiteConfig({...siteConfig, site_author: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Descrição (Meta Description)</label>
                      <textarea 
                        value={siteConfig.site_description} 
                        onChange={e => setSiteConfig({...siteConfig, site_description: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary h-24"
                      />
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Palavras-chave (Keywords)</label>
                      <input 
                        type="text" 
                        value={siteConfig.site_keywords || ''} 
                        onChange={e => setSiteConfig({...siteConfig, site_keywords: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary"
                        placeholder="finanças, dashboard, controle, dinheiro..."
                      />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">URL do Logo</label>
                          <input 
                            type="text" 
                            value={siteConfig.site_logo} 
                            onChange={e => setSiteConfig({...siteConfig, site_logo: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary"
                            placeholder="https://..."
                          />
                          {siteConfig.site_logo && <img src={siteConfig.site_logo} alt="Preview" className="h-10 mt-2 object-contain bg-white/5 p-1 rounded" />}
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">URL do Favicon</label>
                          <input 
                            type="text" 
                            value={siteConfig.site_favicon} 
                            onChange={e => setSiteConfig({...siteConfig, site_favicon: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary"
                             placeholder="https://..."
                          />
                          {siteConfig.site_favicon && <img src={siteConfig.site_favicon} alt="Favicon" className="h-6 w-6 mt-2" />}
                      </div>
                  </div>

                   <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Imagem de Compartilhamento (OG:Image)</label>
                      <input 
                        type="text" 
                        value={siteConfig.site_og_image || ''} 
                        onChange={e => setSiteConfig({...siteConfig, site_og_image: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-brand-primary"
                         placeholder="https://... (URL da imagem para redes sociais)"
                      />
                      {siteConfig.site_og_image && <img src={siteConfig.site_og_image} alt="OG Preview" className="h-32 mt-2 object-cover rounded-lg border border-border" />}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                      <button type="submit" disabled={formLoading} className="bg-brand-primary hover:bg-brand-secondary text-black font-bold py-3 px-8 rounded-xl transition-colors">
                          {formLoading ? 'Salvando...' : 'Salvar Todas as Configurações'}
                      </button>
                  </div>
              </form>
          </div>
      )}

      {/* User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={newUserMode ? 'Novo Usuário' : 'Editar Usuário'}>
          <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-text-secondary">Nome</label>
                    <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary" />
                </div>
                <div>
                    <label className="block text-sm text-text-secondary">Sobrenome</label>
                    <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary" />
                </div>
              </div>
              
              {/* Email is editable for admins in this view (updates profile record) */}
              <div>
                  <label className="block text-sm text-text-secondary">E-mail</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary" />
                  {!newUserMode && <p className="text-xs text-yellow-500 mt-1">Nota: Alterar este e-mail atualiza o perfil de contato, mas não as credenciais de login do usuário.</p>}
              </div>

              {newUserMode && (
                  <div>
                    <label className="block text-sm text-text-secondary">Senha</label>
                    <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary" />
                </div>
              )}

              <div>
                  <label className="block text-sm text-text-secondary">Cargo</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})} className="w-full bg-background border border-border rounded-xl p-3 text-text-primary">
                      <option value="basic">Básico</option>
                      <option value="pro">Pro</option>
                      <option value="admin">Admin</option>
                  </select>
              </div>

              <div className="flex justify-end pt-4">
                  <button type="submit" disabled={formLoading} className="bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-6 rounded-xl">
                      {formLoading ? 'Salvando...' : 'Confirmar'}
                  </button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default AdminPage;
