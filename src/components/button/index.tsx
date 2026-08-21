import { Pressable, PressableProps, Text } from "react-native";
import { styles } from "./styles";

type Props = PressableProps & {
    title: string;
}

export function Button({ title, style, disabled, ...rest }: Props) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                disabled && styles.disabled,
                style as any,
            ]}
            disabled={disabled}
            {...rest}>
            <Text style={styles.title}>{title}</Text>
        </Pressable>
    )
}
