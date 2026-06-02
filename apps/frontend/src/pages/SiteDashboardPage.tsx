import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BarRectangleItem } from 'recharts';
import mainImage from '../assets/main-image.jpg';
import { FormSelectField, type FormSelectOption } from '../components/forms';
import { Button, ConfirmationModalComponent } from '../components/ui';
import { COLORS } from '../constants/colors';
import { type SiteDashboardKpi, type StatusHistoryRow } from '../data/site-dashboard-dummy';
import { useAuth } from '../lib/auth-context';
import { deleteSite, fetchSiteDetail } from '../lib/cngr-api';
import type { SiteRecord } from '../data/sites-dummy';
import SupervisorNoSiteBlockedContent from '../components/layout/SupervisorNoSiteBlockedContent';
import {
  hasAdminAccess,
  isSupervisorWithoutAssignedSite,
  resolveSelectedSiteDisplayName,
} from '../lib/navigation-session';
import {
  DASHBOARD_VIEW_OPTIONS,
  EMPTY_SITE_DASHBOARD,
  filterStatusHistoryByMonth,
  getAllStatusHistoryRows,
  getKpisForAllViews,
  getKpisForTrendView,
  aggregateDailyRealizationForMonth,
  aggregateDailyTargetRealizationForMonth,
  getMonthLongLabel,
  getTrendViewLabel,
  loadSiteDashboard,
  mergeAllStatusHistoryMonthOptions,
  TREND_VIEW_LINE_COLORS,
  TREND_VIEW_TARGET_BAR_COLORS,
  TREND_VIEWS,
  type DashboardViewSelection,
  type StatusHistoryRowWithCategory,
  type TrendView,
  type TrendViewBundle,
} from '../lib/site-dashboard-api';
import { formatNumberDisplay, formatPercentDisplay } from '../lib/formatters';
import { useSite } from '../lib/site-context';

function chartAxisTickFormatter(value: number): string {
  return formatNumberDisplay(value);
}

function chartYAxisMax(values: number[]): number {
  const max = values.reduce((highest, value) => Math.max(highest, value), 0);
  if (max <= 0) {
    return 100;
  }
  const padded = Math.ceil(max * 1.1);
  return padded < 10 ? 10 : padded;
}

const BAR_CHART_MARGIN = { top: 12, right: 12, left: 4, bottom: 4 };
const LINE_CHART_MARGIN = { top: 12, right: 16, left: 4, bottom: 8 };
const CHART_CONTAINER_CLASS = 'recharts-no-focus-outline';

const CHART_SURFACE_PROPS = {
  style: { outline: 'none' },
  tabIndex: -1 as const,
};

