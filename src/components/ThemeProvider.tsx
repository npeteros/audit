"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Moon } from "lucide-react";

export default function ThemeProvider() {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        if (typeof window !== "undefined")
            return localStorage.theme === "dark" ? "dark" : "light";
        return "light";
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");

        localStorage.theme = theme;
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <Button
            variant={"outline"}
            className="rounded-md p-2"
            onClick={toggleTheme}
        >
            <Moon className="size-4" />
        </Button>
    );
}
