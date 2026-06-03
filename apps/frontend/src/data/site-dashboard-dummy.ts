/**
 * Types and presentation defaults for the site dashboard.
 * Data is loaded from the dashboard backend via `site-dashboard-api.ts`.
 */

export type SiteDashboardKpi = {
  id: string;
  title: string;
  value: number;
  footer: string;
  accent: string;
  iconBg: string;
};

export type MonthlyTargetRealization = {
  month: string;
  target: number;
  realisasi: number;
};

export type MonthlyRealization = {
  month: string;
  realisasi: number;
};

export type WeeklyRealization = {
  week: string;
  realisasi: number;
};

export type DailyRealization = {
  day: string;
  realisasi: number;
};

export type DailyTargetRealization = {
  day: string;
  target: number;
  realisasi: number;
};

export type StatusHistoryRow = {
  date: string;
  target: number;
  realization: number;
  efficiency: number;
  status: 'Good' | 'Warn' | 'Danger';
};

export type StatusHistoryMonthOption = {
  value: string;
  label: string;
};

export type TrendHighlight = {
  month?: string;
  week?: string;
  label: string;
  value: number;
};

export const EMPTY_SITE_DASHBOARD_KPIS: SiteDashboardKpi[] = [];

export const EMPTY_TARGET_VS_REALISASI: MonthlyTargetRealization[] = [];

export const EMPTY_PRODUKSI_TREND: MonthlyRealization[] = [];

export const EMPTY_BUKAAN_LAHAN: MonthlyTargetRealization[] = [];

export const EMPTY_REHAP_DAS: WeeklyRealization[] = [];

export const EMPTY_REKLAMASI: MonthlyTargetRealization[] = [];

export const EMPTY_STATUS_HISTORY: StatusHistoryRow[] = [];

export const EMPTY_STATUS_HISTORY_MONTH_OPTIONS: StatusHistoryMonthOption[] = [];

export const EMPTY_PRODUKSI_TREND_HIGHLIGHT: TrendHighlight = {
  month: '',
  label: '',
  value: 0,
};

export const EMPTY_REHAP_DAS_HIGHLIGHT: TrendHighlight = {
  week: '',
  label: '',
  value: 0,
};
