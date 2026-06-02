import { COLORS } from '../../constants/colors';

type SupervisorNoSiteIndicatorProps = {
  className?: string;
};

export default function SupervisorNoSiteIndicator({ className = '' }: SupervisorNoSiteIndicatorProps) {
  return (
    <p
      className={`rounded-lg border bg-white px-6 py-4 text-center text-sm font-medium shadow-sm ${className}`}
      style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
      role="status"
    >
      Anda tidak memiliki site
    </p>
  );
}
