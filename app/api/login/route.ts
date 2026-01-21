import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        const supabase = await createClient();
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
            },
        });

        if (error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Check your email for the login link!",
        });
    } catch (error) {
        console.error("Error in login route:", error);
        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred. Please try again.",
            },
            { status: 500 }
        );
    }
}