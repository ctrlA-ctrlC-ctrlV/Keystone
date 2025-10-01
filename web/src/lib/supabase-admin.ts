import 'server-only'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE!;


// admin client (server-only, for server actions)
export const supabaseAdmin = createClient(url, service, {
    auth: { persistSession: false },
});