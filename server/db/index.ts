import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRole = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceRole)) {
  console.warn('Missing Supabase configuration in .env');
}

// Global server client with Anon Key (for regular user-scoped requests if needed)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client using Service Role to bypass RLS and create users safely without modifying the auth session
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export default supabase;
