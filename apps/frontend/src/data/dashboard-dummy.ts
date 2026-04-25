/**
 * Dummy data for Dashboard - replace with API data when backend is ready
 */

export interface KpiCardData {
  title: string;
  target: number;
  realisasi: number;
  /** Realtime MW value displayed in gauge center (e.g. "107.29") */
  realtimeMw?: string;
  /** Gauge color variant: green (default) or orange for target segment */
  variant?: 'green' | 'orange';
}

export interface MonthlyChartData {
  month: string;
  dataA: number;
  dataB: number;
}

/** KPI Cards - Realtime MW (gauge derived from target & realisasi) */
export const KPI_KORPORASI: KpiCardData = {
  title: 'MW real-time Korporasi',
  target: 441_000,
  realisasi: 139_000,
  realtimeMw: '107.29',
  variant: 'green',
};

export const KPI_PATUHA: KpiCardData = {
  title: 'MW real-time Patuha',
  target: 441_000,
  realisasi: 139_000,
  realtimeMw: '47.05',
  variant: 'orange',
};

/** Produksi GWh Patuha - monthly bar chart (Indonesian month labels) */
export const PRODUKSI_PATUHA: MonthlyChartData[] = [
  { month: 'Jan', dataA: 45, dataB: 65 },
  { month: 'Feb', dataA: 52, dataB: 58 },
  { month: 'Mar', dataA: 61, dataB: 72 },
  { month: 'Apr', dataA: 55, dataB: 68 },
  { month: 'Mei', dataA: 70, dataB: 75 },
  { month: 'Jun', dataA: 65, dataB: 80 },
  { month: 'Jul', dataA: 78, dataB: 85 },
  { month: 'Agu', dataA: 72, dataB: 78 },
  { month: 'Sep', dataA: 68, dataB: 82 },
  { month: 'Okt', dataA: 75, dataB: 88 },
  { month: 'Nov', dataA: 82, dataB: 90 },
  { month: 'Des', dataA: 88, dataB: 95 },
];

/** Produksi GWh Dieng - monthly bar chart (Indonesian month labels) */
export const PRODUKSI_DIENG: MonthlyChartData[] = [
  { month: 'Jan', dataA: 35, dataB: 55 },
  { month: 'Feb', dataA: 42, dataB: 48 },
  { month: 'Mar', dataA: 51, dataB: 62 },
  { month: 'Apr', dataA: 45, dataB: 58 },
  { month: 'Mei', dataA: 60, dataB: 65 },
  { month: 'Jun', dataA: 55, dataB: 70 },
  { month: 'Jul', dataA: 68, dataB: 75 },
  { month: 'Agu', dataA: 62, dataB: 68 },
  { month: 'Sep', dataA: 58, dataB: 72 },
  { month: 'Okt', dataA: 65, dataB: 78 },
  { month: 'Nov', dataA: 72, dataB: 80 },
  { month: 'Des', dataA: 78, dataB: 85 },
];

/** Pembangkitan listrik 2021 - placeholder untuk grafik mendatang */
export const POWER_GENERATION_2021: MonthlyChartData[] = [
  { month: 'Jan', dataA: 0, dataB: 0 },
  { month: 'Feb', dataA: 0, dataB: 0 },
  { month: 'Mar', dataA: 0, dataB: 0 },
  { month: 'Apr', dataA: 0, dataB: 0 },
  { month: 'Mei', dataA: 0, dataB: 0 },
  { month: 'Jun', dataA: 0, dataB: 0 },
  { month: 'Jul', dataA: 0, dataB: 0 },
  { month: 'Agu', dataA: 0, dataB: 0 },
  { month: 'Sep', dataA: 0, dataB: 0 },
  { month: 'Okt', dataA: 0, dataB: 0 },
  { month: 'Nov', dataA: 0, dataB: 0 },
  { month: 'Des', dataA: 0, dataB: 0 },
];
