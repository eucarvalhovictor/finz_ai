
import { supabase } from './supabase';
import type { AppUser, Transaction, Profile, CreditCard, Role } from '../types';

// Fetch all transactions for the logged-in user
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
  return data || [];
};

// Add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
  return data;
};

// Update an existing transaction
export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
  return data;
};


// Delete a transaction
export const deleteTransaction = async (id: string) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Fetch unique categories for a user
export const getCategories = async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
        .from('transactions')
        .select('category')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }

    if (!data || !Array.isArray(data)) return [];

    // Fix: Cast data to any[] to ensure map works and explicit casting in filter to return string[]
    const categories = (data as any[])
        .map((item: any) => item.category)
        .filter((c: any): c is string => typeof c === 'string' && c.length > 0);
        
    return [...new Set(categories)];
};

// Get user profile
export const getProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
         // PGRST116 = no rows found. This is expected for new users before profile is created.
        if (error.code === 'PGRST116') return null;
        
        console.error('Error fetching profile:', error.message);
        throw error;
    }
    return data;
}

// Update user profile
export const updateProfile = async (userId: string, updates: { first_name?: string; last_name?: string; avatar_url?: string }) => {
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

// Upload avatar image
export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        throw uploadError;
    }
    
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return publicUrl;
}

// --- Credit Card API ---

// Fetch all credit cards for a user
export const getCreditCards = async (userId: string): Promise<CreditCard[]> => {
    const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching credit cards:', error);
        throw error;
    }
    return data || [];
};

// Add a new credit card
export const addCreditCard = async (card: Omit<CreditCard, 'id' | 'created_at'>): Promise<CreditCard> => {
    const { data, error } = await supabase
        .from('credit_cards')
        .insert([card])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding credit card:', error);
        throw error;
    }
    return data;
};

// Delete a credit card
export const deleteCreditCard = async (cardId: string) => {
    const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', cardId);
    
    if (error) {
        console.error('Error deleting credit card:', error);
        throw error;
    }
};

// --- Admin API ---

export const getAllProfiles = async (): Promise<(Profile & { email?: string })[]> => {
    // Note: Fetching email requires joining with auth.users which is restricted in client.
    // We will just fetch profiles here. In a real app, you'd use a Secure Edge Function.
    // For this demo, we will try to fetch profiles. 
    
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name', { ascending: true });

    if (error) {
         console.error('Error fetching all profiles:', error);
         throw error;
    }
    return profiles;
}

export const updateUserRole = async (userId: string, role: Role) => {
    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
    
    if (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
}
