export type SiteStatus = 'active' | 'inactive';

export type SiteRecord = {
  id: string;
  name: string;
  picName: string;
  picAvatar?: string;
  province: string;
  location: string;
  status: SiteStatus;
  supervisorId: string;
};