function ChartContainer({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={`${CHART_CONTAINER_CLASS} ${className}`}>{children}</div>;
}

function DashboardCard({
  title,
  children,
  headerRight,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-5 shadow-sm ${className}`}
      style={{ borderColor: COLORS.border, backgroundColor: COLORS.white }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
          {title}
        </h3>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function SiteOverviewDivider({ className = '' }: { className?: string }) {
  return <div className={`shrink-0 ${className}`} style={{ backgroundColor: COLORS.border }} aria-hidden />;
}

function SiteOverviewCard({
  siteName,
  province,
  location,
  siteStatusLabel,
  siteStatusColor,
  supervisorName,
  supervisorPosition,
  supervisorNik,
  supervisorAvatar,
  supervisorInitials,
  showDeleteAction,
  deleteDisabled,
  onDeleteClick,
}: {
  siteName: string;
  province: string;
  location: string;
  siteStatusLabel: string;
  siteStatusColor: string;
  supervisorName: string;
  supervisorPosition: string;
  supervisorNik: string;
  supervisorAvatar?: string;
  supervisorInitials: string;
  showDeleteAction: boolean;
  deleteDisabled: boolean;
  onDeleteClick: () => void;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border shadow-sm"
      style={{ borderColor: COLORS.border, backgroundColor: COLORS.white }}
    >
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #2563EB 0%, #0a1628 100%)' }}
        aria-hidden
      />

      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:gap-6 lg:p-6">
        <div className="flex min-w-0 flex-1 items-start justify-between gap-3 lg:max-w-[220px] lg:flex-col lg:items-start lg:justify-center xl:max-w-[260px]">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: COLORS.textMuted }}>
              Site
            </p>
            <h3 className="mt-1 text-base font-bold leading-snug" style={{ color: '#2563EB' }}>
              {siteName}
            </h3>
          </div>
          <span
            className="inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
            style={{
              color: siteStatusColor,
              borderColor: `color-mix(in srgb, ${siteStatusColor} 28%, #FFFFFF)`,
              backgroundColor: `color-mix(in srgb, ${siteStatusColor} 12%, #FFFFFF)`,
            }}
          >
            {siteStatusLabel}
          </span>
        </div>

        <SiteOverviewDivider className="h-px w-full lg:h-auto lg:w-px lg:self-stretch" />

        <div className="grid min-w-0 flex-[1.4] grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <div className="min-w-0">
            <p className="text-[11px] font-medium" style={{ color: COLORS.textMuted }}>
              Province
            </p>
            <p className="mt-1 text-sm font-medium" style={{ color: COLORS.textPrimary }}>
              {province}
            </p>
          </div>
          <div className="min-w-0 sm:border-l sm:pl-6" style={{ borderColor: COLORS.border }}>
            <p className="text-[11px] font-medium" style={{ color: COLORS.textMuted }}>
              Location
            </p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: COLORS.textPrimary }}>
              {location}
            </p>
          </div>
        </div>

        <SiteOverviewDivider className="h-px w-full lg:h-auto lg:w-px lg:self-stretch" />

        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold"
            style={{
              backgroundColor: COLORS.backgroundGray,
              color: COLORS.textSecondary,
              boxShadow: `0 0 0 1px ${COLORS.border}`,
            }}
          >
            {supervisorAvatar ? (
              <img src={supervisorAvatar} alt="" className="h-full w-full object-cover" />
            ) : (
              supervisorInitials
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: COLORS.textMuted }}>
              Supervisor
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
              {supervisorName}
            </p>
            <p className="truncate text-xs" style={{ color: COLORS.textSecondary }}>
              {supervisorPosition}
            </p>
            <p className="mt-1 text-[11px] font-medium tabular-nums" style={{ color: COLORS.textMuted }}>
              NIK {supervisorNik}
            </p>
          </div>
        </div>

        {showDeleteAction ? (
          <>
            <SiteOverviewDivider className="h-px w-full lg:h-auto lg:w-px lg:self-stretch" />
            <div className="flex shrink-0 lg:pl-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-10 w-full whitespace-nowrap sm:w-auto"
                disabled={deleteDisabled}
                onClick={onDeleteClick}
                style={{ color: '#DC2626', borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}
              >
                Hapus Site
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function KpiIcon({ id, color }: { id: string; color: string }) {
  if (id === 'target' || id.endsWith('-target')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.75" />
        <circle cx="12" cy="12" r="3" fill={color} />
        <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === 'production') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 4h12v16H6V4zM9 8h6M9 12h6M9 16h4"
          stroke={color}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="4" width="10" height="14" rx="1.5" stroke={color} strokeWidth="1.75" />
      <rect x="9" y="6" width="10" height="14" rx="1.5" stroke={color} strokeWidth="1.75" />
    </svg>
  );
}

function SummaryKpiCard({ kpi }: { kpi: SiteDashboardKpi }) {
  return (
    <div
      className="flex flex-col rounded-xl border p-5 shadow-sm"
      style={{ borderColor: COLORS.border, backgroundColor: COLORS.white }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: kpi.iconBg }}
        >
          <KpiIcon id={kpi.id} color={kpi.accent} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium" style={{ color: COLORS.textSecondary }}>
            {kpi.title}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight" style={{ color: COLORS.textPrimary }}>
            {formatNumberDisplay(kpi.value)}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs font-medium" style={{ color: kpi.accent }}>
        {kpi.footer}
      </p>
    </div>
  );
}

function statusDotColor(status: StatusHistoryRow['status']): string {
  if (status === 'Good') return '#22C55E';
  if (status === 'Warn') return '#F59E0B';
  return '#EF4444';
}

function SiteDashboardHero({
  siteName,
  showNoSiteMessage = false,
}: {
  siteName: string;
  showNoSiteMessage?: boolean;
}) {
  const { user } = useAuth();
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Akun pengguna'
    : 'Pengguna';
  const roleLabel = (user?.role ?? '').toLowerCase();

  return (
    <div className="relative overflow-hidden">
      <img src={mainImage} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)' }} />
      <div className="relative flex flex-col gap-6 px-8 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-white">
            {showNoSiteMessage ? 'Dashboard' : `Dashboard ${siteName}`}
          </h1>
          {showNoSiteMessage ? (
            <p
              className="mt-4 inline-block rounded-lg px-4 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
              role="status"
            >
              Anda tidak memiliki site
            </p>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Selamat datang di menu dashboard {siteName.toLowerCase()}, Anda dapat melakukan monitoring data
              dashboard {siteName.toLowerCase()} site
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              displayName.charAt(0)
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs text-white/70">{roleLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-sm"
      style={{ borderColor: COLORS.border, backgroundColor: COLORS.white }}
    >
      <p className="mb-1 font-semibold" style={{ color: COLORS.textPrimary }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color ?? COLORS.textSecondary }}>
          {entry.name}:{' '}
          {formatNumberDisplay(typeof entry.value === 'number' ? entry.value : Number(entry.value))}
        </p>
      ))}
    </div>
  );
}

