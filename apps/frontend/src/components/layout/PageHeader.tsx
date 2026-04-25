import { Link } from 'react-router-dom';
import { COLORS } from '../../constants/colors';

export interface BreadcrumbItem {
  label: string;
  /** When omitted, the segment is rendered as the current page (not a link). */
  to?: string;
}

interface PageHeaderProps {
  /** Single title (list pages). Ignored when `breadcrumb` is set. */
  title?: string;
  /** Breadcrumb trail (create/edit pages). */
  breadcrumb?: BreadcrumbItem[];
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export default function PageHeader({ title, breadcrumb, user }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-5" style={{ borderColor: COLORS.border }}>
      {breadcrumb?.length ? (
        <nav aria-label="Jejak navigasi" className="min-w-0 flex-1">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            {breadcrumb.map((item, index) => {
              const isLast = index === breadcrumb.length - 1;
              return (
                <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                  {index > 0 ? (
                    <span style={{ color: COLORS.textMuted }} aria-hidden>
                      &gt;
                    </span>
                  ) : null}
                  {item.to && !isLast ? (
                    <Link
                      to={item.to}
                      className="font-medium transition-colors hover:opacity-80"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={isLast ? 'font-semibold' : 'font-medium'}
                      style={{ color: isLast ? COLORS.textPrimary : COLORS.textSecondary }}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : (
        <h1 className="text-xl font-semibold" style={{ color: COLORS.textPrimary }}>
          {title}
        </h1>
      )}
      {user && (
        <div className="flex shrink-0 items-center gap-3 pl-4">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
            style={{ backgroundColor: COLORS.border, color: COLORS.textSecondary }}
          >
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: COLORS.textPrimary }}>
              {user.name}
            </p>
            <p className="text-xs" style={{ color: COLORS.textSecondary }}>
              {user.role}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
