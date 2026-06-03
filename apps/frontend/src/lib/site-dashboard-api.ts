import {
  EMPTY_PRODUKSI_TREND,
  EMPTY_PRODUKSI_TREND_HIGHLIGHT,
  EMPTY_REHAP_DAS,
  EMPTY_STATUS_HISTORY,
  EMPTY_STATUS_HISTORY_MONTH_OPTIONS,
  EMPTY_TARGET_VS_REALISASI,
  type DailyRealization,
  type DailyTargetRealization,
  type MonthlyRealization,
  type MonthlyTargetRealization,
  type SiteDashboardKpi,
  type StatusHistoryMonthOption,
  type StatusHistoryRow,
  type TrendHighlight,
  type WeeklyRealization,
} from '../data/site-dashboard-dummy';
import {
  type DashboardSupervisorDetail,
  type DashboardTrendPoint,
  type ProductionRecord,
  fetchDashboardLandOpeningTrend,
  fetchDashboardProductionTrend,
  fetchDashboardReclamationTrend,
  fetchDashboardRehabDasTrend,
  fetchDashboardSupervisorDetail,
  listLandOpeningBySite,
  listProductionBySite,
  listReclamationBySite,
  listRehabDasBySite,
} from './cngr-api';
import { formatPercentDisplay } from './formatters';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'] as const;

const MONTH_LONG_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export const TREND_VIEW_OPTIONS = [
  { value: 'production', label: 'Produksi' },
  { value: 'land-opening', label: 'Bukaan Lahan' },
  { value: 'rehab-das', label: 'Rehab DAS' },
  { value: 'reclamation', label: 'Reklamasi' },
] as const;

export type TrendView = (typeof TREND_VIEW_OPTIONS)[number]['value'];

export const DASHBOARD_VIEW_OPTIONS = [
  { value: 'all', label: 'Semua' },
  ...TREND_VIEW_OPTIONS,
] as const;

export type DashboardViewSelection = (typeof DASHBOARD_VIEW_OPTIONS)[number]['value'];

export const TREND_VIEWS: TrendView[] = TREND_VIEW_OPTIONS.map((option) => option.value);

/** Primary chart color per category (realisasi line / realisasi bar). */
export const TREND_VIEW_LINE_COLORS: Record<TrendView, string> = {
  production: '#16A34A',
  'land-opening': '#DB2777',
  reclamation: '#EA580C',
  'rehab-das': '#2563EB',
};

/** Lighter shade for target bars in Target vs Realisasi charts. */
export const TREND_VIEW_TARGET_BAR_COLORS: Record<TrendView, string> = {
  production: '#86EFAC',
  'land-opening': '#F9A8D4',
  reclamation: '#FDBA74',
  'rehab-das': '#93C5FD',
};

const TREND_VIEW_UNIT = 'Ha';

export const TREND_VIEW_UNIT_SUFFIX: Record<TrendView, string> = {
  production: TREND_VIEW_UNIT,
  'land-opening': TREND_VIEW_UNIT,
  reclamation: TREND_VIEW_UNIT,
  'rehab-das': TREND_VIEW_UNIT,
};

const TREND_VIEW_LABEL_UNIT_SUFFIX: Record<string, string> = Object.fromEntries(
  TREND_VIEW_OPTIONS.map((option) => [option.label, TREND_VIEW_UNIT_SUFFIX[option.value]])
);

export function getUnitSuffixForCategoryLabel(categoryLabel: string): string {
  return TREND_VIEW_LABEL_UNIT_SUFFIX[categoryLabel] ?? '';
}

export function getUnitSuffixForTrendView(view: TrendView): string {
  return TREND_VIEW_UNIT_SUFFIX[view];
}

export function getUnitSuffixForKpiId(kpiId: string): string {
  for (const view of TREND_VIEWS) {
    if (kpiId === `${view}-target` || kpiId === `${view}-achieved`) {
      return TREND_VIEW_UNIT_SUFFIX[view];
    }
  }
  return '';
}

