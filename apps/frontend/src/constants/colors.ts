/**
 * Application color palette - reusable across components
 */
export const COLORS = {
  primary: '#EE252B',
  primaryHover: '#D91F25',

  /** Profile completion, success states */
  success: '#22C55E',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  textPrimary: '#000000',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Borders & backgrounds
  border: '#E5E7EB',
  borderLight: '#E5E7EB',
  background: '#FFFFFF',
  backgroundGray: '#F9FAFB',
  /** Unfocused text, select, and picker trigger fields */
  inputBackground: '#F8F8F8',

  // Sidebar
  sidebarBg: '#0a1628',
  sidebarText: '#FFFFFF',
  sidebarTextActive: '#FFFFFF',
  sidebarTextInactive: '#94A3B8',
  sidebarTextHover: '#CBD5E1',
  sidebarOverlay: 'rgba(0, 0, 0, 0.8)',
} as const;

export type ColorKey = keyof typeof COLORS;
