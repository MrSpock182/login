import { Platform, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export const styles = StyleSheet.create({
    box: {
        maxWidth: 560,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: Colors.whiteAlpha['12'],
        backgroundColor: Colors.whiteAlpha['05'],
        overflow: 'hidden',
        elevation: 10,
        ...Platform.select({
            web: {
                boxShadow: `0px 12px 24px rgba(0, 0, 0, 0.35)`,
            },
            default: {
                shadowColor: Colors.black,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.35,
                shadowRadius: 24,
            },
        }),
    },
    fill: {
        ...StyleSheet.absoluteFillObject,
    },
    inner: {
        flex: 1,
        alignItems: 'center',
    },
    content: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 32,
        marginTop: 40,
        paddingBottom: 8,
    },
    icon: {
        width: 200,
        height: 200,
    },
});
