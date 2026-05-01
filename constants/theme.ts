// constants/theme.ts — FlightAdvsr global design system
export const Colors = {
  // Deep navy-slate — professional, global, trustworthy
  bg: '#080c14',
  bgCard: '#0e1420',
  bgCardAlt: '#131929',
  bgElevated: '#1a2235',

  border: 'rgba(148,163,184,0.1)',
  borderActive: 'rgba(99,179,237,0.45)',
  borderSubtle: 'rgba(148,163,184,0.06)',

  // Sky blue accent — flight, sky, trust
  accent: '#38bdf8',
  accentDark: '#0ea5e9',
  accentDeep: '#0284c7',
  accentLight: 'rgba(56,189,248,0.12)',

  // Text
  text: '#f0f6ff',
  textSub: 'rgba(186,210,240,0.65)',
  textMuted: 'rgba(148,175,210,0.38)',

  // Status
  success: '#34d399',
  successBg: 'rgba(52,211,153,0.09)',
  successBorder: 'rgba(52,211,153,0.22)',

  warning: '#fbbf24',
  warningBg: 'rgba(251,191,36,0.09)',
  warningBorder: 'rgba(251,191,36,0.28)',

  danger: '#f87171',
  dangerBg: 'rgba(248,113,113,0.09)',
  dangerBorder: 'rgba(248,113,113,0.28)',

  info: '#38bdf8',
  infoBg: 'rgba(56,189,248,0.09)',
  infoBorder: 'rgba(56,189,248,0.28)',
};

export const Fonts = {
  regular: 400 as const,
  medium: 500 as const,
  semibold: 600 as const,
  bold: 700 as const,
};
