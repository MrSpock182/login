import { useEffect, useRef } from 'react';
import { Animated, DimensionValue, Easing, StyleProp, ViewStyle } from 'react-native';

import { radius as R } from '@/constants/store-theme';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
    width?: DimensionValue;
    height?: number;
    radius?: number;
    style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = '100%', height = 14, radius = R.sm, style }: Props) {
    const { colors } = useTheme();
    const pulse = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 650,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 0.4,
                    duration: 650,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [pulse]);

    return (
        <Animated.View
            style={[
                { width, height, borderRadius: radius, backgroundColor: colors.skeleton, opacity: pulse },
                style,
            ]}
        />
    );
}
