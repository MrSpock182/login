import { useEffect, useMemo, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Product } from '@/@types/product';
import { RatingStars } from '@/components/rating-stars';
import { Skeleton } from '@/components/skeleton';
import { formatBRL } from '@/constants/format';
import { elevation, radius, space, ThemeColors } from '@/constants/store-theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { getProduct } from '@/integration/productsIntegration';

const INSTALLMENTS = 10;

export default function ProductDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, items } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');

    getProduct(String(id))
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setActiveImage(data.images[0] ?? data.thumbnail);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Não foi possível carregar o produto.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const inCart = product ? items.find((item) => item.product.id === product.id)?.quantity ?? 0 : 0;
  const isOut = !!product && product.stock <= 0;
  const reachedLimit = !!product && inCart >= product.stock;

  function handleAddToCart() {
    if (!product) return;
    addItem(product, 1);
    setFeedback('Produto adicionado à sacola.');
  }

  function handleBuyNow() {
    if (!product) return;
    if (inCart < 1) addItem(product, 1);
    router.push('/cart');
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + space.xs }]}>
          <Pressable hitSlop={10} accessibilityLabel="Voltar" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.onHeader} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {product?.name ?? 'Produto'}
          </Text>
          <Pressable hitSlop={10} accessibilityLabel="Carrinho" onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={24} color={colors.onHeader} />
          </Pressable>
        </View>

        {isLoading ? (
          <ScrollView contentContainerStyle={styles.loadingWrap}>
            <Skeleton height={300} radius={radius.md} />
            <Skeleton height={16} width="40%" />
            <Skeleton height={22} width="85%" />
            <Skeleton height={28} width="50%" />
            <Skeleton height={60} width="100%" />
          </ScrollView>
        ) : error || !product ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={44} color={colors.textFaint} />
            <Text style={styles.stateText}>{error || 'Produto indisponível.'}</Text>
            <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
              <Text style={styles.primaryBtnText}>Voltar</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={{ paddingBottom: insets.bottom + 156 }}
              showsVerticalScrollIndicator={false}>
              <View style={styles.stage}>
                <Image source={{ uri: activeImage }} style={styles.hero} resizeMode="contain" />
                {product.images.length > 1 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.thumbRow}>
                    {product.images.map((uri) => (
                      <Pressable key={uri} onPress={() => setActiveImage(uri)}>
                        <Image
                          source={{ uri }}
                          style={[styles.thumb, activeImage === uri && styles.thumbActive]}
                          resizeMode="cover"
                        />
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.category}>{product.category.toUpperCase()}</Text>
                <Text style={styles.name}>{product.name}</Text>

                <View style={styles.ratingRow}>
                  <RatingStars rating={product.rating} showValue={false} size={15} />
                  <Text style={styles.ratingLink}>{product.ratingCount} avaliações</Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.price}>{formatBRL(product.price)}</Text>
                <Text style={styles.installment}>
                  em {INSTALLMENTS}x de {formatBRL(product.price / INSTALLMENTS)} sem juros
                </Text>

                <View style={styles.stockRow}>
                  <Ionicons
                    name={isOut ? 'close-circle' : 'checkmark-circle'}
                    size={16}
                    color={isOut ? colors.danger : colors.success}
                  />
                  <Text style={[styles.stockText, { color: isOut ? colors.danger : colors.success }]}>
                    {isOut ? 'Sem estoque' : `Em estoque · ${product.stock} unidades`}
                  </Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Descrição</Text>
                <Text style={styles.body}>{product.description}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Opiniões de quem comprou</Text>

                <View style={styles.reviewSummary}>
                  <Text style={styles.reviewBig}>{product.rating.toFixed(1)}</Text>
                  <View style={styles.reviewSummaryInfo}>
                    <RatingStars rating={product.rating} showValue={false} size={16} />
                    <Text style={styles.reviewCount}>{product.ratingCount} avaliações</Text>
                  </View>
                </View>

                {product.reviews.map((review, index) => (
                  <View
                    key={review.id}
                    style={[styles.review, index === product.reviews.length - 1 && styles.reviewLast]}>
                    <RatingStars rating={review.rating} size={12} showValue={false} />
                    <Text style={styles.reviewComment}>{review.comment}</Text>

                    {review.photos.length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.reviewPhotos}>
                        {review.photos.map((uri) => (
                          <Image
                            key={uri}
                            source={{ uri }}
                            style={styles.reviewPhoto}
                            resizeMode="cover"
                          />
                        ))}
                      </ScrollView>
                    )}

                    <Text style={styles.reviewMeta}>
                      {review.author} · {review.date}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
              {!!feedback && (
                <View style={styles.toast}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.toastText}>{feedback}</Text>
                </View>
              )}
              <View style={styles.footerButtons}>
                <Pressable
                  accessibilityRole="button"
                  style={[styles.btn, styles.btnSecondary, (isOut || reachedLimit) && styles.btnDisabled]}
                  disabled={isOut || reachedLimit}
                  onPress={handleAddToCart}>
                  <Text style={styles.btnSecondaryText}>
                    {reachedLimit ? 'Limite de estoque' : 'Adicionar à sacola'}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  style={[styles.btn, styles.btnPrimary, isOut && styles.btnDisabled]}
                  disabled={isOut}
                  onPress={handleBuyNow}>
                  <Text style={styles.btnPrimaryText}>Comprar agora</Text>
                </Pressable>
              </View>
            </View>
          </>
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
    scroll: {
      flex: 1,
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
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.onHeader,
    },
    loadingWrap: {
      padding: space.lg,
      gap: space.md,
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
      lineHeight: 20,
    },
    stage: {
      backgroundColor: c.surface,
      paddingHorizontal: space.lg,
      paddingVertical: space.md,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    hero: {
      width: '100%',
      height: 220,
      borderRadius: radius.md,
      backgroundColor: c.surfaceMuted,
    },
    thumbRow: {
      gap: space.sm,
      paddingTop: space.md,
    },
    thumb: {
      width: 54,
      height: 54,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceMuted,
    },
    thumbActive: {
      borderColor: c.accent,
      borderWidth: 2,
    },
    card: {
      backgroundColor: c.surface,
      marginTop: space.sm,
      paddingHorizontal: space.lg,
      paddingVertical: space.lg,
      gap: space.sm,
    },
    category: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
      letterSpacing: 0.6,
    },
    name: {
      fontSize: 20,
      fontWeight: '600',
      color: c.textStrong,
      lineHeight: 27,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
    },
    ratingLink: {
      fontSize: 13,
      color: c.link,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
      marginVertical: space.sm,
    },
    price: {
      fontSize: 30,
      fontWeight: '800',
      color: c.price,
      letterSpacing: -0.5,
    },
    installment: {
      fontSize: 13,
      color: c.textMuted,
    },
    stockRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: space.sm,
    },
    stockText: {
      fontSize: 13,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textStrong,
      marginBottom: space.xs,
    },
    body: {
      fontSize: 14,
      lineHeight: 22,
      color: c.text,
    },
    reviewSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.lg,
      paddingBottom: space.md,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    reviewSummaryInfo: {
      gap: 3,
    },
    reviewBig: {
      fontSize: 40,
      fontWeight: '300',
      color: c.textStrong,
    },
    reviewCount: {
      fontSize: 12,
      color: c.textMuted,
    },
    review: {
      paddingVertical: space.md,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      gap: 6,
    },
    reviewLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    reviewComment: {
      fontSize: 13,
      lineHeight: 20,
      color: c.text,
    },
    reviewPhotos: {
      gap: space.sm,
      paddingTop: space.xs,
    },
    reviewPhoto: {
      width: 64,
      height: 64,
      borderRadius: radius.sm,
      backgroundColor: c.surfaceMuted,
    },
    reviewMeta: {
      fontSize: 11,
      color: c.textFaint,
      fontWeight: '500',
      marginTop: 2,
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: space.lg,
      paddingTop: space.md,
      backgroundColor: c.surface,
      borderTopWidth: 1,
      borderTopColor: c.border,
      gap: space.sm,
      ...elevation(c, 3),
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: c.successSoft,
      borderRadius: radius.sm,
      paddingVertical: 7,
    },
    toastText: {
      fontSize: 12,
      color: c.success,
      fontWeight: '600',
    },
    footerButtons: {
      flexDirection: 'row',
      gap: space.md,
    },
    btn: {
      flex: 1,
      height: 48,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnPrimary: {
      backgroundColor: c.accent,
    },
    btnPrimaryText: {
      color: c.onAccent,
      fontSize: 15,
      fontWeight: '700',
    },
    btnSecondary: {
      borderWidth: 1.5,
      borderColor: c.accent,
    },
    btnSecondaryText: {
      color: c.accent,
      fontSize: 14,
      fontWeight: '700',
    },
    btnDisabled: {
      opacity: 0.4,
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
