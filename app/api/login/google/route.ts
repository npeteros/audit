import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    if (error || data == null || data.url == null) {
        console.error('Error signing in with Google:', error);
        return NextResponse.json({ success: false, message: 'Google sign-in failed' }, { status: 500 });
    }
    return NextResponse.json({ success: true, url: data.url });
}
