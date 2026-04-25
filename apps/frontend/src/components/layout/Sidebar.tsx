import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import DashboardMenuIcon from '../../icons/menu-item-icons/dashboard-menu.icon';
import SiteManagementMenuIcon from '../../icons/menu-item-icons/site-management-menu.icon';
import UserManagementMenuIcon from '../../icons/menu-item-icons/user-management-menu.icon';
import ProductionMenuIcon from '../../icons/menu-item-icons/production-menu.icon';
import IssueMenuIcon from '../../icons/menu-item-icons/issue-menu.icon';
import ReportMenuIcon from '../../icons/menu-item-icons/report-menu.icon';
import DocMenuIcon from '../../icons/menu-item-icons/doc-menu.icon';
import RuleMenuIcon from '../../icons/menu-item-icons/rule-menu.icon';
import AccountMenuIcon from '../../icons/menu-item-icons/account-menu.icon';
import LogoutMenuIcon from '../../icons/menu-item-icons/logout-menu.icon';
import mainImage from '../../assets/main-image.jpg';
import cngrText from '../../assets/cngr-text.png';

type NavIcon = ComponentType<{ isActive?: boolean; fill?: string }>;

interface NavItemDef {
  path: string;
  label: string;
  icon: NavIcon;
}

interface NavGroupDef {
  title: string;
  items: NavItemDef[];
}

const navGroups: NavGroupDef[] = [
  {
    title: 'Utama',
    items: [{ path: '/dashboard', label: 'Dasbor', icon: DashboardMenuIcon }],
  },
  {
    title: 'Data Master',
    items: [
      { path: '/user-management', label: 'Manajemen Pengguna', icon: UserManagementMenuIcon },
      { path: '/site-management', label: 'Manajemen Site', icon: SiteManagementMenuIcon },
    ],
  },
  {
    title: 'Operasional',
    items: [
      { path: '/production', label: 'Produksi', icon: ProductionMenuIcon },
      { path: '/issue', label: 'Isu', icon: IssueMenuIcon },
    ],
  },
  {
    title: 'Manajemen Berkas',
    items: [
      { path: '/laporan', label: 'Laporan', icon: ReportMenuIcon },
      { path: '/dokumen', label: 'Dokumen', icon: DocMenuIcon },
      { path: '/peraturan', label: 'Peraturan', icon: RuleMenuIcon },
    ],
  },
  {
    title: 'Umum',
    items: [{ path: '/account', label: 'Akun', icon: AccountMenuIcon }],
  },
];

const logoutItem: NavItemDef = { path: '/logout', label: 'Keluar', icon: LogoutMenuIcon };

interface NavItemProps {
  path: string;
  label: string;
  icon: NavIcon;
}

function NavItem({ path, label, icon: Icon }: NavItemProps) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex w-full items-center gap-4 rounded-lg px-8 py-2.5 text-sm transition-colors ${isActive ? '' : 'hover:text-[#CBD5E1]'}`
      }
      style={({ isActive }) => ({
        color: isActive ? COLORS.sidebarTextActive : COLORS.sidebarTextInactive,
      })}
    >
      {({ isActive }) => (
        <>
          <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
            <Icon
              isActive={isActive}
              fill={isActive ? COLORS.sidebarTextActive : COLORS.sidebarTextInactive}
            />
          </span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function NavGroup({ title, items }: NavGroupDef) {
  return (
    <div className="mt-8 first:mt-0">
      <span
        className="mb-3 block px-4 text-xs font-semibold uppercase tracking-wider"
        style={{ color: COLORS.sidebarText }}
      >
        {title}
      </span>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 z-30 flex h-screen max-h-screen w-64 flex-col">
      <div className="relative flex h-full flex-1 overflow-hidden">
        <img
          src={mainImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-bottom"
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: COLORS.sidebarOverlay,
          }}
        />
        <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col">
          <div className="mb-10 flex shrink-0 justify-center px-8 pt-6">
            <img
              src={cngrText}
              alt="CNGR"
              className="h-7 w-auto object-contain"
              style={{
                filter:
                  'drop-shadow(0 1px 0 rgba(255,255,255,0.2)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
              }}
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-6">
            <nav className="flex min-h-0 flex-1 flex-col">
              {navGroups.map((group) => (
                <NavGroup key={group.title} {...group} />
              ))}
              <div className="mt-auto shrink-0 pt-8">
                <NavItem {...logoutItem} />
              </div>
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
