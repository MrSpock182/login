import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, space, ThemeColors } from '@/constants/store-theme';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
    disabled?: boolean;
};

export function Pagination({ page, totalPages, onChange, disabled }: Props) {
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }).map((_, index) => index + 1);
    const canPrev = page > 1 && !disabled;
    const canNext = page < totalPages && !disabled;

    return (
        <View style={styles.container}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Página anterior"
                style={[styles.cell, !canPrev && styles.cellDisabled]}
                disabled={!canPrev}
                onPress={() => onChange(page - 1)}>
                <Ionicons name="chevron-back" size={17} color={colors.text} />
            </Pressable>

            {pages.map((value) => {
                const active = value === page;
                return (
                    <Pressable
                        key={value}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        style={[styles.cell, active && styles.cellActive]}
                        disabled={disabled || active}
                        onPress={() => onChange(value)}>
                        <Text style={[styles.label, active && styles.labelActive]}>{value}</Text>
                    </Pressable>
                );
            })}

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Próxima página"
                style={[styles.cell, !canNext && styles.cellDisabled]}
                disabled={!canNext}
                onPress={() => onChange(page + 1)}>
                <Ionicons name="chevron-forward" size={17} color={colors.text} />
            </Pressable>
        </View>
    );
}

function makeStyles(c: ThemeColors) {
    return StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: space.sm,
            paddingVertical: space.xl,
        },
        cell: {
            minWidth: 38,
            height: 38,
            paddingHorizontal: space.sm,
            borderRadius: radius.sm,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.borderStrong,
        },
        cellActive: {
            backgroundColor: c.accent,
            borderColor: c.accent,
        },
        cellDisabled: {
            opacity: 0.4,
        },
        label: {
            fontSize: 14,
            fontWeight: '700',
            color: c.text,
        },
        labelActive: {
            color: c.onAccent,
        },
    });
}
