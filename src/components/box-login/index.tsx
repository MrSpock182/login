import { BlurView } from "expo-blur";
import { Image, Platform, useWindowDimensions, View, ViewProps } from "react-native";
import { styles } from "./styles";

type Props = ViewProps & {
    children: React.ReactNode;
}

const isWeb = Platform.OS === 'web';

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export function BoxLogin({ children, style, ...rest }: Props) {
    const { width, height } = useWindowDimensions();

    const boxSize = isWeb? 
        {
            width: clamp(width * 0.32, 380, 560),
            minHeight: clamp(height * 0.75, 750, 820),
        }: 
        {
            width: '92%' as const,
            minHeight: clamp(height * 0.7, 520, 680),
        };

    const contentPadding = isWeb? 
        {
            paddingVertical: clamp(height * 0.05, 32, 56),
            paddingHorizontal: clamp(width * 0.03, 28, 48),
        }: 
        {
            paddingVertical: 40,
            paddingHorizontal: 28,
        };

    return (
        <View style={[styles.box, boxSize, style]} {...rest}>
            <BlurView intensity={60} tint="dark" style={styles.fill} />

            <View style={[styles.inner, contentPadding]}>
                <Image
                    source={require('../../../assets/icone-login.png')}
                    style={styles.icon}
                    resizeMode="contain"
                />

                <View style={styles.content}>
                    {children}
                </View>
            </View>
        </View>
    )
}
