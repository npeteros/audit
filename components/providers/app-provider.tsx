import QueryProvider from './query-provider';
import { ThemeProvider } from './theme-provider';
import { UserProvider } from './user-provider';

export default function AppProvider({ children }: React.PropsWithChildren) {
    return (
        <QueryProvider>
            <UserProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </UserProvider>
        </QueryProvider>
    );
}
