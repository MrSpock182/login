import { Platform, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        height: isWeb ? 52 : 48,
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: Colors.whiteAlpha['12'],
        backgroundColor: Colors.whiteAlpha['30'],
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: isWeb ? 15 : 14,
        color: Colors.white,
        ...Platform.select({
            web: {
                outlineColor: Colors.btnPrimary,
            } as any,
        }),
    },
});
