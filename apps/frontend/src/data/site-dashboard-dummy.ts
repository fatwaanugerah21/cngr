/**
 * Dummy data for site dashboard — replace with API when backend is ready.
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

export type StatusHistoryRow = {
  date: string;
  efficiency: number;
  status: 'Good' | 'Warn' | 'Danger';
};

export const SITE_DASHBOARD_KPIS: SiteDashboardKpi[] = [
  {
    id: 'target',
    title: 'Total Target',
    value: 24_000,
    footer: 'Akumulasi Target tahun ini',
    accent: '#2563EB',
    iconBg: 'color-mix(in srgb, #3B82F6 18%, #FFFFFF)',
  },
  {
    id: 'production',
    title: 'Total Produksi',
    value: 12_000,
    footer: '50% produksi tercapai dari target',
    accent: '#16A34A',
    iconBg: 'color-mix(in srgb, #22C55E 18%, #FFFFFF)',
  },
  {
    id: 'land-opening',
    title: 'Total Bukaan Lahan',
    value: 160,
    footer: 'Total bukaan Lahan tercapai',
    accent: '#DB2777',
    iconBg: 'color-mix(in srgb, #EC4899 18%, #FFFFFF)',
  },
  {
    id: 'reclamation',
    title: 'Total Reklamasi',
    value: 12_000,
    footer: '50% produksi tercapai dari target',
    accent: '#EA580C',
    iconBg: 'color-mix(in srgb, #F97316 18%, #FFFFFF)',
  },
];

export const TARGET_VS_REALISASI: MonthlyTargetRealization[] = [
  { month: 'Jan', target: 42, realisasi: 38 },
  { month: 'Feb', target: 48, realisasi: 44 },
  { month: 'Mar', target: 55, realisasi: 52 },
  { month: 'Apr', target: 50, realisasi: 47 },
  { month: 'Mei', target: 62, realisasi: 58 },
  { month: 'Jun', target: 58, realisasi: 61 },
  { month: 'Jul', target: 70, realisasi: 68 },
  { month: 'Agu', target: 65, realisasi: 72 },
  { month: 'Sep', target: 68, realisasi: 64 },
  { month: 'Okt', target: 74, realisasi: 78 },
  { month: 'Nov', target: 80, realisasi: 76 },
  { month: 'Des', target: 85, realisasi: 88 },
];

export const PRODUKSI_TREND: MonthlyRealization[] = [
  { month: 'Jan', realisasi: 32 },
  { month: 'Feb', realisasi: 38 },
  { month: 'Mar', realisasi: 45 },
  { month: 'Apr', realisasi: 41 },
  { month: 'Mei', realisasi: 52 },
  { month: 'Jun', realisasi: 48 },
  { month: 'Jul', realisasi: 77.5 },
  { month: 'Agu', realisasi: 62 },
  { month: 'Sep', realisasi: 58 },
  { month: 'Okt', realisasi: 65 },
  { month: 'Nov', realisasi: 72 },
  { month: 'Des', realisasi: 78 },
];

export const BUKAAN_LAHAN: MonthlyTargetRealization[] = [
  { month: 'Jan', target: 35, realisasi: 28 },
  { month: 'Feb', target: 40, realisasi: 36 },
  { month: 'Mar', target: 48, realisasi: 44 },
  { month: 'Apr', target: 42, realisasi: 40 },
  { month: 'Mei', target: 55, realisasi: 50 },
  { month: 'Jun', target: 50, realisasi: 54 },
  { month: 'Jul', target: 62, realisasi: 58 },
  { month: 'Agu', target: 58, realisasi: 64 },
  { month: 'Sep', target: 54, realisasi: 52 },
  { month: 'Okt', target: 60, realisasi: 66 },
  { month: 'Nov', target: 68, realisasi: 62 },
  { month: 'Des', target: 72, realisasi: 70 },
];

export const REHAP_DAS: WeeklyRealization[] = [
  { week: 'W1-Jan', realisasi: 28 },
  { week: 'W2-Jan', realisasi: 34 },
  { week: 'W3-Jan', realisasi: 31 },
  { week: 'W4-Jan', realisasi: 38 },
  { week: 'W1-Feb', realisasi: 42 },
  { week: 'W2-Feb', realisasi: 48 },
  { week: 'W3-Feb', realisasi: 44 },
  { week: 'W4-Feb', realisasi: 62.5 },
  { week: 'W1-Mar', realisasi: 55 },
  { week: 'W2-Mar', realisasi: 58 },
];

export const REKLAMASI: MonthlyTargetRealization[] = [
  { month: 'Jan', target: 30, realisasi: 25 },
  { month: 'Feb', target: 36, realisasi: 32 },
  { month: 'Mar', target: 44, realisasi: 40 },
  { month: 'Apr', target: 38, realisasi: 36 },
  { month: 'Mei', target: 50, realisasi: 46 },
  { month: 'Jun', target: 46, realisasi: 50 },
  { month: 'Jul', target: 58, realisasi: 54 },
  { month: 'Agu', target: 54, realisasi: 60 },
  { month: 'Sep', target: 50, realisasi: 48 },
  { month: 'Okt', target: 56, realisasi: 62 },
  { month: 'Nov', target: 64, realisasi: 58 },
  { month: 'Des', target: 68, realisasi: 66 },
];

export const STATUS_HISTORY: StatusHistoryRow[] = [
  { date: '1 Apr 2026', efficiency: 50, status: 'Good' },
  { date: '2 Apr 2026', efficiency: 50, status: 'Warn' },
  { date: '3 Apr 2026', efficiency: 50, status: 'Danger' },
  { date: '4 Apr 2026', efficiency: 50, status: 'Good' },
  { date: '5 Apr 2026', efficiency: 50, status: 'Warn' },
  { date: '6 Apr 2026', efficiency: 50, status: 'Danger' },
  { date: '7 Apr 2026', efficiency: 50, status: 'Good' },
];

export const STATUS_HISTORY_MONTH_OPTIONS = [
  { value: '2026-01', label: 'Jan 2026' },
  { value: '2026-02', label: 'Feb 2026' },
  { value: '2026-03', label: 'Mar 2026' },
  { value: '2026-04', label: 'Apr 2026' },
];

export const PRODUKSI_TREND_HIGHLIGHT = {
  month: 'Jul',
  label: '28 Jul 2026',
  value: 77.5,
};

export const REHAP_DAS_HIGHLIGHT = {
  week: 'W4-Feb',
  label: 'Week 4 - Februari',
  value: 62.5,
};
