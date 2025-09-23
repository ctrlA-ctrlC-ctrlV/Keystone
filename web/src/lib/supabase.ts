import 'server-only'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE!;

// public client (safe for server-renderd reads)
export const supabase = createClient(url, anon, {
    auth: { persistSession: false },
});

// admin client (server-only, for server actions)
export const supabaseAdmin = createClient(url, service, {
    auth: { persistSession: false },
});