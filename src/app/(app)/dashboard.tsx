import { useEffect, useState } from 'react';

import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMessage, logout } from '@/integration/authIntegration';

export default function Dashboard() {
  const router = useRouter();
  const { auth, setAuth } = useAuth();

  const isAdmin = !!auth?.roles.some((role) => role.toUpperCase().includes('ADMIN'));

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  useEffect(() => {
    fetchMessage();
  }, []);

  async function fetchMessage() {
    setError('');
    setIsLoading(true);

    try {
      const data = await getMessage();
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar a mensagem.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setAuth(null);
      setIsLoggingOut(false);
      router.replace('/');
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.content}>
          {isLoading && <ActivityIndicator color={Colors.black} />}

          {!isLoading && !!message && (
            <Text style={styles.message}>{message}</Text>
          )}

          {!isLoading && !!error && (
            <Text style={styles.error}>{error}</Text>
          )}
        </View>

        <Button
          title="Admin"
          disabled={!isAdmin}
          onPress={() => router.push('/admin')}
          style={styles.adminButton}
        />

        <Button
          title={isLoggingOut ? 'Saindo...' : 'Deslogar'}
          disabled={isLoggingOut}
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    color: Colors.semantic.error.text,
    textAlign: 'center',
  },
  adminButton: {
    maxWidth: 320,
    marginBottom: 12,
    backgroundColor: Colors.gray[800],
  },
  logoutButton: {
    maxWidth: 320,
    marginBottom: 24,
  },
});