export type TrendViewBundle = {
  targetVsRealisasi: MonthlyTargetRealization[];
  realisasiTrend: MonthlyRealization[];
  realisasiTrendWeekly: WeeklyRealization[];
  realisasiTrendHighlight: TrendHighlight;
  realisasiTrendGranularity: 'month' | 'week';
  trendPoints: DashboardTrendPoint[];
  statusHistory: StatusHistoryRow[];
  statusHistoryMonthOptions: StatusHistoryMonthOption[];
  activityRows: ProductionRecord[];
};

function emptyTrendViewBundle(): TrendViewBundle {
  return {
    targetVsRealisasi: EMPTY_TARGET_VS_REALISASI,
    realisasiTrend: EMPTY_PRODUKSI_TREND,
    realisasiTrendWeekly: EMPTY_REHAP_DAS,
    realisasiTrendHighlight: EMPTY_PRODUKSI_TREND_HIGHLIGHT,
    realisasiTrendGranularity: 'month',
    trendPoints: [],
    statusHistory: EMPTY_STATUS_HISTORY,
    statusHistoryMonthOptions: EMPTY_STATUS_HISTORY_MONTH_OPTIONS,
    activityRows: [],
  };
}

const EMPTY_TREND_VIEWS: Record<TrendView, TrendViewBundle> = {
  production: emptyTrendViewBundle(),
  'land-opening': emptyTrendViewBundle(),
  'rehab-das': emptyTrendViewBundle(),
  reclamation: emptyTrendViewBundle(),
};

const KPI_STYLES: Record<string, Pick<SiteDashboardKpi, 'accent' | 'iconBg'>> = {
  target: {
    accent: '#2563EB',
    iconBg: 'color-mix(in srgb, #3B82F6 18%, #FFFFFF)',
  },
  production: {
    accent: '#16A34A',
    iconBg: 'color-mix(in srgb, #22C55E 18%, #FFFFFF)',
  },
  'land-opening': {
    accent: '#DB2777',
    iconBg: 'color-mix(in srgb, #EC4899 18%, #FFFFFF)',
  },
  reclamation: {
    accent: '#EA580C',
    iconBg: 'color-mix(in srgb, #F97316 18%, #FFFFFF)',
  },
  'rehab-das': {
    accent: '#2563EB',
    iconBg: 'color-mix(in srgb, #3B82F6 18%, #FFFFFF)',
  },
};

function sumTargetAndActual(activityRows: ProductionRecord[]): { totalTarget: number; totalActual: number } {
  return {
    totalTarget: activityRows.reduce((sum, row) => sum + row.target, 0),
    totalActual: activityRows.reduce((sum, row) => sum + row.realization, 0),
  };
}

export function getKpisForAllViews(trendViews: Record<TrendView, TrendViewBundle>): SiteDashboardKpi[] {
  return TREND_VIEWS.flatMap((view) => getKpisForTrendView(view, trendViews[view].activityRows));
}

export function collectDashboardYearOptions(
  trendViews: Record<TrendView, TrendViewBundle>
): StatusHistoryMonthOption[] {
  const years = new Set<number>();

  for (const view of TREND_VIEWS) {
    const bundle = trendViews[view];
    for (const row of bundle.activityRows) {
      const date = parseDate(row.date);
      if (date) {
        years.add(date.getFullYear());
      }
    }
    for (const point of bundle.trendPoints) {
      const date = parseDate(point.date);
      if (date) {
        years.add(date.getFullYear());
      }
    }
  }

  return [...years]
    .sort((a, b) => b - a)
    .map((year) => ({ value: String(year), label: String(year) }));
}

export function getCurrentCalendarYearString(): string {
  return String(new Date().getFullYear());
}

export function resolveDefaultDashboardYear(
  yearOptions: StatusHistoryMonthOption[],
  currentSelection = getCurrentCalendarYearString()
): string {
  if (currentSelection && yearOptions.some((option) => option.value === currentSelection)) {
    return currentSelection;
  }

  const currentYear = getCurrentCalendarYearString();
  if (yearOptions.some((option) => option.value === currentYear)) {
    return currentYear;
  }

  return yearOptions[0]?.value ?? currentYear;
}

function filterActivityRowsByYear(activityRows: ProductionRecord[], year: number): ProductionRecord[] {
  return activityRows.filter((row) => {
    const date = parseDate(row.date);
    return date?.getFullYear() === year;
  });
}

