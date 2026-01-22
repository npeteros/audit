import { createClient } from '@/lib/supabase/server';
import { JwtPayload } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const {
            data,
            error,
        } = await supabase.auth.getClaims();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        const user: JwtPayload = data?.claims as JwtPayload;

        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        return NextResponse.json(
            {
                user: {
                    id: user.sub,
                    email: user.email,
                    avatarUrl: user.user_metadata?.avatar_url || null,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
