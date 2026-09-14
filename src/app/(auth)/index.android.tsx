import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMessage, login } from '@/integration/authIntegration';

export default function Index() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

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
          <ActivityIndicator color={Colors.btnPrimary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView style={styles.flex} behavior="height">
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>

          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>USUÁRIO</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                autoCorrect={false}
                autoCapitalize="none"
                placeholder="Digite seu usuário"
                placeholderTextColor={Colors.whiteAlpha['50']}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>SENHA</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCorrect={false}
                  autoCapitalize="none"
                  placeholder="Digite sua senha"
                  placeholderTextColor={Colors.whiteAlpha['50']}
                />

                <Pressable onPress={() => setIsPasswordVisible((prev) => !prev)} hitSlop={8}>
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.whiteAlpha['65']}
                  />
                </Pressable>
              </View>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              android_ripple={{ color: Colors.primaryAlpha['60'] }}
              disabled={isLoading}
              onPress={handleLogin}>
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>ENTRAR</Text>
              )}
            </Pressable>

            <Pressable
              hitSlop={8}
              style={styles.linkWrapper}
              android_ripple={{ color: Colors.whiteAlpha['12'], borderless: true }}
              onPress={() => router.push('/register')}>
              <Text style={styles.link}>CRIAR USUÁRIO</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  checking: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: Colors.txtPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.whiteAlpha['65'],
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 4,
    padding: 20,
    elevation: 2,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: Colors.btnPrimary,
    marginBottom: 6,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteAlpha['30'],
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.txtPrimary,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteAlpha['30'],
  },
  passwordInput: {
    flex: 1,
    borderBottomWidth: 0,
  },
  error: {
    color: Colors.semantic.error.text,
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.btnPrimary,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  linkWrapper: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 8,
  },
  link: {
    color: Colors.btnPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