function filterTrendPointsByYear(points: DashboardTrendPoint[], year: number): DashboardTrendPoint[] {
  return points.filter((point) => {
    const date = parseDate(point.date);
    return date?.getFullYear() === year;
  });
}

export function getTrendViewBundleForYear(bundle: TrendViewBundle, year: number): TrendViewBundle {
  return buildTrendViewBundle(
    filterTrendPointsByYear(bundle.trendPoints, year),
    filterActivityRowsByYear(bundle.activityRows, year)
  );
}

export function getTrendViewsForYear(
  trendViews: Record<TrendView, TrendViewBundle>,
  year: number
): Record<TrendView, TrendViewBundle> {
  return {
    production: getTrendViewBundleForYear(trendViews.production, year),
    'land-opening': getTrendViewBundleForYear(trendViews['land-opening'], year),
    'rehab-das': getTrendViewBundleForYear(trendViews['rehab-das'], year),
    reclamation: getTrendViewBundleForYear(trendViews.reclamation, year),
  };
}

export function mergeAllStatusHistoryMonthOptions(
  trendViews: Record<TrendView, TrendViewBundle>
): StatusHistoryMonthOption[] {
  const seen = new Map<string, string>();

  for (const view of TREND_VIEWS) {
    for (const option of trendViews[view].statusHistoryMonthOptions) {
      if (!seen.has(option.value)) {
        seen.set(option.value, option.label);
      }
    }
  }

  return [...seen.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([value, label]) => ({ value, label }));
}

export type StatusHistoryRowWithCategory = StatusHistoryRow & { category: string };

export function getAllStatusHistoryRows(
  trendViews: Record<TrendView, TrendViewBundle>,
  monthValue: string
): StatusHistoryRowWithCategory[] {
  return TREND_VIEWS.flatMap((view) => {
    const category =
      TREND_VIEW_OPTIONS.find((option) => option.value === view)?.label ?? view;
    const rows = filterStatusHistoryByMonth(
      trendViews[view].statusHistory,
      trendViews[view].activityRows,
      monthValue
    );

    return rows.map((row) => ({ ...row, category }));
  });
}

export function getTrendViewLabel(view: TrendView): string {
  return TREND_VIEW_OPTIONS.find((option) => option.value === view)?.label ?? view;
}

export function getKpisForTrendView(view: TrendView, activityRows: ProductionRecord[]): SiteDashboardKpi[] {
  const { totalTarget, totalActual } = sumTargetAndActual(activityRows);
  const share = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;
  const categoryLabel = TREND_VIEW_OPTIONS.find((option) => option.value === view)?.label ?? 'kategori ini';
  const achievedStyle = KPI_STYLES[view] ?? KPI_STYLES.production;

  return [
    {
      id: `${view}-target`,
      title: `Total ${categoryLabel} Target`,
      value: totalTarget,
      footer: `Akumulasi target ${categoryLabel}`,
      ...KPI_STYLES.target,
    },
    {
      id: `${view}-achieved`,
      title: `Total ${categoryLabel} Tercapai`,
      value: totalActual,
      footer:
        totalTarget > 0
          ? `${formatPercentDisplay(share)} tercapai dari target`
          : `Belum ada realisasi ${categoryLabel}`,
      ...achievedStyle,
    },
  ];
}

export type SiteDashboardViewModel = {
  trendViews: Record<TrendView, TrendViewBundle>;
  supervisor: DashboardSupervisorDetail | undefined;
};

export const EMPTY_SITE_DASHBOARD: SiteDashboardViewModel = {
  trendViews: EMPTY_TREND_VIEWS,
  supervisor: undefined,
};

