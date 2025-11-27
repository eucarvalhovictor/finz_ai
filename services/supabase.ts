import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your Supabase project URL and Anon Key
// You can get these from your Supabase project settings > API
const supabaseUrl = 'https://avgcwenmjpgqympsudxc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2Z2N3ZW5tanBncXltcHN1ZHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMDM2NzEsImV4cCI6MjA3OTc3OTY3MX0.wZeA4K85yebf-1LKzJfL4orTdDetEGqh5ajApXpaIcI';

if (supabaseUrl === 'https://avgcwenmjpgqympsudxc.supabase.co' || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2Z2N3ZW5tanBncXltcHN1ZHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMDM2NzEsImV4cCI6MjA3OTc3OTY3MX0.wZeA4K85yebf-1LKzJfL4orTdDetEGqh5ajApXpaIcI') {
  console.warn('Supabase URL or Anon Key is not set. Please update services/supabase.ts with your project credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);