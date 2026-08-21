import { useEffect, useState } from 'react';

import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Colors } from '@/constants/colors';
import { getMessageAdmin } from '@/integration/authIntegration';

export default function Admin() {
  const router = useRouter();

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMessage();
  }, []);

  async function fetchMessage() {
    setError('');
    setIsLoading(true);

    try {
      const data = await getMessageAdmin();
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar a mensagem.');
    } finally {
      setIsLoading(false);
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
          title="Voltar"
          onPress={() => router.back()}
          style={styles.backButton}
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
  backButton: {
    maxWidth: 320,
    marginBottom: 24,
  },
});
