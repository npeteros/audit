// 'use client';

// import { useUser } from '@/lib/api/users.api';
// import { createContext, useContext, ReactNode } from 'react';

// interface UserContextType {
//     userId: string | null;
//     email: string | null;
//     avatarUrl: string | null;
//     isLoading: boolean;
//     refreshUser: () => Promise<void>;
// }

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export function UserProvider({ children }: { children: ReactNode }) {
//     const { data, isLoading, refetch } = useUser();

//     const userId = data?.user?.id || null;
//     const email = data?.user?.email || null;
//     const avatarUrl = data?.user?.avatarUrl || null;

//     const refreshUser = async () => {
//         await refetch();
//     };

//     return <UserContext.Provider value={{ userId, email, avatarUrl, isLoading, refreshUser }}>{children}</UserContext.Provider>;
// }

// export function useUser() {
//     const context = useContext(UserContext);
//     if (context === undefined) {
//         throw new Error('useUser must be used within a UserProvider');
//     }
//     return context;
// }