function StatusHistoryTable({
  rows,
  showCategory,
}: {
  rows: StatusHistoryRow[] | StatusHistoryRowWithCategory[];
  showCategory?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[240px] text-left text-xs">
        <thead>
          <tr style={{ color: COLORS.textMuted }}>
            {showCategory ? <th className="pb-3 font-medium">Kategori</th> : null}
            <th className="pb-3 font-medium">Tanggal</th>
            <th className="pb-3 font-medium">Efficiency</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={showCategory ? 4 : 3} className="py-6 text-center" style={{ color: COLORS.textMuted }}>
                Belum ada riwayat status.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={`${'category' in row ? row.category : ''}-${row.date}-${index}`} className="border-t" style={{ borderColor: COLORS.border }}>
                {showCategory && 'category' in row ? (
                  <td className="py-2.5 font-medium" style={{ color: COLORS.textSecondary }}>
                    {row.category}
                  </td>
                ) : null}
                <td className="py-2.5" style={{ color: COLORS.textPrimary }}>
                  {row.date}
                </td>
                <td className="py-2.5 font-semibold" style={{ color: COLORS.textPrimary }}>
                  {formatPercentDisplay(row.efficiency)}
                </td>
                <td className="py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: statusDotColor(row.status) }}
                    />
                    <span style={{ color: COLORS.textSecondary }}>{row.status}</span>
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function CategoryTrendCharts({
  view,
  bundle,
  siteResetKey,
  showCategoryInTitle = false,
}: {
  view: TrendView;
  bundle: TrendViewBundle;
  siteResetKey?: string;
  showCategoryInTitle?: boolean;
}) {
  const [drilldownMonth, setDrilldownMonth] = useState<string | null>(null);

  useEffect(() => {
    setDrilldownMonth(null);
  }, [view, siteResetKey]);

  const lineColor = TREND_VIEW_LINE_COLORS[view];
  const targetBarColor = TREND_VIEW_TARGET_BAR_COLORS[view];
  const categoryLabel = getTrendViewLabel(view);
  const targetTitleBase = showCategoryInTitle
    ? `${categoryLabel} — Target vs Realisasi`
    : 'Target vs Realisasi (Time Series)';

  const isDailyTrendView = drilldownMonth != null;
  const monthLongLabel = drilldownMonth ? getMonthLongLabel(drilldownMonth) : '';

  const targetVsRealisasiData: Array<{
    month?: string;
    day?: string;
    target: number;
    realisasi: number;
    clickHelper?: number;
  }> = useMemo(() => {
    if (isDailyTrendView) {
      return aggregateDailyTargetRealizationForMonth(bundle.trendPoints, drilldownMonth);
    }
    return bundle.targetVsRealisasi.map((row) => ({ ...row, clickHelper: 1 }));
  }, [bundle.targetVsRealisasi, bundle.trendPoints, drilldownMonth, isDailyTrendView]);

  const realisasiTrendData: Array<{
    realisasi: number;
    month?: string;
    day?: string;
    clickHelper?: number;
  }> = useMemo(() => {
    if (isDailyTrendView) {
      return aggregateDailyRealizationForMonth(bundle.trendPoints, drilldownMonth);
    }
    return bundle.realisasiTrend.map((row) => ({ ...row, clickHelper: 1 }));
  }, [bundle.realisasiTrend, bundle.trendPoints, drilldownMonth, isDailyTrendView]);

  const chartXDataKey = isDailyTrendView ? 'day' : 'month';
  const targetTitle = isDailyTrendView ? `${targetTitleBase} (${monthLongLabel})` : targetTitleBase;
  const trendTitleBase = showCategoryInTitle ? `${categoryLabel} — Trend Realisasi` : 'Trend Realisasi';
  const trendTitle = isDailyTrendView ? `${trendTitleBase} (${monthLongLabel})` : trendTitleBase;

  const targetVsRealisasiYMax = chartYAxisMax(
    targetVsRealisasiData.flatMap((row) => [row.target, row.realisasi])
  );

  const realisasiTrendYMax = chartYAxisMax(realisasiTrendData.map((row) => row.realisasi));

  const openMonthDrilldown = useCallback((month: string | undefined) => {
    if (month && !isDailyTrendView) {
      setDrilldownMonth(month);
    }
  }, [isDailyTrendView]);

  const handleMonthBarClick = useCallback(
    (data: BarRectangleItem) => {
      openMonthDrilldown(data.payload?.month as string | undefined);
    },
    [openMonthDrilldown]
  );

  const drilldownBackButton = isDailyTrendView ? (
    <Button type="button" variant="outline" size="sm" onClick={() => setDrilldownMonth(null)}>
      Kembali
    </Button>
  ) : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <DashboardCard title={targetTitle} headerRight={drilldownBackButton}>
        <ChartContainer className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={targetVsRealisasiData}
              margin={BAR_CHART_MARGIN}
              barGap={0}
              {...CHART_SURFACE_PROPS}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
              <XAxis
                dataKey={chartXDataKey}
                tick={{ fontSize: 10 }}
                interval={isDailyTrendView ? 'preserveStartEnd' : 0}
                stroke={COLORS.textMuted}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke={COLORS.textMuted}
                domain={[0, targetVsRealisasiYMax]}
                tickFormatter={chartAxisTickFormatter}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="target"
                name="Target"
                fill={targetBarColor}
                radius={[4, 4, 0, 0]}
                cursor={isDailyTrendView ? 'default' : 'pointer'}
                onClick={isDailyTrendView ? undefined : handleMonthBarClick}
              />
              <Bar
                dataKey="realisasi"
                name="Realisasi"
                fill={lineColor}
                radius={[4, 4, 0, 0]}
                cursor={isDailyTrendView ? 'default' : 'pointer'}
                onClick={isDailyTrendView ? undefined : handleMonthBarClick}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </DashboardCard>

      <DashboardCard title={trendTitle} headerRight={drilldownBackButton}>
        <ChartContainer className="h-72 overflow-visible">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={realisasiTrendData} margin={LINE_CHART_MARGIN} {...CHART_SURFACE_PROPS}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
              <XAxis
                dataKey={chartXDataKey}
                tick={{ fontSize: 10 }}
                interval={isDailyTrendView ? 'preserveStartEnd' : 0}
                stroke={COLORS.textMuted}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke={COLORS.textMuted}
                domain={[0, realisasiTrendYMax]}
                tickFormatter={chartAxisTickFormatter}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {!isDailyTrendView ? (
                <Bar
                  dataKey="clickHelper"
                  fill="transparent"
                  stroke="none"
                  barSize={28}
                  minPointSize={24}
                  cursor="pointer"
                  legendType="none"
                  isAnimationActive={false}
                  onClick={handleMonthBarClick}
                />
              ) : null}
              <Line
                type="monotone"
                dataKey="realisasi"
                name="Realisasi"
                stroke={lineColor}
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (cx == null || cy == null) {
                    return null;
                  }
                  if (isDailyTrendView) {
                    return <circle cx={cx} cy={cy} r={6} fill={lineColor} />;
                  }
                  const month = payload?.month as string | undefined;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={lineColor}
                      style={{ cursor: 'pointer' }}
                      onClick={(event) => {
                        event.stopPropagation();
                        openMonthDrilldown(month);
                      }}
                    />
                  );
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </DashboardCard>
    </div>
  );
}

