import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

type Props = {
    rating: number;
    count?: number;
    size?: number;
    showValue?: boolean;
    tone?: 'default' | 'onDark';
};

export function RatingStars({ rating, count, size = 13, showValue = true, tone = 'default' }: Props) {
    const { colors } = useTheme();
    const valueColor = tone === 'onDark' ? 'rgba(255,255,255,0.85)' : colors.textMuted;

    const stars = Array.from({ length: 5 }).map((_, index) => {
        const position = index + 1;
        if (rating >= position) return 'star' as const;
        if (rating >= position - 0.5) return 'star-half' as const;
        return 'star-outline' as const;
    });

    return (
        <View style={styles.row}>
            {stars.map((name, index) => (
                <Ionicons key={index} name={name} size={size} color={colors.star} />
            ))}

            {showValue && (
                <Text style={[styles.value, { fontSize: size - 1, color: valueColor }]}>
                    {typeof count === 'number' ? `${rating.toFixed(1)} (${count})` : rating.toFixed(1)}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1.5,
    },
    value: {
        marginLeft: 6,
        fontWeight: '600',
    },
});
