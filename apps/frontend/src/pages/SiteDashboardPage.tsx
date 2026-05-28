import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import mainImage from '../assets/main-image.jpg';
import { COLORS } from '../constants/colors';
import {
  BUKAAN_LAHAN,
  PRODUKSI_TREND,
  PRODUKSI_TREND_HIGHLIGHT,
  REHAP_DAS,
  REHAP_DAS_HIGHLIGHT,
  REKLAMASI,
  SITE_DASHBOARD_KPIS,
  STATUS_HISTORY,
  STATUS_HISTORY_MONTH_OPTIONS,
  TARGET_VS_REALISASI,
  type SiteDashboardKpi,
  type StatusHistoryRow,
} from '../data/site-dashboard-dummy';
import { useAuth } from '../lib/auth-context';
import { fetchSiteDetail } from '../lib/cngr-api';
import type { SiteRecord } from '../data/sites-dummy';
import { useSite } from '../lib/site-context';
import { useUserDirectory } from '../lib/user-directory-context';

const CHART_TARGET_CYAN = '#22D3EE';
const CHART_REALISASI_BLUE = '#1E40AF';
const CHART_PRODUKSI_PINK = '#EC4899';
const CHART_BUKAAN_TARGET = '#F9A8D4';
const CHART_BUKAAN_REALISASI = '#DB2777';
const CHART_REHAP_GREEN = '#22C55E';
const CHART_REKLAMASI_TARGET = '#86EFAC';
const CHART_REKLAMASI_REALISASI = '#16A34A';

function formatDashboardNumber(value: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value);
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

