/**
 * Demo profile used on account view and as defaults for the edit form until API exists.
 */
export const ACCOUNT_PROFILE = {
  profileCompletePercent: 86,
  avatarUrl: 'https://i.pravatar.cc/160?img=11',
  firstName: 'Ghifary',
  lastName: 'Modeong',
  email: 'mohghifary@gmail.com',
  employeeId: '1112716215091',
  gender: 'Laki-laki',
  jobTitle: 'Supervisor situs',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  postalCode: '10570',
  birthDate: '2000-11-12',
  phone: '081322716251',
  locationLabel: 'Jakarta, Indonesia',
} as const;

export type AccountProfile = typeof ACCOUNT_PROFILE;
