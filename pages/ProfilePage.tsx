
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getProfile, updateProfile, uploadAvatar } from '../services/api';
import type { AppUser, Profile } from '../types';
import Spinner from '../components/Spinner';
import { UserIcon } from '../components/icons/Icons';

interface ProfilePageProps {
  user: AppUser;
}

const ProfileInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        {...props}
        className="mt-1 block w-full bg-background border border-border rounded-xl shadow-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm md:text-base p-2 md:p-3 disabled:bg-gray-800 disabled:cursor-not-allowed text-text-primary"
    />
);

const ProfileButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <button
        {...props}
        className="bg-brand-primary hover:bg-brand-secondary text-black font-bold py-2 px-4 md:py-3 md:px-6 text-sm md:text-base rounded-xl transition disabled:opacity-50"
    >
        {props.children}
    </button>
);


const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getProfile(user.id);
        if(data) {
          setProfile(data);
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setAvatarUrl(data.avatar_url || null);
        }
      } catch (error) {
        console.error("Error fetching profile on mount", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMessage({ type: '', text: '' });
    try {
      await updateProfile(user.id, { first_name: firstName, last_name: lastName });
      setProfileMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'Erro ao atualizar o perfil.' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setProfileMessage({ type: '', text: '' });
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer upload.');
      }
      const file = event.target.files[0];
      const newAvatarUrl = await uploadAvatar(user.id, file);
      
      const finalUrl = `${newAvatarUrl}?t=${new Date().getTime()}`;
      
      await updateProfile(user.id, { avatar_url: finalUrl });
      setAvatarUrl(finalUrl);
      setProfileMessage({ type: 'success', text: 'Foto atualizada com sucesso!' });
      
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!oldPassword) {
        setPasswordMessage({ type: 'error', text: 'Por favor, informe sua senha antiga.' });
        return;
    }
    if (newPassword !== confirmPassword) {
        setPasswordMessage({ type: 'error', text: 'As senhas não coincidem.' });
        return;
    }
    if (newPassword.length < 6) {
        setPasswordMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' });
        return;
    }
    
    setUpdatingPassword(true);

    try {
        // First verify old password by trying to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email || '',
            password: oldPassword
        });

        if (signInError) {
            setPasswordMessage({ type: 'error', text: 'Senha antiga incorreta.' });
            setUpdatingPassword(false);
            return;
        }

        // If successful, update the password
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setPasswordMessage({ type: 'error', text: 'Erro ao atualizar a senha: ' + error.message });
        } else {
            setPasswordMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    } catch (error: any) {
        setPasswordMessage({ type: 'error', text: 'Ocorreu um erro inesperado.' });
    } finally {
        setUpdatingPassword(false);
    }
  }

  if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Meu Perfil</h1>
      
      {/* Profile Details Form */}
      <div className="bg-card p-4 md:p-8 rounded-2xl border border-border">
        <h2 className="text-lg md:text-xl font-bold text-text-primary mb-6">Informações Pessoais</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4 md:space-y-6">
            <div className="flex items-center space-x-4 md:space-x-6">
                {avatarUrl ? 
                    <img src={avatarUrl} alt="Avatar" className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-2 border-border" />
                    : <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-background border border-border flex items-center justify-center"><UserIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-500" /></div>
                }
                <div>
                    <label htmlFor="avatar-upload" className="cursor-pointer bg-border hover:bg-opacity-80 text-text-primary font-semibold py-2 px-4 md:py-3 md:px-5 text-sm md:text-base rounded-xl transition inline-block">
                        {uploading ? 'Enviando...' : 'Trocar Foto'}
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
                    <p className="text-xs text-text-secondary mt-2">PNG, JPG até 2MB.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Nome</label>
                  <ProfileInput type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Sobrenome</label>
                  <ProfileInput type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
            </div>

             <div>
              <label htmlFor="email" className="block text-xs md:text-sm font-medium text-text-secondary mb-1">E-mail</label>
              <ProfileInput type="text" id="email" value={user.email} disabled />
            </div>

            {profileMessage.text && <p className={`text-sm ${profileMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{profileMessage.text}</p>}

            <div className="text-right pt-2">
                <ProfileButton type="submit" disabled={updatingProfile}>
                  {updatingProfile ? 'Salvando...' : 'Salvar'}
                </ProfileButton>
            </div>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="bg-card p-4 md:p-8 rounded-2xl border border-border">
        <h2 className="text-lg md:text-xl font-bold text-text-primary mb-6">Alterar Senha</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="oldPassword" className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Senha Antiga</label>
              <ProfileInput type="password" id="oldPassword" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Nova Senha</label>
              <ProfileInput type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
             <div>
              <label htmlFor="confirmPassword" className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Confirmar Nova Senha</label>
              <ProfileInput type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {passwordMessage.text && <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{passwordMessage.text}</p>}
            <div className="text-right pt-2">
                <ProfileButton type="submit" disabled={updatingPassword}>
                    {updatingPassword ? 'Atualizando...' : 'Atualizar'}
                </ProfileButton>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
