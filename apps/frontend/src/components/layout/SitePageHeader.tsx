import PageHeader, { type BreadcrumbItem } from './PageHeader';
import { useSelectedSiteName } from '../../lib/site-context';

interface SitePageHeaderProps {
  breadcrumb?: BreadcrumbItem[];
}

export default function SitePageHeader({ breadcrumb }: SitePageHeaderProps) {
  const siteName = useSelectedSiteName();

  if (breadcrumb?.length) {
    return <PageHeader breadcrumb={[{ label: siteName }, ...breadcrumb]} />;
  }

  return <PageHeader title={siteName} />;
}
