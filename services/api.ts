
import { supabase } from './supabase';
import type { AppUser, Transaction, Profile, CreditCard, Role, AppConfig } from '../types';

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
        if (error.code === 'PGRST116') return null;
        console.error('Error fetching profile:', error.message);
        throw error;
    }
    return data;
}

// Update user profile
export const updateProfile = async (userId: string, updates: { first_name?: string; last_name?: string; avatar_url?: string, role?: Role }) => {
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

// --- Site Config API ---

export const getAppConfig = async (): Promise<AppConfig> => {
    const { data, error } = await supabase
        .from('app_config')
        .select('*');

    const config: AppConfig = {
        site_name: 'FinzAI',
        site_description: 'Dashboard Financeiro',
        site_logo: '',
        site_favicon: ''
    };

    if (error) {
        // Table might not exist yet, return defaults
        return config;
    }

    if (data) {
        data.forEach((row: any) => {
            if (row.key === 'site_name') config.site_name = row.value;
            if (row.key === 'site_description') config.site_description = row.value;
            if (row.key === 'site_logo') config.site_logo = row.value;
            if (row.key === 'site_favicon') config.site_favicon = row.value;
        });
    }

    return config;
}

export const updateAppConfig = async (config: AppConfig) => {
    // We update each key individually to ensure we only use UPDATE permissions
    // and avoid "upsert" which might require INSERT permissions that the RLS policy doesn't grant.
    const updates = [
        { key: 'site_name', value: config.site_name },
        { key: 'site_description', value: config.site_description },
        { key: 'site_logo', value: config.site_logo },
        { key: 'site_favicon', value: config.site_favicon },
    ];

    for (const item of updates) {
        const { error } = await supabase
            .from('app_config')
            .update({ value: item.value })
            .eq('key', item.key);

        if (error) {
            console.error(`Error updating app config for key ${item.key}:`, error);
            throw new Error(`Failed to update ${item.key}: ${error.message}`);
        }
    }
}
