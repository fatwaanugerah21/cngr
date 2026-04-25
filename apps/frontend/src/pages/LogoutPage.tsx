import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSessionAuth } from '../lib/auth';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    clearSessionAuth();
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Sedang keluar…</p>
    </div>
  );
}
