import { useEffect, useState, type ComponentType } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import DashboardMenuIcon from '../../icons/menu-item-icons/dashboard-menu.icon';
import SiteManagementMenuIcon from '../../icons/menu-item-icons/site-management-menu.icon';
import UserManagementMenuIcon from '../../icons/menu-item-icons/user-management-menu.icon';
import ProductionMenuIcon from '../../icons/menu-item-icons/production-menu.icon';
import ReportMenuIcon from '../../icons/menu-item-icons/report-menu.icon';
import DocMenuIcon from '../../icons/menu-item-icons/doc-menu.icon';
import RuleMenuIcon from '../../icons/menu-item-icons/rule-menu.icon';
import AccountMenuIcon from '../../icons/menu-item-icons/account-menu.icon';
import LogoutMenuIcon from '../../icons/menu-item-icons/logout-menu.icon';
import mainImage from '../../assets/main-image.jpg';
import cngrText from '../../assets/cngr-text.png';
import ReclamationMenuIcon from '../../icons/menu-item-icons/reclamation-menu.icon';
import LandOpeningMenuIcon from '../../icons/menu-item-icons/land-opening-menu.icon';
import RehabDasMenuIcon from '../../icons/menu-item-icons/rehab-das-menu.icon';
import {
  EUserRole,
  getStoredSelectedSite,
  getStoredUserRole,
  type SelectedSite,
} from '../../lib/navigation-session';
import { useSite } from '../../lib/site-context';

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

const adminMainNavGroups: NavGroupDef[] = [
  // {
  //   title: 'Utama',
  //   items: [{ path: '/dashboard', label: 'Homepage', icon: HomeMenuIcon }],
  // },
  {
    title: 'Master Data',
    items: [
      { path: '/site-management', label: 'Site Management', icon: SiteManagementMenuIcon },
      { path: '/user-management', label: 'User Management', icon: UserManagementMenuIcon },
    ],
  },
  {
    title: 'Umum',
    items: [
      { path: '/account', label: 'Akun', icon: AccountMenuIcon },
      { path: '/logout', label: 'Keluar', icon: LogoutMenuIcon },
    ],
  },
];

const siteNavGroups: NavGroupDef[] = [
  {
    title: 'Utama',
    items: [{ path: '/site-dashboard', label: 'Dashboard', icon: DashboardMenuIcon }],
  },
  {
    title: 'Operasional',
    items: [
      { path: '/production', label: 'Produksi', icon: ProductionMenuIcon },
      { path: '/land-opening', label: 'Bukaan Lahan', icon: LandOpeningMenuIcon },
      { path: '/rehab-das', label: 'Rehab DAS', icon: RehabDasMenuIcon },
      { path: '/reclamation', label: 'Reklamasi', icon: ReclamationMenuIcon },
    ],
  },
  {
    title: 'Manajemen Berkas',
    items: [
      { path: '/report', label: 'Laporan', icon: ReportMenuIcon },
      { path: '/document', label: 'Dokumen', icon: DocMenuIcon },
      { path: '/rules', label: 'Peraturan', icon: RuleMenuIcon },
    ],
  },
  {
    title: 'Umum',
    items: [{ path: '/account', label: 'Akun', icon: AccountMenuIcon }],
  },
];

const logoutItem: NavItemDef = { path: '/logout', label: 'Keluar', icon: LogoutMenuIcon };
const backToMainMenuItem: NavItemDef = {
  path: '/site-management',
  label: 'Kembali Ke Menu Awal',
  icon: SiteManagementMenuIcon,
};
function isPathInNavGroups(pathname: string, navGroups: NavGroupDef[]): boolean {
  return navGroups.some((group) =>
    group.items.some((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
  );
}

function navGroupsIncludeLogout(navGroups: NavGroupDef[]): boolean {
  return navGroups.some((group) => group.items.some((item) => item.path === logoutItem.path));
}

function getSidebarNavGroups(role: EUserRole, isInAdminMainNavRoute: boolean): NavGroupDef[] {
  if ((role === EUserRole.ADMIN || role === EUserRole.DIRECTOR) && isInAdminMainNavRoute) {
    return adminMainNavGroups;
  }

  return siteNavGroups;
}

function useNavigationSession() {
  const [role, setRole] = useState<EUserRole>(() => getStoredUserRole());
  const [selectedSite, setSelectedSite] = useState<SelectedSite | undefined>(() => getStoredSelectedSite());

  useEffect(() => {
    const syncSession = () => {
      setRole(getStoredUserRole());
      setSelectedSite(getStoredSelectedSite());
    };

    window.addEventListener('storage', syncSession);
    window.addEventListener('cngr-navigation-session-change', syncSession);

    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('cngr-navigation-session-change', syncSession);
    };
  }, []);

  return { role, selectedSite };
}

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
        `flex w-full items-center gap-4 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-white/10 ${isActive ? '!bg-[#EE252B]' : ''
        }`
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
              fill={COLORS.white}
            />
          </span>
          <span className="!text-white">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function NavGroup({ title, items }: NavGroupDef) {
  return (
    <div className="mt-8 first:mt-0">
      <span
        className="mb-3 block text-xs font-semibold tracking-wide"
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
  const navigate = useNavigate();
  const location = useLocation();
  const { role, selectedSite } = useNavigationSession();
  const isInAdminMainNavRoute = isPathInNavGroups(location.pathname, adminMainNavGroups);

  const navGroups = getSidebarNavGroups(role, isInAdminMainNavRoute);
  const showStandaloneLogout = !navGroupsIncludeLogout(navGroups);

  const { clearSelectedSite } = useSite();

  useEffect(() => {
    if (role === EUserRole.SUPERVISOR && isInAdminMainNavRoute) {
      navigate('/site-dashboard', { replace: true });
    }
  }, [isInAdminMainNavRoute, navigate, role]);

  const handleBackToMainMenu = () => {
    clearSelectedSite();
    navigate('/site-management');
  };

  return (
    <aside className="fixed top-0 left-0 z-30 flex h-screen max-h-screen w-64 flex-col">
      <div className="relative px-4 flex h-full flex-1 overflow-hidden">
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
              {role === EUserRole.ADMIN && selectedSite != null && !isInAdminMainNavRoute ? (
                <div className="mt-8">
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 rounded-lg px-2 py-2.5 text-left text-sm transition-colors hover:bg-white/10"
                    style={{ color: COLORS.sidebarTextInactive }}
                    onClick={handleBackToMainMenu}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
                      <backToMainMenuItem.icon fill={COLORS.white} />
                    </span>
                    <span className="!text-white">{backToMainMenuItem.label}</span>
                  </button>
                </div>
              ) : null}
              {showStandaloneLogout ? (
                <div className="mt-auto shrink-0 pt-8">
                  <NavItem {...logoutItem} />
                </div>
              ) : null}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
