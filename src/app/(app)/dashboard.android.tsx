import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
  const [photoUri, setPhotoUri] = useState<string | null>(null);

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

  async function handleOpenCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o uso da câmera para tirar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          {isLoading && <ActivityIndicator color={Colors.btnPrimary} />}

          {!isLoading && !!message && (
            <Text style={styles.message}>{message}</Text>
          )}

          {!isLoading && !!error && (
            <Text style={styles.error}>{error}</Text>
          )}

          {!!photoUri && (
            <Image source={{ uri: photoUri }} style={styles.preview} />
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.cameraButton, pressed && styles.buttonPressed]}
          android_ripple={{ color: Colors.primaryAlpha['60'] }}
          onPress={handleOpenCamera}>
          <Ionicons name="camera-outline" size={20} color={Colors.white} />
          <Text style={styles.buttonText}>ABRIR CÂMERA</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.adminButton,
            (!isAdmin || pressed) && styles.buttonPressed,
          ]}
          android_ripple={{ color: Colors.whiteAlpha['12'] }}
          disabled={!isAdmin}
          onPress={() => router.push('/admin')}>
          <Text style={styles.buttonText}>ADMIN</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.logoutButton,
            (isLoggingOut || pressed) && styles.buttonPressed,
          ]}
          android_ripple={{ color: Colors.whiteAlpha['12'] }}
          disabled={isLoggingOut}
          onPress={handleLogout}>
          <Text style={styles.buttonText}>{isLoggingOut ? 'SAINDO...' : 'DESLOGAR'}</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    padding: 24,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 32,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.txtPrimary,
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    color: Colors.semantic.error.text,
    textAlign: 'center',
  },
  preview: {
    width: 220,
    height: 220,
    borderRadius: 4,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.btnPrimary,
    borderRadius: 4,
    paddingVertical: 14,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  button: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingVertical: 14,
    elevation: 2,
    overflow: 'hidden',
  },
  adminButton: {
    backgroundColor: Colors.surfaceHighlight,
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: Colors.surface,
    marginBottom: 24,
  },
  buttonPressed: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
