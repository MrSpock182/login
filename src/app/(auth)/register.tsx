import { useState } from 'react';

import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { BoxLogin } from '@/components/box-login';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { createUser } from '@/integration/authIntegration';

export default function Register() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [cep, setCep] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleCreateAccount() {
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await createUser({ username, password, email, cep });
      setAuth(data);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setIsLoading(false);
    }
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
                onChangeText={setUsername}
                value={username}
                autoCorrect={false}/>

              <Input
                placeholder="Senha"
                icon="lock-closed-outline"
                isPassword
                onChangeText={setPassword}
                value={password}
                autoCorrect={false}/>

              <Input
                placeholder="Confirmar senha"
                icon="lock-closed-outline"
                isPassword
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                autoCorrect={false}/>

              <Input
                placeholder="E-mail"
                icon="mail-outline"
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}/>

              <Input
                placeholder="CEP"
                icon="location-outline"
                onChangeText={setCep}
                value={cep}
                keyboardType="numeric"
                autoCorrect={false}/>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.linksRow}>
              <Pressable hitSlop={8} onPress={() => router.back()}>
                <Text style={styles.link}>Já tenho conta</Text>
              </Pressable>
            </View>

            <Button
              title={isLoading ? 'Criando...' : 'Criar conta'}
              disabled={isLoading}
              onPress={handleCreateAccount}
            />
          </BoxLogin>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
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
  fieldsGroup: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    gap: 24,
  },
  linksRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
