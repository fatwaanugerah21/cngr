import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/site-management': 'Manajemen Site',
  '/user-management': 'Manajemen Pengguna',
  '/production': 'Produksi',
  '/issue': 'Isu',
};

export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? 'Halaman';

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-500">Bagian ini belum tersedia.</p>
    </div>
  );
}
