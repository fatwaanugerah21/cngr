import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import PageHeader from '../components/layout/PageHeader';
import KpiGaugeCenter from '../components/dashboard/KpiGaugeCenter';
import { COLORS } from '../constants/colors';
import {
  KPI_KORPORASI,
  KPI_PATUHA,
  PRODUKSI_PATUHA,
  PRODUKSI_DIENG,
} from '../data/dashboard-dummy';

const REALISASI_FILL = '#22C55E';
const TARGET_FILL_GREEN = '#A8E6A1';
const TARGET_FILL_ORANGE = '#FDBA74';

function KpiCard({
  title,
  target,
  realisasi,
  realtimeMw,
  variant = 'green',
}: {
  title: string;
  target: number;
  realisasi: number;
  realtimeMw?: string;
  variant?: 'green' | 'orange';
}) {
  const percentageVal = Math.min(100, target > 0 ? (realisasi / target) * 100 : 0);
  const percentage = `${percentageVal.toFixed(2)}%`;
  const targetFill = variant === 'orange' ? TARGET_FILL_ORANGE : TARGET_FILL_GREEN;
  const gaugeData = [{ name: 'realisasi', value: percentageVal, fill: REALISASI_FILL }];
  const centerValue = realtimeMw ? `${realtimeMw} MW` : `${realisasi / 1000} GWh`;
  return (
    <div
      className="flex flex-col rounded-lg border p-6 shadow-sm"
      style={{ borderColor: COLORS.border, backgroundColor: COLORS.white }}
    >
      <div className="flex flex-1 items-start gap-6">
        {/* Left: Gauge chart */}
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="100%"
              barSize={22}
              data={gaugeData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: targetFill }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <KpiGaugeCenter value={centerValue} />
          </div>
        </div>

        {/* Right: Title, separator, info */}
        <div className="flex flex-1 flex-col gap-2">
          <h3 className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
            {title}
          </h3>
          <div className="border-b pb-3" style={{ borderColor: COLORS.border }} />
          <p className="text-xs" style={{ color: COLORS.textSecondary }}>
            Target produksi 2021{' '}
            <span style={{ color: COLORS.textPrimary }}>{target / 1000} GWh</span>
          </p>
          <p className="text-xs" style={{ color: COLORS.textSecondary }}>
            Realisasi{' '}
            <span style={{ color: COLORS.textPrimary }}>{realisasi / 1000} GWh</span>{' '}
            <span className="font-medium" style={{ color: REALISASI_FILL }}>
              ({percentage})
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col rounded-lg border p-6 shadow-sm"
      style={{ borderColor: COLORS.border, backgroundColor: COLORS.white }}
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
        {title}
      </h3>
      <div className="min-h-64 flex-1" style={{ height: 256 }}>
        {children}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Ringkasan dasbor"
      />

      <div className="flex flex-col gap-8 p-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <KpiCard {...KPI_KORPORASI} />
          <KpiCard {...KPI_PATUHA} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Produksi GWh Patuha">
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={PRODUKSI_PATUHA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke={COLORS.textSecondary} />
                <YAxis tick={{ fontSize: 10 }} stroke={COLORS.textSecondary} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderColor: COLORS.border,
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="dataA" name="Seri A" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dataB" name="Seri B" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Pembangkitan listrik 2021">
            <div
              className="flex h-full min-h-64 w-full items-center justify-center rounded"
              style={{ backgroundColor: COLORS.backgroundGray }}
            >
              <p className="text-xs" style={{ color: COLORS.textMuted }}>
                Konten akan ditampilkan di sini
              </p>
            </div>
          </ChartCard>
        </div>

        {/* Bottom Chart */}
        <ChartCard title="Produksi GWh Dieng">
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={PRODUKSI_DIENG} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke={COLORS.textSecondary} />
              <YAxis tick={{ fontSize: 10 }} stroke={COLORS.textSecondary} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="dataA" name="Seri A" fill="#FDBA74" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dataB" name="Seri B" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
