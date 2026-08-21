import { Platform, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
    button: {
        width: '100%',
        height: isWeb ? 52 : 48,
        borderRadius: 30,
        backgroundColor: Colors.pokeballRed,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {
        opacity: 0.85,
    },
    disabled: {
        opacity: 0.5,
    },
    title: {
        color: Colors.white,
        fontSize: isWeb ? 16 : 15,
        fontWeight: '700',
    },
});
