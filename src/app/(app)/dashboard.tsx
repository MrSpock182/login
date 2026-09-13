import { useCallback, useEffect, useMemo, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Product } from '@/@types/product';
import { Pagination } from '@/components/pagination';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/skeleton';
import { elevation, radius, space, ThemeColors } from '@/constants/store-theme';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getMessage, logout } from '@/integration/authIntegration';
import { listProducts, PAGE_SIZE } from '@/integration/productsIntegration';

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, name: themeName, toggle: toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { auth, setAuth } = useAuth();
  const { totalItems } = useCart();

  const isAdmin = !!auth?.roles.some((role) => role.toUpperCase().includes('ADMIN'));

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [query, setQuery] = useState<string>('');

  const fetchPage = useCallback(async (target: number) => {
    setError('');
    setIsLoading(true);
    try {
      const data = await listProducts(target, PAGE_SIZE);
      setProducts(data.items);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os produtos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  useFocusEffect(
    useCallback(() => {
      getMessage().catch(() => undefined);
    }, []),
  );

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => product.name.toLowerCase().includes(term));
  }, [products, query]);

  const isSearching = query.trim().length > 0;

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setAuth(null);
      router.replace('/');
    }
  }

  function goToProduct(product: Product) {
    router.push(`/product/${product.id}`);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
          <View style={styles.headerRow}>
            <Text style={styles.brand} accessibilityRole="header">
              Loja <Text style={styles.brandStrong}>Fatec</Text>
            </Text>

            <View style={styles.headerActions}>
              <Pressable
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={themeName === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
                onPress={toggleTheme}>
                <Ionicons
                  name={themeName === 'light' ? 'moon-outline' : 'sunny-outline'}
                  size={22}
                  color={colors.onHeader}
                />
              </Pressable>

              {isAdmin && (
                <Pressable
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Relatório de vendas"
                  onPress={() => router.push('/admin')}>
                  <Ionicons name="stats-chart-outline" size={22} color={colors.onHeader} />
                </Pressable>
              )}

              <Pressable
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Carrinho, ${totalItems} itens`}
                onPress={() => router.push('/cart')}>
                <Ionicons name="cart-outline" size={24} color={colors.onHeader} />
                {totalItems > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Sair"
                onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={23} color={colors.onHeader} />
              </Pressable>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.75)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar na Loja Fatec"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Buscar produtos"
            />
            {isSearching && (
              <Pressable hitSlop={10} accessibilityLabel="Limpar busca" onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.75)" />
              </Pressable>
            )}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.skeletonCard}>
                <Skeleton height={110} radius={radius.sm} style={styles.skeletonImage} />
                <View style={styles.skeletonBody}>
                  <Skeleton height={12} width="90%" />
                  <Skeleton height={12} width="55%" />
                  <Skeleton height={16} width="45%" />
                </View>
              </View>
            ))}
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={44} color={colors.textFaint} />
            <Text style={styles.stateText}>{error}</Text>
            <Pressable style={styles.primaryBtn} onPress={() => fetchPage(page)}>
              <Text style={styles.primaryBtnText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.column}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + space.xxl }]}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <ProductCard product={item} onPress={goToProduct} />}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons name="search-outline" size={44} color={colors.textFaint} />
                <Text style={styles.stateText}>
                  Nenhum produto encontrado para “{query.trim()}”.
                </Text>
              </View>
            }
            ListFooterComponent={
              isSearching ? null : (
                <Pagination page={page} totalPages={totalPages} onChange={fetchPage} />
              )
            }
          />
        )}
      </View>
    </>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: c.canvas,
    },
    header: {
      backgroundColor: c.header,
      paddingHorizontal: space.lg,
      paddingBottom: space.md,
      gap: space.md,
      ...elevation(c, 2),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brand: {
      fontSize: 20,
      fontWeight: '500',
      color: c.onHeader,
      letterSpacing: 0.2,
    },
    brandStrong: {
      fontWeight: '900',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.lg,
    },
    cartBadge: {
      position: 'absolute',
      top: -7,
      right: -9,
      minWidth: 17,
      height: 17,
      paddingHorizontal: 4,
      borderRadius: radius.pill,
      backgroundColor: c.star,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#1B1F24',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderRadius: radius.sm,
      paddingHorizontal: space.md,
      height: 42,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: '#FFFFFF',
      paddingVertical: 0,
    },
    listContent: {
      padding: space.md,
      gap: space.md,
    },
    column: {
      gap: space.md,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: space.md,
      gap: space.md,
    },
    skeletonCard: {
      width: '47%',
      flexGrow: 1,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      paddingBottom: space.sm,
    },
    skeletonImage: {
      marginHorizontal: space.md,
      marginTop: space.md,
    },
    skeletonBody: {
      padding: space.md,
      gap: space.sm,
    },
    center: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.md,
      padding: space.xxl,
    },
    stateText: {
      fontSize: 14,
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    primaryBtn: {
      marginTop: space.xs,
      paddingHorizontal: space.xl,
      height: 44,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.accent,
    },
    primaryBtnText: {
      color: c.onAccent,
      fontWeight: '700',
      fontSize: 14,
    },
  });
}
