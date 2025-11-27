import React, { useState, useEffect } from 'react';
import { getAllProfiles, updateUserRole, getProfile } from '../services/api';
import type { AppUser, Profile, Role } from '../types';
import Spinner from '../components/Spinner';
import { ShieldIcon } from '../components/icons/Icons';

interface AdminPageProps {
  user: AppUser;
}

const AdminPage: React.FC<AdminPageProps> = ({ user }) => {
  const [profiles, setProfiles] = useState<(Profile & { email?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
        try {
            // Security Check
            const currentUserProfile = await getProfile(user.id);
            if (currentUserProfile?.role !== 'admin') {
                setAuthorized(false);
                setLoading(false);
                return;
            }
            setAuthorized(true);

            const allProfiles = await getAllProfiles();
            setProfiles(allProfiles);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };
    fetchAdminData();
  }, [user.id]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
      try {
          await updateUserRole(userId, newRole);
          setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
      } catch (error) {
          alert("Erro ao atualizar cargo do usuário.");
      }
  }

  if (loading) return <Spinner />;

  if (!authorized) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
              <ShieldIcon className="h-16 w-16 mb-4" />
              <h1 className="text-2xl font-bold">Acesso Negado</h1>
              <p>Você não tem permissão para acessar esta página.</p>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary flex items-center">
          <ShieldIcon className="h-8 w-8 text-brand-primary mr-3" />
          Painel Administrativo
      </h1>

      <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">ID / Nome</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Cargo Atual</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-primary">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                        <div className="font-bold">{profile.first_name} {profile.last_name}</div>
                        <div className="text-xs text-text-secondary font-mono">{profile.id}</div>
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
                        <select 
                            value={profile.role} 
                            onChange={(e) => handleRoleChange(profile.id, e.target.value as Role)}
                            className="bg-background border border-border rounded-lg p-2 text-sm focus:ring-brand-primary"
                        >
                            <option value="basic">Basic</option>
                            <option value="pro">Pro</option>
                            <option value="admin">Admin</option>
                        </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default AdminPage;