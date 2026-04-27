// Design tokens do Kinetic Layer Design System — VaptVupt
// Paleta de cores, tipografia, espaçamentos e estilos de componentes

export const colors = {
  // ========================
  // SUPERFÍCIES (sem bordas — hierarquia por cor)
  // ========================
  baseSurface: "#eeeeee",
  surfaceLowest: "#ffffff",
  surfaceLow: "#fcfcfc",
  surface: "#f5f5f5",
  surfaceHigh: "#eeeeee",
  surfaceHighest: "#e8e8e8",

  // ========================
  // MARCA — AÇÃO (laranja)
  // ========================
  primary: "#ad2c00",
  primaryContainer: "#d83900",
  primaryLight: "#ff5722",
  onPrimary: "#ffffff",

  // ========================
  // MARCA — CONFIANÇA (azul)
  // ========================
  secondary: "#0058bc",
  secondaryLight: "#1976d2",
  onSecondary: "#ffffff",

  // ========================
  // TEXTO
  // ========================
  onSurface: "#1a1c1c",
  onSurfaceVariant: "#4a4a4a",
  onSurfaceMuted: "#8a8a8a",
  onSurfacePlaceholder: "#b0b0b0",

  // ========================
  // STATUS
  // ========================
  success: "#2e7d32",
  warning: "#f57c00",
  error: "#c62828",
  errorLight: "#ffebee",

  // ========================
  // GLASSMORFISMO
  // ========================
  glass: "rgba(255, 255, 255, 0.85)",
  glassStrong: "rgba(255, 255, 255, 0.92)",
  glassDark: "rgba(26, 28, 28, 0.7)",

  // ========================
  // OVERLAY DO MAPA
  // ========================
  mapOverlay: "rgba(249, 249, 249, 0.95)",
  transparent: "transparent",
} as const;

export const gradients = {
  // CTA principal — laranja tátil 135°
  primary: ["#ad2c00", "#d83900"] as [string, string],
  primaryLight: ["#d83900", "#ff5722"] as [string, string],

  // Fundo de onboarding (top suave)
  onboardingTop: ["#fff5f2", "#ffffff"] as [string, string],

  // Card verificado
  verified: ["#0058bc", "#1976d2"] as [string, string],
} as const;

export const typography = {
  // Família (fontes carregadas no _layout.tsx)
  display: "Jakarta-Bold",         // Headlines grandes (Manrope equivalente com Jakarta)
  headline: "Jakarta-SemiBold",
  title: "Jakarta-Medium",
  body: "Jakarta",                  // Inter equivalente
  bodyBold: "Jakarta-Bold",
  label: "Jakarta-Medium",
  caption: "Jakarta-Light",

  // Tamanhos
  sizes: {
    display: 32,
    headline: 24,
    titleLg: 20,
    titleMd: 18,
    titleSm: 16,
    bodyLg: 16,
    bodyMd: 14,
    bodySm: 13,
    label: 12,
    caption: 11,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  // Sombra ambiente suave (não heavy)
  card: {
    shadowColor: "#1a1c1c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  // Floating action buttons / pinos de mapa
  float: {
    shadowColor: "#1a1c1c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const theme = {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
} as const;

export type Theme = typeof theme;
