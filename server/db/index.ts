import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env only in development (not needed in Vercel where env vars are injected)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Validate Supabase configuration
if (!supabaseUrl) {
  console.error('FATAL: Missing SUPABASE_URL environment variable');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SUPABASE_URL is required in production');
  }
}

if (!supabaseAnonKey && !supabaseServiceRole) {
  console.error('FATAL: Missing Supabase keys (SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY)');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Supabase authentication keys are required in production');
  }
}

// Global server client with Anon Key (for regular user-scoped requests if needed)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client using Service Role to bypass RLS and create users safely without modifying the auth session
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export default supabase;
