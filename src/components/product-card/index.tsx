import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Product } from '@/@types/product';
import { RatingStars } from '@/components/rating-stars';
import { formatBRL } from '@/constants/format';
import { elevation, radius, space, ThemeColors } from '@/constants/store-theme';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
    product: Product;
    onPress: (product: Product) => void;
};

const INSTALLMENTS = 10;

export function ProductCard({ product, onPress }: Props) {
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

    const isOut = product.stock <= 0;
    const isLow = !isOut && product.stock <= 5;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${product.name}, ${formatBRL(product.price)}`}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => onPress(product)}>
            <View style={styles.imageTile}>
                <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="contain" />

                {(isOut || isLow) && (
                    <View style={[styles.badge, isOut ? styles.badgeOut : styles.badgeLow]}>
                        <Text style={[styles.badgeText, { color: isOut ? colors.danger : colors.warning }]}>
                            {isOut ? 'Esgotado' : `Últimas ${product.stock}`}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.body}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>

                <RatingStars rating={product.rating} count={product.ratingCount} size={12} />

                <Text style={styles.price}>{formatBRL(product.price)}</Text>
                <Text style={styles.installment} numberOfLines={1}>
                    {INSTALLMENTS}x de {formatBRL(product.price / INSTALLMENTS)} sem juros
                </Text>
            </View>
        </Pressable>
    );
}

function makeStyles(c: ThemeColors) {
    return StyleSheet.create({
        card: {
            flex: 1,
            backgroundColor: c.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: c.border,
            ...elevation(c, 1),
        },
        pressed: {
            opacity: 0.9,
        },
        // Mesma margem lateral do corpo -> imagem e texto na mesma borda esquerda.
        imageTile: {
            height: 110,
            marginHorizontal: space.md,
            marginTop: space.md,
            borderRadius: radius.sm,
            backgroundColor: c.surfaceMuted,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        },
        image: {
            width: '82%',
            height: '82%',
        },
        badge: {
            position: 'absolute',
            top: 6,
            left: 6,
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderRadius: radius.sm,
        },
        badgeOut: {
            backgroundColor: c.dangerSoft,
        },
        badgeLow: {
            backgroundColor: c.warningSoft,
        },
        badgeText: {
            fontSize: 10,
            fontWeight: '700',
        },
        body: {
            paddingHorizontal: space.md,
            paddingTop: space.sm,
            paddingBottom: space.md,
            gap: 4,
        },
        name: {
            fontSize: 13,
            lineHeight: 17,
            color: c.text,
            minHeight: 34,
        },
        price: {
            fontSize: 17,
            fontWeight: '700',
            color: c.price,
            marginTop: 2,
            letterSpacing: -0.2,
        },
        installment: {
            fontSize: 11,
            color: c.textMuted,
        },
    });
}
