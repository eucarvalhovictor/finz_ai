import { supabase } from './supabase';
import type { AppUser, Transaction, Profile, CreditCard, Role, AppConfig, Investment } from '../types';

// Fetch all transactions for the logged-in user
export const getTransactions = async (userId: string, month?: number, year?: number): Promise<Transaction[]> => {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  if (month !== undefined && year !== undefined) {
    // Supabase expects 0-indexed month for Date object, but UI will likely pass 1-indexed.
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // last day of the month

    query = query.gte('date', startDate).lte('date', endDate);
  }

  const { data, error } = await query.order('date', { ascending: false });

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
    .insert([{ ...transaction, id: crypto.randomUUID() }])
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }

  // NOVO: Atualizar o limite disponível do cartão de crédito se for uma despesa
  if (data && data.type === 'EXPENSE' && data.payment_method === 'Cartão' && data.card_id) {
    try {
      const { data: card, error: cardError } = await supabase
        .from('credit_cards')
        .select('limit_available')
        .eq('id', data.card_id)
        .single();

      if (cardError) throw cardError;
      
      if (card) {
        const newAvailableLimit = card.limit_available - data.amount;
        await supabase
          .from('credit_cards')
          .update({ limit_available: newAvailableLimit })
          .eq('id', data.card_id);
      }
    } catch (cardUpdateError) {
      console.error("Erro ao atualizar o limite do cartão de crédito após a transação:", cardUpdateError);
    }
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
export const updateProfile = async (userId: string, updates: { first_name?: string; last_name?: string; avatar_url?: string, role?: Role, email?: string }) => {
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

export const addCreditCard = async (card: Omit<CreditCard, 'id' | 'created_at' | 'limit_available'> & {limit_total: number}): Promise<CreditCard> => {
    const { data, error } = await supabase
        .from('credit_cards')
        .insert([{ ...card, id: crypto.randomUUID(), limit_available: card.limit_total }]) // Inicializa limit_available com limit_total
        .select()
        .single();
    
    if (error) {
        console.error('Error adding credit card:', error);
        throw error;
    }
    return data;
};

// Nova função para atualizar um cartão de crédito (incluindo limites)
export const updateCreditCard = async (id: string, updates: Partial<CreditCard>): Promise<CreditCard> => {
    const { data, error } = await supabase
        .from('credit_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating credit card:', error);
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

// Nova função para obter transações de um cartão específico por mês
export const getTransactionsByCardIdAndMonth = async (userId: string, cardId: string, month: number, year: number): Promise<Transaction[]> => {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('card_id', cardId)
        .eq('type', 'EXPENSE')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching card transactions for month:', error);
        throw error;
    }
    return data || [];
};

// --- Investments API ---

export const getInvestments = async (userId: string): Promise<Investment[]> => {
    const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        // Se a tabela não existir, retorna array vazio para não quebrar o app
        if (error.code === '42P01') { 
            console.warn("Tabela de investimentos não existe ainda.");
            return [];
        }
        console.error('Error fetching investments:', error);
        throw error;
    }
    return data || [];
};

export const addInvestment = async (investment: Omit<Investment, 'id' | 'created_at'>): Promise<Investment> => {
    const { data, error } = await supabase
        .from('investments')
        .insert([{ ...investment, id: crypto.randomUUID() }])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding investment:', error);
        throw error;
    }
    return data;
};

export const deleteInvestment = async (id: string) => {
    const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Error deleting investment:', error);
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

// NOVO: Função para deletar um usuário (requer função RPC no Supabase)
export const deleteUserById = async (userId: string) => {
    // Esta função invoca uma "Remote Procedure Call" (RPC) no Supabase.
    // Você precisa criar uma função SQL no seu painel Supabase chamada `delete_user_by_id`
    // que recebe um `user_id_to_delete` e executa a exclusão com privilégios de admin.
    // Exemplo de SQL:
    // CREATE OR REPLACE FUNCTION delete_user_by_id(user_id_to_delete uuid)
    // RETURNS void
    // LANGUAGE plpgsql
    // SECURITY DEFINER
    // AS $$
    // BEGIN
    //   IF (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN
    //     DELETE FROM auth.users WHERE id = user_id_to_delete;
    //   ELSE
    //     RAISE EXCEPTION 'Acesso negado. Apenas administradores podem excluir usuários.';
    //   END IF;
    // END;
    // $$;
    const { error } = await supabase.rpc('delete_user_by_id', {
        user_id_to_delete: userId
    });

    if (error) {
        console.error('Error deleting user via RPC:', error);
        throw error;
    }
};


// --- Site Config API ---

export const getAppConfig = async (): Promise<AppConfig> => {
    const { data, error } = await supabase
        .from('app_config')
        .select('*');

    const config: AppConfig = {
        site_name: 'FinzAI',
        site_description: 'Dashboard Financeiro',
        site_logo: '',
        site_favicon: '',
        site_keywords: '',
        site_author: '',
        site_og_image: ''
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
            if (row.key === 'site_keywords') config.site_keywords = row.value;
            if (row.key === 'site_author') config.site_author = row.value;
            if (row.key === 'site_og_image') config.site_og_image = row.value;
        });
    }

    return config;
}

export const updateAppConfig = async (config: AppConfig) => {
    const updates = [
        { key: 'site_name', value: config.site_name },
        { key: 'site_description', value: config.site_description },
        { key: 'site_logo', value: config.site_logo },
        { key: 'site_favicon', value: config.site_favicon },
        { key: 'site_keywords', value: config.site_keywords },
        { key: 'site_author', value: config.site_author },
        { key: 'site_og_image', value: config.site_og_image },
    ];

    for (const item of updates) {
        const { error } = await supabase
            .from('app_config')
            .update({ value: item.value })
            .eq('key', item.key);

        if (error) {
            console.error(`Error updating app config for key ${item.key}:`, error);
        }
    }
}
