import type { User } from '@supabase/supabase-js';

export interface CreditCard {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  last_four_digits: string;
  bank: string;
  limit_total: number;       // Novo: Limite total do cartão
  limit_available: number;   // Novo: Limite disponível atual
}

export interface Transaction {
  id: string;
  user_id: string;
  created_at: string;
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  payment_method: 'Dinheiro' | 'Pix' | 'Cartão';
  payment_type?: 'À Vista' | 'Parcelado';
  installments?: number;
  card_id?: string;
}

export interface Investment {
  id: string;
  user_id: string;
  created_at: string;
  name: string; // Ex: Nubank, MXRF11
  type: string; // Ex: CDB, LCI, FII, Ação
  amount: number;
  date: string;
}

export interface MonthlySummary {
    month: string;
    income: number;
    expense: number;
}

export type Page = 'dashboard' | 'transactions' | 'investments' | 'credit-cards' | 'profile' | 'admin'; // 'insights' REMOVED

export type Role = 'basic' | 'pro' | 'admin';

export type AuthMode = 'login' | 'signup'; // NOVO: Tipo para o modo de autenticação

export type AppUser = User;

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string; 
  avatar_url: string | null;
  updated_at: string | null;
  role: Role | null; // MODIFICADO: Permite que a role seja nula
}

export interface AppConfig {
  site_name: string;
  site_description: string;
  site_logo: string;
  site_favicon: string;
  site_keywords?: string;
  site_author?: string;
  site_og_image?: string;
}
