import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { isSupervisorWithoutAssignedSite } from '../../lib/navigation-session';
import { isSiteOnlyNavRoute } from '../../lib/site-navigation';
import SupervisorNoSiteBlockedContent from './SupervisorNoSiteBlockedContent';

type SupervisorNoSiteContentGateProps = {
  children: ReactNode;
};

const SITE_DASHBOARD_PATH = '/site-dashboard';

export default function SupervisorNoSiteContentGate({ children }: SupervisorNoSiteContentGateProps) {
  const location = useLocation();
  const { user, isInitializing } = useAuth();

  const shouldBlockContent =
    !isInitializing &&
    isSupervisorWithoutAssignedSite(user?.role, user?.siteId) &&
    isSiteOnlyNavRoute(location.pathname);

  if (!shouldBlockContent) {
    return children;
  }

  // Site dashboard blurs only the body below the hero so the message stays readable there.
  if (location.pathname === SITE_DASHBOARD_PATH) {
    return children;
  }

  return <SupervisorNoSiteBlockedContent>{children}</SupervisorNoSiteBlockedContent>;
}
