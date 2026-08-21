import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, TextInput, TextInputProps, View } from "react-native"
import { Colors } from "@/constants/colors";
import { styles } from "./styles";

type Props = TextInputProps & {
    placeholder: string;
    icon: keyof typeof Ionicons.glyphMap;
    isPassword?: boolean;
}

export function Input({ icon, isPassword, ...rest }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <View style={styles.wrapper}>
            <Ionicons name={icon} size={18} color={Colors.whiteAlpha['65']} />

            <TextInput
                style={styles.input}
                placeholderTextColor={Colors.whiteAlpha['50']}
                secureTextEntry={isPassword && !isVisible}
                {...rest}
            />

            {isPassword && (
                <Pressable onPress={() => setIsVisible((prev) => !prev)} hitSlop={8}>
                    <Ionicons
                        name={isVisible ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={Colors.whiteAlpha['65']}
                    />
                </Pressable>
            )}
        </View>
    )
}
