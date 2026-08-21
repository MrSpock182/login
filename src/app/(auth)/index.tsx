import { useEffect, useState } from 'react';

import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { BoxLogin } from '@/components/box-login';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMessage, login } from '@/integration/authIntegration';

export default function Index() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);

  useEffect(() => {
    getMessage()
      .then(() => router.replace('/dashboard'))
      .catch(() => setIsCheckingSession(false));
  }, []);

  async function handleLogin() {
    setError('');
    setIsLoading(true);

    try {
      const data = await login({ username: name, password });
      setAuth(data);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingSession) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.checking}>
          <ActivityIndicator color={Colors.white} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ImageBackground
        source={require('../../../assets/fatec-login.png')}
        style={styles.background}
        resizeMode="cover">

        <View style={styles.container}>
          <StatusBar style="auto" />
          <BoxLogin>
            <View style={styles.fieldsGroup}>
              <Input
                placeholder="Usuário"
                icon="person-outline"
                onChangeText={setName}
                value={name}
                autoCorrect={false}/>

              <Input
                placeholder="Senha"
                icon="lock-closed-outline"
                isPassword
                onChangeText={setPassword}
                value={password}
                autoCorrect={false}/>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.linksRow}>
              <Pressable hitSlop={8} onPress={() => router.push('/register')}>
                <Text style={styles.link}>Criar usuário</Text>
              </Pressable>
            </View>

            <Button
              title={isLoading ? 'Entrando...' : 'Logar'}
              disabled={isLoading}
              onPress={handleLogin}
            />
          </BoxLogin>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  checking: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  fieldsGroup: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    gap: 32,
  },
  linksRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    fontSize: 13,
    color: Colors.whiteAlpha['65'],
    textDecorationLine: 'underline',
  },
  error: {
    width: '100%',
    fontSize: 13,
    color: Colors.semantic.error.text,
    textAlign: 'center',
  },
});
