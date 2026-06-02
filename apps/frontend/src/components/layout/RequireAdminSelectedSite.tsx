import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { EUserRole, hasAdminAccess } from '../../lib/navigation-session';
import { isSiteOnlyNavRoute, SITE_MANAGEMENT_PATH } from '../../lib/site-navigation';
import { useSite } from '../../lib/site-context';

export default function RequireAdminSelectedSite() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedSite } = useSite();
  const { user } = useAuth();
  const role = user?.role ?? EUserRole.ADMIN;
  const isOnSiteOnlyRoute = isSiteOnlyNavRoute(location.pathname);

  useEffect(() => {
    if (hasAdminAccess(role) && selectedSite == null && isOnSiteOnlyRoute) {
      navigate(SITE_MANAGEMENT_PATH, { replace: true });
    }
  }, [isOnSiteOnlyRoute, navigate, role, selectedSite]);

  return null;
}
