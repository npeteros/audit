import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with secret key for admin operations.
 * Used for server-side operations that need to bypass RLS policies,
 * such as generating and storing embeddings.
 *
 * @returns Supabase client with admin privileges
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
        throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for admin operations');
    }

    return createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}
