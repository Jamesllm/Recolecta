// Tokens de diseño tomados del sistema de diseño de Recolecta+ en Figma
import type { ReportStatus } from './api';

export const colors = {
  primary: '#059669',
  primaryDark: '#047857',
  primaryTint: '#ECFDF5',
  ink: '#0F172A',
  text: '#334155',
  muted: '#64748B',
  border: '#E2E8F0',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  danger: '#DC2626',
  dangerTint: '#FEF2F2',
  warning: '#D97706',
  warningTint: '#FFFBEB',
  info: '#2563EB',
  infoTint: '#EFF6FF',
};

export const statusColor: Record<ReportStatus, { fg: string; bg: string }> = {
  pending: { fg: colors.warning, bg: colors.warningTint },
  assigned: { fg: colors.info, bg: colors.infoTint },
  resolved: { fg: colors.primary, bg: colors.primaryTint },
};

export const radius = { sm: 10, md: 14, lg: 20, pill: 999 };
