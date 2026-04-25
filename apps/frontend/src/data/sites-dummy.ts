export type SiteStatus = 'active' | 'inactive';

export type SiteRecord = {
  id: string;
  name: string;
  picName: string;
  picAvatar?: string;
  province: string;
  location: string;
  status: SiteStatus;
};

const SAMPLE_LOCATION =
  'Jl. Trans Sulawesi, Desa Fatufia, Kec. Bahodopi, Kab. Morowali, Sulawesi Tengah, 94974';

const SEED: Omit<SiteRecord, 'id'>[] = [
  {
    name: 'Morowali',
    picName: 'Fatwa Nasir',
    province: 'Sulawesi Tenggara',
    location: SAMPLE_LOCATION,
    status: 'active',
    picAvatar: 'https://i.pravatar.cc/40?img=11',
  },
  {
    name: 'Weda Bay',
    picName: 'Rafly Mas',
    province: 'Maluku Utara',
    location: SAMPLE_LOCATION,
    status: 'active',
    picAvatar: 'https://i.pravatar.cc/40?img=12',
  },
  {
    name: 'Weda Bay',
    picName: 'Ikhsan',
    province: 'Maluku Utara',
    location: SAMPLE_LOCATION,
    status: 'active',
  },
];

/** Deterministic list for list UI and pagination (156 rows). */
export function buildDummySites(total = 156): SiteRecord[] {
  return Array.from({ length: total }, (_, i) => {
    const base = SEED[i % SEED.length];
    const cycle = Math.floor(i / SEED.length);
    const suffix = cycle > 0 ? ` ${cycle + 1}` : '';
    return {
      id: `site-${i + 1}`,
      name: `${base.name}${suffix}`.trim(),
      picName: base.picName,
      picAvatar: base.picAvatar,
      province: base.province,
      location: base.location,
      status: i % 17 === 0 && i > 0 ? 'inactive' : 'active',
    };
  });
}
