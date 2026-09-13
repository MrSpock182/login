// ---------------------------------------------------------------------------
// Design system da Loja Fatec
// ---------------------------------------------------------------------------
// Princípios aplicados:
//  - Cor com disciplina (regra 60/30/10): ~90% neutros, o vinho institucional
//    da Fatec só em marca e ações primárias, verde/vermelho só para status.
//  - Contraste AA: texto forte >= 7:1, texto secundário >= 4.5:1.
//  - Canvas nunca é branco puro em área grande (reduz fadiga visual);
//    profundidade vem de camadas + sombra sutil, não de bordas pesadas.
//  - Escala de espaçamento e tipografia fixas para ritmo consistente.

export type ThemeName = 'light' | 'dark';

export interface ThemeColors {
    canvas: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    borderStrong: string;

    textStrong: string;
    text: string;
    textMuted: string;
    textFaint: string;

    // Barra superior / identidade Fatec (igual nos dois temas)
    header: string;
    onHeader: string;

    brand: string;
    brandSoft: string;

    accent: string;
    accentHover: string;
    onAccent: string;

    link: string;

    price: string;
    success: string;
    successSoft: string;
    danger: string;
    dangerSoft: string;
    warning: string;
    warningSoft: string;
    star: string;

    skeleton: string;
    overlay: string;
    shadow: string;
}

const FATEC_HEADER = '#7C1325';

export const LightTheme: ThemeColors = {
    canvas: '#F1F2F4',
    surface: '#FFFFFF',
    surfaceMuted: '#F5F6F8',
    border: '#E4E7EB',
    borderStrong: '#D2D7DD',

    textStrong: '#1B1F24',
    text: '#3D444C',
    textMuted: '#6C747D',
    textFaint: '#98A0A8',

    header: FATEC_HEADER,
    onHeader: '#FFFFFF',

    brand: '#98182E',
    brandSoft: '#F6E7EA',

    accent: '#98182E',
    accentHover: '#7C1325',
    onAccent: '#FFFFFF',

    link: '#1F63D6',

    price: '#1B1F24',
    success: '#187741',
    successSoft: '#E4F1E9',
    danger: '#C02A2A',
    dangerSoft: '#FBE9E9',
    warning: '#8A6100',
    warningSoft: '#FBEFD3',
    star: '#E0A32E',

    skeleton: '#E7EAED',
    overlay: 'rgba(16,24,40,0.45)',
    shadow: '#101828',
};

export const DarkTheme: ThemeColors = {
    canvas: '#141618',
    surface: '#1D2023',
    surfaceMuted: '#24282C',
    border: '#2C3136',
    borderStrong: '#3B4148',

    textStrong: '#F3F5F7',
    text: '#CED3D9',
    textMuted: '#98A0A8',
    textFaint: '#6B747D',

    header: FATEC_HEADER,
    onHeader: '#FFFFFF',

    brand: '#E36A80',
    brandSoft: '#33232A',

    accent: '#B23350',
    accentHover: '#C7455C',
    onAccent: '#FFFFFF',

    link: '#5EA0FF',

    price: '#F3F5F7',
    success: '#54C888',
    successSoft: '#16301F',
    danger: '#EF9490',
    dangerSoft: '#3A1E1D',
    warning: '#E4B24E',
    warningSoft: '#33280F',
    star: '#EBB44B',

    skeleton: '#2A2F34',
    overlay: 'rgba(0,0,0,0.55)',
    shadow: '#000000',
};

export const themes: Record<ThemeName, ThemeColors> = {
    light: LightTheme,
    dark: DarkTheme,
};

// Escala de espaçamento (base 4)
export const space = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
} as const;

export const elevation = (colors: ThemeColors, level: 1 | 2 | 3) => {
    const presets = {
        1: { height: 1, radius: 3, opacity: 0.1 },
        2: { height: 4, radius: 10, opacity: 0.12 },
        3: { height: 10, radius: 24, opacity: 0.16 },
    } as const;
    const p = presets[level];
    return {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: p.height },
        shadowOpacity: p.opacity,
        shadowRadius: p.radius,
        elevation: level * 2,
    };
};
