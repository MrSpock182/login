import { usePathname, useRouter } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import { Auth } from '@/@types/auth';
import { registerSessionExpiredHandler } from '@/integration/authIntegration';

type AuthContextData = {
    auth: Auth | null;
    setAuth: (auth: Auth | null) => void;
};

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [auth, setAuth] = useState<Auth | null>(null);

    useEffect(() => {
        registerSessionExpiredHandler(() => {
            setAuth(null);

            if (pathname !== '/') {
                router.replace('/');
            }
        });
    }, [router, pathname]);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
