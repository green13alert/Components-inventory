export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const;

export const Typography = {
  greeting: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  metadata: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  stat: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
} as const;