function parseDate(value: string): Date | undefined {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthShortLabel(date: Date): string {
  return MONTH_SHORT[date.getMonth()] ?? '—';
}

function formatStatusDate(date: Date): string {
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

function formatProductionHighlightLabel(date: Date): string {
  return `${date.getDate()} ${MONTH_LONG_ID[date.getMonth()]} ${date.getFullYear()}`;
}

function resolveChartYear(points: DashboardTrendPoint[]): number {
  let latest: Date | undefined;

  for (const point of points) {
    const date = parseDate(point.date);
    if (!date) {
      continue;
    }
    if (!latest || date > latest) {
      latest = date;
    }
  }

  return latest?.getFullYear() ?? new Date().getFullYear();
}

function aggregateMonthlyTargetRealization(points: DashboardTrendPoint[]): MonthlyTargetRealization[] {
  const year = resolveChartYear(points);
  const buckets = new Map<number, { target: number; realisasi: number }>();

  for (const point of points) {
    const date = parseDate(point.date);
    if (!date || date.getFullYear() !== year) {
      continue;
    }

    const monthIndex = date.getMonth();
    const bucket = buckets.get(monthIndex) ?? { target: 0, realisasi: 0 };
    bucket.target += point.target;
    bucket.realisasi += point.actual;
    buckets.set(monthIndex, bucket);
  }

  return MONTH_SHORT.map((month, monthIndex) => {
    const values = buckets.get(monthIndex);
    return {
      month,
      target: values?.target ?? 0,
      realisasi: values?.realisasi ?? 0,
    };
  });
}

function aggregateMonthlyRealization(points: DashboardTrendPoint[]): MonthlyRealization[] {
  return aggregateMonthlyTargetRealization(points).map(({ month, realisasi }) => ({
    month,
    realisasi,
  }));
}

function aggregateDailyForMonth(
  points: DashboardTrendPoint[],
  monthShort: string,
  pickValue: (point: DashboardTrendPoint) => number
): Map<number, number> {
  const monthIndex = MONTH_SHORT.indexOf(monthShort as (typeof MONTH_SHORT)[number]);
  const buckets = new Map<number, number>();
  if (monthIndex < 0) {
    return buckets;
  }

  const year = resolveChartYear(points);
  for (const point of points) {
    const date = parseDate(point.date);
    if (!date || date.getFullYear() !== year || date.getMonth() !== monthIndex) {
      continue;
    }

    const day = date.getDate();
    buckets.set(day, (buckets.get(day) ?? 0) + pickValue(point));
  }

  return buckets;
}

export function aggregateDailyRealizationForMonth(
  points: DashboardTrendPoint[],
  monthShort: string
): DailyRealization[] {
  const monthIndex = MONTH_SHORT.indexOf(monthShort as (typeof MONTH_SHORT)[number]);
  if (monthIndex < 0) {
    return [];
  }

  const year = resolveChartYear(points);
  const buckets = aggregateDailyForMonth(points, monthShort, (point) => point.actual);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return {
      day: String(day),
      realisasi: buckets.get(day) ?? 0,
    };
  });
}

export function aggregateDailyTargetRealizationForMonth(
  points: DashboardTrendPoint[],
  monthShort: string
): DailyTargetRealization[] {
  const monthIndex = MONTH_SHORT.indexOf(monthShort as (typeof MONTH_SHORT)[number]);
  if (monthIndex < 0) {
    return [];
  }

  const year = resolveChartYear(points);
  const targetBuckets = aggregateDailyForMonth(points, monthShort, (point) => point.target);
  const realisasiBuckets = aggregateDailyForMonth(points, monthShort, (point) => point.actual);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return {
      day: String(day),
      target: targetBuckets.get(day) ?? 0,
      realisasi: realisasiBuckets.get(day) ?? 0,
    };
  });
}

export function getMonthLongLabel(monthShort: string): string {
  const monthIndex = MONTH_SHORT.indexOf(monthShort as (typeof MONTH_SHORT)[number]);
  if (monthIndex < 0) {
    return monthShort;
  }
  return MONTH_LONG_ID[monthIndex] ?? monthShort;
}

function findMonthlyPeakHighlight(
  points: DashboardTrendPoint[],
  pickActual: boolean
): TrendHighlight {
  const year = resolveChartYear(points);
  let best: { date: Date; value: number; month: string } | undefined;

  for (const point of points) {
    const date = parseDate(point.date);
    if (!date || date.getFullYear() !== year) {
      continue;
    }

    const value = pickActual ? point.actual : point.target;
    if (value <= 0) {
      continue;
    }
    if (!best || value > best.value) {
      best = { date, value, month: monthShortLabel(date) };
    }
  }

  if (!best) {
    return EMPTY_PRODUKSI_TREND_HIGHLIGHT;
  }

  return {
    month: best.month,
    label: formatProductionHighlightLabel(best.date),
    value: best.value,
  };
}

