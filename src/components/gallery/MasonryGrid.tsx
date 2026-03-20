'use client';

import { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import ImageCard from './ImageCard';
import { db } from '../../lib/firebase.js';
import { collection, getDocs, query, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface ImageItem {
  id: string;
  url: string;
  title: string;
  category: string;
  createdAt?: any;
}

const ITEMS_PER_PAGE = 50;

export default function MasonryGrid() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchInitialImages = async () => {
      try {
        const q = query(
          collection(db, 'albums'), 
          orderBy('createdAt', 'desc'),
          limit(ITEMS_PER_PAGE)
        );
        const querySnapshot = await getDocs(q);
        
        const fetchedImages: ImageItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedImages.push({ 
            id: doc.id, 
            url: data.coverUrl, // Map coverUrl to url for ImageCard
            title: data.title,
            category: data.category,
            href: `/album/${doc.id}`, // Add href for Album navigation
            ...data 
          } as ImageItem);
        });
        
        setImages(fetchedImages);
        
        // Save the last document for pagination
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastDoc(lastVisible || null);
        
        // If we fetched less than the limit, there are no more documents
        if (querySnapshot.docs.length < ITEMS_PER_PAGE) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error al cargar las imágenes de Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialImages();
  }, []);

  const loadMore = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);

    try {
      const q = query(
        collection(db, 'albums'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(ITEMS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(q);
      
      const newImages: ImageItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        newImages.push({ 
          id: doc.id, 
          url: data.coverUrl,
          title: data.title,
          category: data.category,
          href: `/album/${doc.id}`,
          ...data 
        } as ImageItem);
      });
      
      setImages((prev) => [...prev, ...newImages]);
      
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible || null);
      
      if (querySnapshot.docs.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error al cargar más imágenes:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  if (loading) {
    return (
      <div className="w-full text-center py-24">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Cargando...</span>
        </div>
        <p className="mt-4 text-gray-500 font-medium">Cargando portafolio...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full text-center py-24 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
        <p className="text-lg">Aún no hay fotos en el portafolio.</p>
        <p className="text-sm mt-2">Sube tus primeras fotos desde el Panel de Administración.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-full gap-6 auto-rows-auto mb-12"
        columnClassName="bg-clip-padding flex flex-col gap-6"
      >
        {images.map((img) => (
          <ImageCard key={img.id} {...img} />
        ))}
      </Masonry>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-8 shadow-sm"
        >
          {loadingMore ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Cargando...
            </>
          ) : (
            'Cargar Más Fotografías'
          )}
        </button>
      )}
    </div>
  );
}
