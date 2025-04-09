import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AuthService from '@/services/auth.service'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/wallets/dashboard'

    if (token_hash && type) {
        const supabase = await createClient()

        const { data: { user }, error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        if (!error && user && user.email) {
            const existingUser = await AuthService.userInDatabase({ email: user.email });

            if (!existingUser) {
                await AuthService.createUser({ id: user.id, email: user.email })
            }

            // redirect user to specified redirect URL or root of app
            redirect(next)
        }

    }

    // redirect the user to an error page with some instructions
    redirect('/error')
}