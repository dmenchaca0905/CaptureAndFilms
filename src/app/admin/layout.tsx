'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Verificando credenciales...</p>
      </div>
    );
  }

  if (!user) return null; // Avoid a flash before redirect

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Panel de Administración</h1>
            <p className="text-sm text-gray-500">Administra tu portafolio, sube imágenes y modera el contenido.</p>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      <div className="flex-1 container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
