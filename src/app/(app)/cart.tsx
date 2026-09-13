import { useMemo, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckoutResult } from '@/@types/product';
import { formatBRL } from '@/constants/format';
import { elevation, radius, space, ThemeColors } from '@/constants/store-theme';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { checkout } from '@/integration/productsIntegration';

export default function Cart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { items, totalItems, totalPrice, setQuantity, removeItem, clear } = useCart();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [order, setOrder] = useState<CheckoutResult | null>(null);

  async function handleCheckout() {
    setError('');
    setIsSubmitting(true);
    try {
      const result = await checkout(
        items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      );
      setOrder(result);
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível finalizar a compra.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function Header({ title }: { title: string }) {
    return (
      <View style={[styles.header, { paddingTop: insets.top + space.xs }]}>
        <Pressable hitSlop={10} accessibilityLabel="Voltar" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.onHeader} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    );
  }

  if (order) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="light" />
        <View style={styles.screen}>
          <Header title="Compra finalizada" />
          <View style={styles.center}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color={colors.onAccent} />
            </View>
            <Text style={styles.successTitle}>Pedido confirmado!</Text>
            <Text style={styles.successText}>
              {order.orderId} · {formatBRL(order.total)}
            </Text>
            <Text style={styles.successHint}>O estoque dos produtos foi atualizado.</Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => router.replace('/dashboard')}>
              <Text style={styles.primaryBtnText}>Voltar à loja</Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <View style={styles.screen}>
        <Header title={`Sacola${totalItems ? ` · ${totalItems}` : ''}`} />

        {items.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="bag-outline" size={56} color={colors.textFaint} />
            <Text style={styles.stateText}>Sua sacola está vazia.</Text>
            <Pressable style={styles.primaryBtn} onPress={() => router.replace('/dashboard')}>
              <Text style={styles.primaryBtnText}>Explorar produtos</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.product.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const atMax = item.quantity >= item.product.stock;
              return (
                <View style={styles.row}>
                  <Image
                    source={{ uri: item.product.thumbnail }}
                    style={styles.thumb}
                    resizeMode="cover"
                  />

                  <View style={styles.rowBody}>
                    <Text style={styles.rowName} numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.rowUnit}>{formatBRL(item.product.price)} / un.</Text>

                    <View style={styles.rowFooter}>
                      <View style={styles.stepper}>
                        <Pressable
                          accessibilityLabel="Diminuir quantidade"
                          style={styles.stepBtn}
                          onPress={() => setQuantity(item.product.id, item.quantity - 1)}>
                          <Ionicons name="remove" size={16} color={colors.text} />
                        </Pressable>
                        <Text style={styles.stepValue}>{item.quantity}</Text>
                        <Pressable
                          accessibilityLabel="Aumentar quantidade"
                          style={[styles.stepBtn, atMax && styles.stepBtnDisabled]}
                          disabled={atMax}
                          onPress={() => setQuantity(item.product.id, item.quantity + 1)}>
                          <Ionicons name="add" size={16} color={colors.text} />
                        </Pressable>
                      </View>

                      <Text style={styles.rowSubtotal}>
                        {formatBRL(item.product.price * item.quantity)}
                      </Text>
                    </View>

                    <Pressable
                      hitSlop={6}
                      style={styles.removeBtn}
                      onPress={() => removeItem(item.product.id)}>
                      <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.removeText}>Remover</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }}
          />
        )}

        {items.length > 0 && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({totalItems} itens)</Text>
              <Text style={styles.summaryValue}>{formatBRL(totalPrice)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frete</Text>
              <Text style={styles.summaryFree}>Grátis</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatBRL(totalPrice)}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              style={[styles.primaryBtn, styles.checkoutBtn, isSubmitting && styles.btnDisabled]}
              disabled={isSubmitting}
              onPress={handleCheckout}>
              {isSubmitting ? (
                <ActivityIndicator color={colors.onAccent} />
              ) : (
                <Text style={styles.primaryBtnText}>Finalizar compra</Text>
              )}
            </Pressable>
          </View>
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingHorizontal: space.lg,
      paddingBottom: space.md,
      backgroundColor: c.header,
      ...elevation(c, 2),
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.onHeader,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.md,
      padding: space.xxl,
    },
    stateText: {
      fontSize: 14,
      color: c.textMuted,
      textAlign: 'center',
    },
    listContent: {
      padding: space.md,
      gap: space.md,
    },
    row: {
      flexDirection: 'row',
      gap: space.md,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: space.md,
      ...elevation(c, 1),
    },
    thumb: {
      width: 84,
      height: 84,
      borderRadius: radius.sm,
      backgroundColor: c.surfaceMuted,
    },
    rowBody: {
      flex: 1,
      gap: space.xs,
    },
    rowName: {
      fontSize: 13,
      lineHeight: 18,
      color: c.text,
    },
    rowUnit: {
      fontSize: 12,
      color: c.textMuted,
    },
    rowFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: space.xs,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      borderWidth: 1,
      borderColor: c.borderStrong,
      borderRadius: radius.sm,
      paddingHorizontal: 4,
      height: 34,
    },
    stepBtn: {
      width: 28,
      height: 28,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnDisabled: {
      opacity: 0.35,
    },
    stepValue: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textStrong,
      minWidth: 18,
      textAlign: 'center',
    },
    rowSubtotal: {
      fontSize: 15,
      fontWeight: '800',
      color: c.price,
    },
    removeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      marginTop: space.xs,
    },
    removeText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
    },
    footer: {
      backgroundColor: c.surface,
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingHorizontal: space.lg,
      paddingTop: space.lg,
      gap: space.sm,
      ...elevation(c, 3),
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: 13,
      color: c.textMuted,
    },
    summaryValue: {
      fontSize: 13,
      color: c.text,
      fontWeight: '600',
    },
    summaryFree: {
      fontSize: 13,
      color: c.success,
      fontWeight: '700',
    },
    totalRow: {
      marginTop: space.xs,
      paddingTop: space.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    totalLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textStrong,
    },
    totalValue: {
      fontSize: 22,
      fontWeight: '800',
      color: c.price,
      letterSpacing: -0.5,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.dangerSoft,
      borderRadius: radius.sm,
      padding: space.md,
    },
    errorText: {
      flex: 1,
      fontSize: 13,
      color: c.danger,
    },
    primaryBtn: {
      height: 48,
      borderRadius: radius.sm,
      paddingHorizontal: space.xl,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.accent,
    },
    checkoutBtn: {
      width: '100%',
      marginTop: space.sm,
    },
    primaryBtnText: {
      color: c.onAccent,
      fontSize: 15,
      fontWeight: '700',
    },
    btnDisabled: {
      opacity: 0.6,
    },
    successIcon: {
      width: 68,
      height: 68,
      borderRadius: radius.pill,
      backgroundColor: c.success,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: space.xs,
    },
    successTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: c.textStrong,
    },
    successText: {
      fontSize: 14,
      color: c.text,
      fontWeight: '600',
    },
    successHint: {
      fontSize: 12,
      color: c.textMuted,
      marginBottom: space.sm,
    },
  });
}
