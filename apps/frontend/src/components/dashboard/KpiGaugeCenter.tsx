import { COLORS } from '../../constants/colors';

interface KpiGaugeCenterProps {
  value: string;
}

/** Single-line value display for KPI gauge center (e.g. "107.29 Mw") */
export default function KpiGaugeCenter({ value }: KpiGaugeCenterProps) {
  return (
    <p
      className="whitespace-nowrap text-lg font-bold leading-none"
      style={{ color: COLORS.textPrimary }}
    >
      {value}
    </p>
  );
}
