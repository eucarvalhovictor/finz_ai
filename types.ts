import type { User } from '@supabase/supabase-js';

export interface CreditCard {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  last_four_digits: string;
  bank: string;
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

export interface MonthlySummary {
    month: string;
    income: number;
    expense: number;
}

export type Page = 'dashboard' | 'transactions' | 'insights' | 'investments' | 'credit-cards' | 'profile' | 'admin';

export type Role = 'basic' | 'pro' | 'admin';

export interface AppUser extends User {}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  role: Role;
}