export default function SiteDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedSite, clearSelectedSite } = useSite();
  const [siteDetail, setSiteDetail] = useState<SiteRecord | undefined>();
  const [dashboard, setDashboard] = useState(EMPTY_SITE_DASHBOARD);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | undefined>();
  const [statusMonth, setStatusMonth] = useState('');
  const [selectedDashboardView, setSelectedDashboardView] = useState<DashboardViewSelection>('all');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const isAdmin = hasAdminAccess(user?.role);
  const isSupervisorWithoutSite = isSupervisorWithoutAssignedSite(user?.role, user?.siteId);

  const siteName = resolveSelectedSiteDisplayName(selectedSite, siteDetail?.name);

  useEffect(() => {
    let cancelled = false;

    async function loadSite() {
      if (!selectedSite?.id) {
        setSiteDetail(undefined);
        return;
      }

      try {
        const detail = await fetchSiteDetail(selectedSite.id);
        if (!cancelled) {
          setSiteDetail(detail);
        }
      } catch {
        if (!cancelled) {
          setSiteDetail(undefined);
        }
      }
    }

    void loadSite();
    return () => {
      cancelled = true;
    };
  }, [selectedSite?.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      if (!selectedSite?.id) {
        setDashboard(EMPTY_SITE_DASHBOARD);
        setStatusMonth('');
        setDashboardError(undefined);
        return;
      }

      setDashboardLoading(true);
      setDashboardError(undefined);

      try {
        const data = await loadSiteDashboard(selectedSite.id);
        if (cancelled) {
          return;
        }

        setDashboard(data);
        const defaultMonthOptions = data.trendViews.production.statusHistoryMonthOptions;
        setStatusMonth((current) => {
          if (current && defaultMonthOptions.some((option) => option.value === current)) {
            return current;
          }
          return defaultMonthOptions[0]?.value ?? '';
        });
      } catch (err) {
        if (!cancelled) {
          setDashboard(EMPTY_SITE_DASHBOARD);
          setStatusMonth('');
          setDashboardError(err instanceof Error ? err.message : 'Gagal memuat data dashboard.');
        }
      } finally {
        if (!cancelled) {
          setDashboardLoading(false);
        }
      }
    }

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [selectedSite?.id]);

  const isAllView = selectedDashboardView === 'all';

  const selectedTrendData = useMemo(() => {
    if (isAllView) {
      return dashboard.trendViews.production;
    }
    return dashboard.trendViews[selectedDashboardView];
  }, [dashboard.trendViews, isAllView, selectedDashboardView]);

  const statusHistoryMonthOptions = useMemo(
    () =>
      isAllView
        ? mergeAllStatusHistoryMonthOptions(dashboard.trendViews)
        : selectedTrendData.statusHistoryMonthOptions,
    [dashboard.trendViews, isAllView, selectedTrendData.statusHistoryMonthOptions]
  );

  useEffect(() => {
    setStatusMonth((current) => {
      if (current && statusHistoryMonthOptions.some((option) => option.value === current)) {
        return current;
      }
      return statusHistoryMonthOptions[0]?.value ?? '';
    });
  }, [selectedDashboardView, statusHistoryMonthOptions]);

  const supervisorName = useMemo(() => {
    const supervisor = dashboard.supervisor;
    if (!supervisor) {
      return siteDetail?.picName ?? '-';
    }

    const fullName = [supervisor.firstName, supervisor.lastName].filter(Boolean).join(' ').trim();
    return fullName || siteDetail?.picName || '-';
  }, [dashboard.supervisor, siteDetail?.picName]);

  const supervisorNik = dashboard.supervisor?.nik || '-';
  const supervisorPosition = dashboard.supervisor?.position || 'Supervisor Site';
  const supervisorAvatar = siteDetail?.picAvatar;

  const supervisorInitials = useMemo(() => {
    const parts = supervisorName.split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }, [supervisorName]);

  const statusHistoryRows = useMemo(() => {
    if (isAllView) {
      return getAllStatusHistoryRows(dashboard.trendViews, statusMonth);
    }
    return filterStatusHistoryByMonth(
      selectedTrendData.statusHistory,
      selectedTrendData.activityRows,
      statusMonth
    );
  }, [dashboard.trendViews, isAllView, selectedTrendData.activityRows, selectedTrendData.statusHistory, statusMonth]);

  const selectedKpis = useMemo(() => {
    if (isAllView) {
      return getKpisForAllViews(dashboard.trendViews);
    }
    return getKpisForTrendView(selectedDashboardView, selectedTrendData.activityRows);
  }, [dashboard.trendViews, isAllView, selectedDashboardView, selectedTrendData.activityRows]);

  const dashboardViewSelectOptions = useMemo<FormSelectOption[]>(
    () => DASHBOARD_VIEW_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    []
  );

  const statusMonthSelectOptions = useMemo<FormSelectOption[]>(
    () => statusHistoryMonthOptions.map((option) => ({ value: option.value, label: option.label })),
    [statusHistoryMonthOptions]
  );

  const siteStatusLabel = siteDetail?.status === 'inactive' ? 'Inactive' : 'Active';
  const siteStatusColor = siteDetail?.status === 'inactive' ? '#DC2626' : '#16A34A';

  const onConfirmDelete = async () => {
    if (!selectedSite?.id || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(undefined);

    try {
      await deleteSite(selectedSite.id);
      clearSelectedSite();
      navigate('/site-management', { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus site.');
    } finally {
      setIsDeleting(false);
    }
  };

  const dashboardBody = (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
        {dashboardError ? (
          <p className="rounded-lg border px-4 py-3 text-sm" style={{ borderColor: '#FECACA', color: '#DC2626' }}>
            {dashboardError}
          </p>
        ) : null}

        {dashboardLoading ? (
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
            Memuat data dashboard…
          </p>
        ) : null}

        <SiteOverviewCard
          siteName={siteName}
          province={siteDetail?.province ?? '—'}
          location={siteDetail?.location ?? '—'}
          siteStatusLabel={siteStatusLabel}
          siteStatusColor={siteStatusColor}
          supervisorName={supervisorName}
          supervisorPosition={supervisorPosition}
          supervisorNik={supervisorNik}
          supervisorAvatar={supervisorAvatar}
          supervisorInitials={supervisorInitials}
          showDeleteAction={isAdmin}
          deleteDisabled={!selectedSite?.id || isDeleting}
          onDeleteClick={() => {
            setDeleteError(undefined);
            setDeleteOpen(true);
          }}
        />

        <FormSelectField
          label="Jenis Data"
          options={dashboardViewSelectOptions}
          value={selectedDashboardView}
          onChange={(event) => setSelectedDashboardView(event.target.value as DashboardViewSelection)}
          className="w-full sm:max-w-xs"
        />

        <div
          className={`grid grid-cols-1 gap-4 ${isAllView ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2'}`}
        >
          {selectedKpis.map((kpi) => (
            <SummaryKpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <DashboardCard
            title="Status History"
            headerRight={
              statusMonthSelectOptions.length > 0 ? (
                <FormSelectField
                  label="Bulan"
                  options={statusMonthSelectOptions}
                  value={statusMonth}
                  onChange={(event) => setStatusMonth(event.target.value)}
                  className="w-full min-w-[160px] sm:w-48"
                />
              ) : null
            }
          >
            <StatusHistoryTable rows={statusHistoryRows} showCategory={isAllView} />
          </DashboardCard>

          {isAllView ? (
            <div className="flex flex-col gap-8">
              {TREND_VIEWS.map((view) => (
                <CategoryTrendCharts
                  key={view}
                  view={view}
                  bundle={dashboard.trendViews[view]}
                  siteResetKey={selectedSite?.id}
                  showCategoryInTitle
                />
              ))}
            </div>
          ) : (
            <CategoryTrendCharts
              view={selectedDashboardView}
              bundle={dashboard.trendViews[selectedDashboardView]}
              siteResetKey={selectedSite?.id}
            />
          )}
        </div>
    </div>
  );

  return (
    <div className="flex min-h-full flex-col">
      <SiteDashboardHero siteName={siteName} showNoSiteMessage={isSupervisorWithoutSite} />

      {isSupervisorWithoutSite ? (
        <SupervisorNoSiteBlockedContent>{dashboardBody}</SupervisorNoSiteBlockedContent>
      ) : (
        dashboardBody
      )}

      <ConfirmationModalComponent
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteOpen(false);
            setDeleteError(undefined);
          }
        }}
        title="Hapus Site"
        description={
          <>
            Apakah anda yakin untuk menghapus site{' '}
            <span style={{ color: '#2563EB', textDecoration: 'underline', fontWeight: 600 }}>{siteName}</span>?
            {deleteError ? (
              <span className="mt-2 block text-sm" style={{ color: COLORS.primary }}>
                {deleteError}
              </span>
            ) : null}
          </>
        }
        confirmLabel={isDeleting ? 'Menghapus…' : 'Hapus Site'}
        cancelLabel="Kembali"
        confirmDisabled={isDeleting}
        closeOnConfirm={false}
        onConfirm={() => void onConfirmDelete()}
      />
    </div>
  );
}