function mapApiStatus(status: string): StatusHistoryRow['status'] {
  const normalized = status.trim().toUpperCase();
  if (normalized === 'GOOD') {
    return 'Good';
  }
  if (normalized === 'WARN' || normalized === 'WARNING') {
    return 'Warn';
  }
  return 'Danger';
}

function parseEfficiencyPercent(value: string): number {
  const digits = value.replace(/[^\d.]/g, '');
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function buildTrendViewBundle(
  trendPoints: DashboardTrendPoint[],
  activityRows: ProductionRecord[]
): TrendViewBundle {
  const { rows, monthOptions } = buildStatusHistory(activityRows);

  return {
    targetVsRealisasi: aggregateMonthlyTargetRealization(trendPoints),
    realisasiTrend: aggregateMonthlyRealization(trendPoints),
    realisasiTrendWeekly: [],
    realisasiTrendHighlight: findMonthlyPeakHighlight(trendPoints, true),
    realisasiTrendGranularity: 'month',
    trendPoints,
    statusHistory: rows,
    statusHistoryMonthOptions: monthOptions,
    activityRows,
  };
}

function buildStatusHistory(activityRows: ProductionRecord[]): {
  rows: StatusHistoryRow[];
  monthOptions: StatusHistoryMonthOption[];
} {
  const datedRows: { sortKey: string; row: StatusHistoryRow; monthValue: string }[] = [];

  for (const record of activityRows) {
    const date = parseDate(record.date);
    if (!date) {
      continue;
    }

    const monthValue = monthKey(date);
    datedRows.push({
      sortKey: date.toISOString(),
      monthValue,
      row: {
        date: formatStatusDate(date),
        target: record.target,
        realization: record.realization,
        efficiency: parseEfficiencyPercent(record.efficiency),
        status: mapApiStatus(record.status),
      },
    });
  }

  datedRows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  const monthLabels = new Map<string, string>();
  for (const entry of datedRows) {
    const date = parseDate(entry.sortKey);
    if (!date || monthLabels.has(entry.monthValue)) {
      continue;
    }
    monthLabels.set(
      entry.monthValue,
      `${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`
    );
  }

  const monthOptions = [...monthLabels.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([value, label]) => ({ value, label }));

  return {
    rows: datedRows.map((entry) => entry.row),
    monthOptions,
  };
}

export function filterStatusHistoryByMonth(
  rows: StatusHistoryRow[],
  activityRows: ProductionRecord[],
  monthValue: string
): StatusHistoryRow[] {
  if (!monthValue) {
    return rows;
  }

  const filtered: StatusHistoryRow[] = [];
  for (const record of activityRows) {
    const date = parseDate(record.date);
    if (!date || monthKey(date) !== monthValue) {
      continue;
    }

    filtered.push({
      date: formatStatusDate(date),
      target: record.target,
      realization: record.realization,
      efficiency: parseEfficiencyPercent(record.efficiency),
      status: mapApiStatus(record.status),
    });
  }

  return filtered;
}

export async function loadSiteDashboard(siteId: string): Promise<SiteDashboardViewModel> {
  const [
    productionTrend,
    landOpeningTrend,
    reclamationTrend,
    rehabDasTrend,
    supervisor,
    productionRows,
    landOpeningRows,
    reclamationRows,
    rehabDasRows,
  ] = await Promise.all([
    fetchDashboardProductionTrend(siteId),
    fetchDashboardLandOpeningTrend(siteId),
    fetchDashboardReclamationTrend(siteId),
    fetchDashboardRehabDasTrend(siteId),
    fetchDashboardSupervisorDetail(siteId),
    listProductionBySite(siteId),
    listLandOpeningBySite(siteId),
    listReclamationBySite(siteId),
    listRehabDasBySite(siteId),
  ]);

  const trendViews: Record<TrendView, TrendViewBundle> = {
    production: buildTrendViewBundle(productionTrend, productionRows),
    'land-opening': buildTrendViewBundle(landOpeningTrend, landOpeningRows),
    'rehab-das': buildTrendViewBundle(rehabDasTrend, rehabDasRows),
    reclamation: buildTrendViewBundle(reclamationTrend, reclamationRows),
  };

  return {
    trendViews,
    supervisor,
  };
}
