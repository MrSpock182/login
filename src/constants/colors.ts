export const Colors = {
  white: '#FFFFFF',
  black: '#000000',
  background: '#080808',
  surface: '#111111',

  surfaceDeep: '#060606',
  surfaceAlt: '#141414',
  surfaceCard: '#1C1C1C',
  surfaceHighlight: '#2A2A2A',

  btnPrimary: '#FF6B35',
  labelPrimary: '#FFFFFF',
  txtPrimary: '#FFFFFF',

  overlayDark: 'rgba(0,0,0,0.65)',
  pokeballRed: '#FF1C1C',

  game: {
    win:  '#4ADE80',
    loss: '#F87171',
  },

  semantic: {
    error:   { bg: '#2a0800', border: '#FF6B35', text: '#FF6B35' },
    success: { bg: '#001a00', border: '#66BB6A', text: '#66BB6A' },
    warning: { bg: '#1a1400', border: '#FFD600', text: '#FFD600' },
    info:    { bg: '#00091a', border: '#4FC3F7', text: '#4FC3F7' },
  },

  gray: {
    100: '#F2F2F2',
    500: '#999999',
    800: '#333333',
  },

  whiteAlpha: {
    '05': 'rgba(255,255,255,0.05)',
    '06': 'rgba(255,255,255,0.06)',
    '07': 'rgba(255,255,255,0.07)',
    '08': 'rgba(255,255,255,0.08)',
    '12': 'rgba(255,255,255,0.12)',
    '30': 'rgba(255,255,255,0.30)',
    '35': 'rgba(255,255,255,0.35)',
    '40': 'rgba(255,255,255,0.40)',
    '45': 'rgba(255,255,255,0.45)',
    '50': 'rgba(255,255,255,0.50)',
    '55': 'rgba(255,255,255,0.55)',
    '65': 'rgba(255,255,255,0.65)',
  },

  primaryAlpha: {
    '18': 'rgba(255,107,53,0.18)',
    '25': 'rgba(255,107,53,0.25)',
    '30': 'rgba(255,107,53,0.30)',
    '60': 'rgba(255,107,53,0.60)',
  },
} as const;
