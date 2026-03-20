'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import Masonry from 'react-masonry-css';
import ImageCard from '@/components/gallery/ImageCard';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function AlbumPage() {
  const { id } = useParams();
  const router = useRouter();
  const [photos, setPhotos] = useState<any[]>([]);
  const [albumData, setAlbumData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        if (!id) return;
        
        // Fetch Album Info
        const albumRef = doc(db, 'albums', id as string);
        const albumSnap = await getDoc(albumRef);
        if (albumSnap.exists()) {
          setAlbumData(albumSnap.data());
        }

        // Fetch Album Photos
        const q = query(
          collection(db, 'photos'),
          where('albumId', '==', id),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedPhotos = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setPhotos(fetchedPhotos);
      } catch (error) {
        console.error("Error fetching album:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full text-center py-32 flex flex-col items-center">
        <Loader2 className="animate-spin text-gray-900 w-8 h-8 mb-4" />
        <p className="text-gray-500 font-medium">Abriendo álbum...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen pb-20">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <button 
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Volver al Portafolio
        </button>
        
        <div className="max-w-3xl mb-12">
          {albumData ? (
            <>
              <p className="text-sm text-gray-400 font-medium uppercase tracking-widest mb-2">{albumData.category}</p>
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 tracking-tight">
                {albumData.title}
              </h1>
              <p className="text-gray-500">Un total de {photos.length} fotografías exclusivas.</p>
            </>
          ) : (
            <h1 className="text-3xl font-light text-gray-900">Álbum Desconocido</h1>
          )}
        </div>
        
        {photos.length === 0 ? (
          <div className="w-full text-center py-24 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-lg">Este álbum aún no tiene fotos.</p>
          </div>
        ) : (
          <div className="w-full">
            <Masonry
              breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
              className="flex w-full gap-6 auto-rows-auto mb-12"
              columnClassName="bg-clip-padding flex flex-col gap-6"
            >
              {photos.map((photo) => (
                <ImageCard key={photo.id} id={photo.id} url={photo.url} />
              ))}
            </Masonry>
          </div>
        )}
      </section>
    </div>
  );
}
