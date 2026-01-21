'use client';

import { createClient } from '@/lib/supabase/client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserContextType {
    userId: string | null;
    email: string | null;
    avatarUrl: string | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = async () => {
        setIsLoading(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.getClaims();

            if (error) {
                console.error('Error fetching user claims:', error);
                setUserId(null);
                setEmail(null);
                setAvatarUrl(null);
                return;
            }

            if (data) {
                setUserId(data.claims.sub);
                setEmail((data.claims.email as string) || null);
                setAvatarUrl((data.claims.user_metadata?.avatar_url as string) || null);
            }
        } catch (error) {
            console.error('Error loading user:', error);
            setUserId(null);
            setEmail(null);
            setAvatarUrl(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const refreshUser = async () => {
        await loadUser();
    };

    return <UserContext.Provider value={{ userId, email, avatarUrl, isLoading, refreshUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
