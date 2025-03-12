import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const robotoCondensed = Roboto_Condensed({
    subsets: ["latin"],
    weight: ["100", "300", "400", "700"],
    variable: "--font-roboto-condensed",
});

export const metadata: Metadata = {
    title: "Audit PH",
    description: "A digital archive for all articles of Today's Carolinian",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${robotoCondensed.variable} bg-[#F8F8F8]`}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
