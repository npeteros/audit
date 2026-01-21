import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        await supabase.auth.signOut();
        return NextResponse.json(
            { success: true, message: "Successfully logged out." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in logout route:", error);
        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred. Please try again.",
            },
            { status: 500 }
        );
    }
}