import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <CartProvider>
                        <Slot />
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
