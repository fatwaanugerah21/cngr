import { NavLink, useLocation } from 'react-router-dom';
import { COLORS } from '../../constants/colors';

const ITEMS = [
  { to: '/account/user', label: 'Akun User', match: (path: string) => path.startsWith('/account/user') },
  {
    to: '/account/security',
    label: 'Keamanan Akun',
    match: (path: string) => path.startsWith('/account/security'),
  },
] as const;

export default function AccountSubNav() {
  const { pathname } = useLocation();

  return (
    <aside
      className="h-fit w-full shrink-0 rounded-2xl border bg-white p-4 shadow-sm lg:w-56"
      style={{ borderColor: COLORS.border }}
    >
      <h2 className="mb-3 text-sm font-bold" style={{ color: COLORS.textPrimary }}>
        Menu akun
      </h2>
      <nav className="flex flex-col gap-1" aria-label="Bagian akun">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="rounded-full px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: active
                  ? `color-mix(in srgb, ${COLORS.primary} 14%, ${COLORS.white})`
                  : 'transparent',
                color: active ? COLORS.primary : COLORS.textPrimary,
              }}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
