import QueryProvider from './query-provider';
import { ThemeProvider } from './theme-provider';

export default function AppProvider({ children }: React.PropsWithChildren) {
    return (
        <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
            </ThemeProvider>
        </QueryProvider>
    );
}
