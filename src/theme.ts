// Umbra Design System - Modern Luxury (Neo-Egyptian)
// Midnight black, polished gold, glassmorphism, sleek gradients

export const colors = {
  // Backgrounds
  bg: '#000000',              // Pure Black
  bgElev1: '#050505',         // Subtly lighter black
  bgElev2: '#0A0A0A',         // Lighter still
  
  // Surfaces (Glass)
  surface: 'rgba(20, 20, 30, 0.6)',
  surface2: 'rgba(30, 30, 40, 0.7)',
  surface3: 'rgba(40, 40, 50, 0.8)',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  border2: 'rgba(255, 255, 255, 0.12)',
  stroke: 'rgba(212, 175, 55, 0.5)', // Gold stroke
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  textInverse: '#000000',
  
  // Accents (Gold Gradients)
  accent: '#D4AF37',          // Base Gold
  accentGradient: 'linear-gradient(135deg, #D4AF37 0%, #F5D058 100%)',
  accentHover: '#E5C048',
  accentContrast: '#000000',
  
  // Secondary (Digital Lapis)
  secondary: '#26619C',
  secondaryGradient: 'linear-gradient(135deg, #26619C 0%, #40E0D0 100%)',
  
  // Status
  success: '#00E096',
  warning: '#FFB900',
  danger: '#FF3B30',
  info: '#007AFF',
  
  // Status Light
  successLight: 'rgba(0, 224, 150, 0.15)',
  warningLight: 'rgba(255, 185, 0, 0.15)',
  dangerLight: 'rgba(255, 59, 48, 0.15)',
  infoLight: 'rgba(0, 122, 255, 0.15)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.8)',
  backdrop: 'blur(20px)',
};

export const radii = {
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  full: '999px',
};

export const shadows = {
  none: 'none',
  sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
  md: '0 8px 24px rgba(0, 0, 0, 0.4)',
  lg: '0 16px 48px rgba(0, 0, 0, 0.6)',
  glow: '0 0 20px rgba(212, 175, 55, 0.3)',
  glowSm: '0 0 10px rgba(212, 175, 55, 0.2)',
  glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', // Glassmorphism shadow
};

export const spacing = [4, 8, 12, 16, 24, 32, 40, 48, 64];
const sp = spacing;
export const space = {
  xs: sp[0],
  sm: sp[1],
  md: sp[2],
  base: sp[3],
  lg: sp[4],
  xl: sp[5],
  xxl: sp[6],
  xxxl: sp[7],
  huge: sp[8]
};

export const typography = {
  // Font families
  fontDisplay: '"Cinzel", serif',   // Minimal usage for big titles
  fontBody: '"Inter", sans-serif',  // Clean modern sans
  fontMono: '"JetBrains Mono", monospace',
  
  // Styles
  h1: {
    fontFamily: '"Cinzel", serif',
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.3',
    letterSpacing: '-0.03em',
  },
  h3: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '1.4',
  },
  
  body: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.6',
    color: '#A0A0A0',
  },
  bodySm: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.5',
    color: '#A0A0A0',
  },
  
  label: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  }
};

export const components = {
  button: {
    heightSm: '36px',
    heightMd: '48px',
    heightLg: '56px',
    radiusDefault: radii.full,
  },
  input: {
    height: '48px',
    radiusDefault: radii.md,
  },
  card: {
    radiusDefault: radii.lg,
  }
};

export const motion = {
  fast: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  normal: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  spring: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};
