'use server'

import { createClient } from "@/utils/supabase/server"

export async function signInWithEmail(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string;

        const { error } = await supabase.auth.signInWithOtp({
            email
        })

        if (error)
            return { success: false, message: "Something went wrong. Please try again." };
        return { success: true, message: "We've sent a login link to your email. If you don't see it in your inbox, be sure to check your spam folder." };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Something went wrong. Please try again." };
    }
}