function KpiIcon({ id, color }: { id: string; color: string }) {
  if (id === 'target' || id === 'land-opening') {
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
            {formatDashboardNumber(kpi.value)}
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

function SiteDashboardHero({ siteName }: { siteName: string }) {
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
          <h1 className="text-2xl font-bold text-white">Dashboard {siteName}</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            Selamat datang di menu dashboard {siteName.toLowerCase()}, Anda dapat melakukan monitoring data
            dashboard {siteName.toLowerCase()} site
          </p>
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
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function SiteDashboardPage() {
  const { selectedSite } = useSite();
  const { getUser } = useUserDirectory();
  const [siteDetail, setSiteDetail] = useState<SiteRecord | undefined>();
  const [supervisorName, setSupervisorName] = useState('-');
  const [supervisorNik, setSupervisorNik] = useState('-');
  const [supervisorAvatar, setSupervisorAvatar] = useState<string | undefined>();
  const [supervisorPosition, setSupervisorPosition] = useState('Supervisor Site');
  const [statusMonth, setStatusMonth] = useState(STATUS_HISTORY_MONTH_OPTIONS[0]?.value ?? '2026-01');

  const siteName = selectedSite?.name ?? siteDetail?.name ?? 'Site';

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
    const supervisorId = siteDetail?.supervisorId?.trim();

    if (!supervisorId) {
      setSupervisorName(siteDetail?.picName ?? '-');
      setSupervisorNik('-');
      setSupervisorAvatar(siteDetail?.picAvatar);
      setSupervisorPosition('Supervisor Site');
      return;
    }

    void (async () => {
      const supervisor = await getUser(supervisorId);
      if (cancelled) {
        return;
      }

      if (supervisor) {
        setSupervisorName(supervisor.fullName || `${supervisor.firstName} ${supervisor.lastName}`.trim());
        setSupervisorNik(supervisor.nik || '-');
        setSupervisorAvatar(supervisor.avatarUrl);
        setSupervisorPosition(supervisor.position || 'Supervisor Site');
        return;
      }

      setSupervisorName(siteDetail?.picName ?? '-');
      setSupervisorNik('-');
      setSupervisorAvatar(siteDetail?.picAvatar);
      setSupervisorPosition('Supervisor Site');
    })();

    return () => {
      cancelled = true;
    };
  }, [getUser, siteDetail]);

  const supervisorInitials = useMemo(() => {
    const parts = supervisorName.split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }, [supervisorName]);

  const siteStatusLabel = siteDetail?.status === 'inactive' ? 'Inactive' : 'Active';
  const siteStatusColor = siteDetail?.status === 'inactive' ? '#DC2626' : '#16A34A';

  return (
    <div className="flex min-h-full flex-col" style={{ backgroundColor: COLORS.backgroundGray }}>
      <SiteDashboardHero siteName={siteName} />

      <div className="flex flex-col gap-6 p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SITE_DASHBOARD_KPIS.map((kpi) => (
            <SummaryKpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="flex flex-col gap-6 xl:col-span-3">
            <DashboardCard title="Supervisor Detail">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg text-lg font-semibold"
                  style={{ backgroundColor: COLORS.backgroundGray, color: COLORS.textSecondary }}
                >
                  {supervisorAvatar ? (
                    <img src={supervisorAvatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    supervisorInitials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                    {supervisorName}
                  </p>
                  <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                    {supervisorPosition}
                  </p>
                  <p className="mt-3 text-xs" style={{ color: COLORS.textMuted }}>
                    {supervisorNik}
                  </p>
                  <span
                    className="mt-2 inline-flex rounded-full px-3 py-0.5 text-xs font-semibold"
                    style={{
                      color: siteStatusColor,
                      backgroundColor: `color-mix(in srgb, ${siteStatusColor} 14%, #FFFFFF)`,
                    }}
                  >
                    {siteStatusLabel}
                  </span>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Site Detail">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs" style={{ color: COLORS.textMuted }}>
                    Site Name
                  </dt>
                  <dd className="font-semibold" style={{ color: '#2563EB' }}>
                    {siteName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs" style={{ color: COLORS.textMuted }}>
                    Province
                  </dt>
                  <dd style={{ color: COLORS.textPrimary }}>{siteDetail?.province ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs" style={{ color: COLORS.textMuted }}>
                    Location
                  </dt>
                  <dd className="leading-relaxed" style={{ color: COLORS.textPrimary }}>
                    {siteDetail?.location ?? '—'}
                  </dd>
                </div>
              </dl>
            </DashboardCard>
          </div>

          <div className="flex flex-col gap-6 xl:col-span-9">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <DashboardCard
                title="Status History"
                className="lg:col-span-2"
                headerRight={
                  <select
                    value={statusMonth}
                    onChange={(event) => setStatusMonth(event.target.value)}
                    className="rounded-lg border px-2 py-1 text-xs outline-none"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, backgroundColor: COLORS.white }}
                  >
                    {STATUS_HISTORY_MONTH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[240px] text-left text-xs">
                    <thead>
                      <tr style={{ color: COLORS.textMuted }}>
                        <th className="pb-3 font-medium">Tanggal</th>
                        <th className="pb-3 font-medium">Efficiency</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STATUS_HISTORY.map((row) => (
                        <tr key={row.date} className="border-t" style={{ borderColor: COLORS.border }}>
                          <td className="py-2.5" style={{ color: COLORS.textPrimary }}>
                            {row.date}
                          </td>
                          <td className="py-2.5 font-semibold" style={{ color: COLORS.textPrimary }}>
                            {row.efficiency}%
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>

              <DashboardCard title="Target vs Realisasi (Time Series)" className="lg:col-span-3">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TARGET_VS_REALISASI} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke={COLORS.textMuted} />
                      <YAxis tick={{ fontSize: 10 }} stroke={COLORS.textMuted} domain={[0, 100]} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="target" name="Target" fill={CHART_TARGET_CYAN} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="realisasi" name="Realisasi" fill={CHART_REALISASI_BLUE} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DashboardCard title="Produksi Trend">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={PRODUKSI_TREND} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke={COLORS.textMuted} />
                      <YAxis tick={{ fontSize: 10 }} stroke={COLORS.textMuted} domain={[0, 100]} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <ReferenceLine
                        x={PRODUKSI_TREND_HIGHLIGHT.month}
                        stroke={CHART_PRODUKSI_PINK}
                        strokeDasharray="4 4"
                        label={{
                          value: `${PRODUKSI_TREND_HIGHLIGHT.label} ${PRODUKSI_TREND_HIGHLIGHT.value}`,
                          position: 'top',
                          fill: CHART_PRODUKSI_PINK,
                          fontSize: 10,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="realisasi"
                        name="Realisasi"
                        stroke={CHART_PRODUKSI_PINK}
                        strokeWidth={2}
                        dot={{ r: 3, fill: CHART_PRODUKSI_PINK }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>

              <DashboardCard title="Bukaan Lahan">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={BUKAAN_LAHAN} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke={COLORS.textMuted} />
                      <YAxis tick={{ fontSize: 10 }} stroke={COLORS.textMuted} domain={[0, 100]} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="target" name="Target" fill={CHART_BUKAAN_TARGET} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="realisasi" name="Realisasi" fill={CHART_BUKAAN_REALISASI} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>

              <DashboardCard title="Rehap Das">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={REHAP_DAS} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke={COLORS.textMuted} interval={0} angle={-25} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 10 }} stroke={COLORS.textMuted} domain={[0, 100]} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <ReferenceLine
                        x={REHAP_DAS_HIGHLIGHT.week}
                        stroke={CHART_REHAP_GREEN}
                        strokeDasharray="4 4"
                        label={{
                          value: `${REHAP_DAS_HIGHLIGHT.label} ${REHAP_DAS_HIGHLIGHT.value}`,
                          position: 'top',
                          fill: CHART_REHAP_GREEN,
                          fontSize: 10,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="realisasi"
                        name="Realisasi"
                        stroke={CHART_REHAP_GREEN}
                        strokeWidth={2}
                        dot={{ r: 3, fill: CHART_REHAP_GREEN }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>

              <DashboardCard title="Reklamasi">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={REKLAMASI} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke={COLORS.textMuted} />
                      <YAxis tick={{ fontSize: 10 }} stroke={COLORS.textMuted} domain={[0, 100]} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="target" name="Target" fill={CHART_REKLAMASI_TARGET} radius={[4, 4, 0, 0]} />
                      <Bar
                        dataKey="realisasi"
                        name="Realisasi"
                        fill={CHART_REKLAMASI_REALISASI}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
