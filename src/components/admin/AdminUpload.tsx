'use client';
import { db } from '../../lib/firebase.js';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, CheckCircle2, Image as ImageIcon, FolderPlus } from 'lucide-react';
import Image from 'next/image';

enum UploadState {
  IDLE,
  UPLOADING,
  SUCCESS,
  ERROR
}

export default function AdminUpload() {
  const [activeTab, setActiveTab] = useState<'album' | 'photos'>('album');
  const [albums, setAlbums] = useState<{id: string, title: string}[]>([]);

  // ALBUM STATE
  const [albumFile, setAlbumFile] = useState<File | null>(null);
  const [albumPreview, setAlbumPreview] = useState<string | null>(null);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumCategory, setAlbumCategory] = useState('Bodas');
  const [albumStatus, setAlbumStatus] = useState<UploadState>(UploadState.IDLE);

  // PHOTOS STATE
  const [photoFiles, setPhotoFiles] = useState<{file: File, preview: string}[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [photosStatus, setPhotosStatus] = useState<UploadState>(UploadState.IDLE);

  useEffect(() => {
    // Fetch albums for the dropdown
    const fetchAlbums = async () => {
      try {
        const q = query(collection(db, 'albums'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const fetchedAlbums = snap.docs.map(doc => ({ id: doc.id, title: doc.data().title }));
        setAlbums(fetchedAlbums);
        if (fetchedAlbums.length > 0) {
          setSelectedAlbumId(fetchedAlbums[0].id);
        }
      } catch (err) {
        console.error("Error fetching albums:", err);
      }
    };
    if (activeTab === 'photos') {
      fetchAlbums();
    }
  }, [activeTab]);

  // DROPZONES
  const onDropAlbum = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) {
      setAlbumFile(selected);
      setAlbumPreview(URL.createObjectURL(selected));
    }
  }, []);

  const onDropPhotos = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPhotoFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps: getAlbumProps, getInputProps: getAlbumInputProps, isDragActive: albumDrag } = useDropzone({
    onDrop: onDropAlbum,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif'] },
    maxFiles: 1,
  });

  const { getRootProps: getPhotosProps, getInputProps: getPhotosInputProps, isDragActive: photosDrag } = useDropzone({
    onDrop: onDropPhotos,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif'] },
  });

  // HANDLERS
  const handleRemoveAlbum = () => {
    setAlbumFile(null);
    if (albumPreview) URL.revokeObjectURL(albumPreview);
    setAlbumPreview(null);
    setAlbumStatus(UploadState.IDLE);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoFiles(prev => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleUploadAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumFile || !albumTitle) return;
    setAlbumStatus(UploadState.UPLOADING);

    try {
      const formData = new FormData();
      formData.append('file', albumFile);
      formData.append('upload_preset', 'capture_and_films');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const cloudinaryUrl = data.secure_url;
      if (!cloudinaryUrl) throw new Error("No URL Cloudinary");

      await addDoc(collection(db, 'albums'), {
        title: albumTitle,
        category: albumCategory,
        coverUrl: cloudinaryUrl,
        createdAt: new Date()
      });

      setAlbumStatus(UploadState.SUCCESS);
      setTimeout(() => {
        handleRemoveAlbum();
        setAlbumTitle('');
        setAlbumStatus(UploadState.IDLE);
      }, 3000);
    } catch (error) {
      console.error(error);
      setAlbumStatus(UploadState.ERROR);
    }
  };

  const handleUploadPhotos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photoFiles.length === 0 || !selectedAlbumId) return;
    setPhotosStatus(UploadState.UPLOADING);

    try {
      // Upload all photos in parallel
      const uploadPromises = photoFiles.map(async (pItem) => {
        const formData = new FormData();
        formData.append('file', pItem.file);
        formData.append('upload_preset', 'capture_and_films');
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        return data.secure_url;
      });

      const urls = await Promise.all(uploadPromises);

      // Save to Firebase
      const firestorePromises = urls.map(url => {
        if (!url) return Promise.resolve();
        return addDoc(collection(db, 'photos'), {
          albumId: selectedAlbumId,
          url: url,
          createdAt: new Date()
        });
      });

      await Promise.all(firestorePromises);

      setPhotosStatus(UploadState.SUCCESS);
      setTimeout(() => {
        setPhotoFiles([]);
        setPhotosStatus(UploadState.IDLE);
      }, 3000);
    } catch (error) {
      console.error(error);
      setPhotosStatus(UploadState.ERROR);
    }
  };

  // UI
  return (
    <div className="w-full">
      <div className="flex space-x-4 mb-8 border-b border-gray-100 pb-2">
        <button
          onClick={() => setActiveTab('album')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'album' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <FolderPlus size={18} /> Crear Álbum
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'photos' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <ImageIcon size={18} /> Subir Fotos
        </button>
      </div>

      {/* --- TAB 1: ALBUMS --- */}
      {activeTab === 'album' && (
        !albumFile ? (
          <div {...getAlbumProps()} className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${albumDrag ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
            <input {...getAlbumInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-900 font-medium mb-1">Arrastra la portada del álbum aquí</p>
            <p className="text-sm text-gray-500">o haz clic para seleccionar</p>
          </div>
        ) : (
          <form onSubmit={handleUploadAlbum} className="space-y-6">
            <div className="flex gap-6">
              <div className="relative w-48 h-64 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {albumPreview && <Image src={albumPreview} alt="Preview" fill className="object-cover" />}
                <button type="button" onClick={handleRemoveAlbum} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70" disabled={albumStatus === UploadState.UPLOADING}><X size={16} /></button>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label htmlFor="albumTitle" className="block text-sm font-medium text-gray-700 mb-1">Título del Álbum</label>
                  <input type="text" id="albumTitle" value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} required disabled={albumStatus === UploadState.UPLOADING} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none" placeholder="ej. Boda Ana y Luis" />
                </div>
                <div>
                  <label htmlFor="albumCategory" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select id="albumCategory" value={albumCategory} onChange={(e) => setAlbumCategory(e.target.value)} disabled={albumStatus === UploadState.UPLOADING} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none bg-white">
                    <option value="Bodas">Bodas</option>
                    <option value="Retratos">Retratos</option>
                    <option value="Comercial">Comercial</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={albumStatus === UploadState.UPLOADING || albumStatus === UploadState.SUCCESS || !albumTitle} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-black disabled:opacity-50">
                {albumStatus === UploadState.UPLOADING ? <><Loader2 className="animate-spin" size={18} /> Creando...</> : albumStatus === UploadState.SUCCESS ? <><CheckCircle2 className="text-green-400" size={18} /> Creado</> : 'Crear Álbum'}
              </button>
            </div>
          </form>
        )
      )}

      {/* --- TAB 2: PHOTOS --- */}
      {activeTab === 'photos' && (
        <form onSubmit={handleUploadPhotos} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label htmlFor="albumSelect" className="block text-sm font-medium text-gray-700 mb-1">Selecciona el Álbum</label>
            {albums.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no has creado ningún álbum. Crea uno primero.</p>
            ) : (
              <select id="albumSelect" value={selectedAlbumId} onChange={(e) => setSelectedAlbumId(e.target.value)} disabled={photosStatus === UploadState.UPLOADING} className="w-full max-w-sm px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none bg-white">
                {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            )}
          </div>

          <div {...getPhotosProps()} className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${photosDrag ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
            <input {...getPhotosInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-900 font-medium mb-1">Arrastra múltiples fotos aquí</p>
            <p className="text-sm text-gray-500">o haz clic para seleccionar</p>
          </div>

          {photoFiles.length > 0 && (
            <div className="space-y-4 p-6 bg-gray-50 border border-gray-100 rounded-xl">
              <h3 className="text-sm font-medium text-gray-700">{photoFiles.length} fotos listas para subir:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {photoFiles.map((pf, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <Image src={pf.preview} alt={`upload-${idx}`} fill className="object-cover" />
                    <button type="button" onClick={() => handleRemovePhoto(idx)} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black" disabled={photosStatus === UploadState.UPLOADING}><X size={12} /></button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                <button type="submit" disabled={photosStatus === UploadState.UPLOADING || photosStatus === UploadState.SUCCESS || !selectedAlbumId} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-black disabled:opacity-50">
                  {photosStatus === UploadState.UPLOADING ? <><Loader2 className="animate-spin" size={18} /> Subiendo {photoFiles.length} fotos...</> : photosStatus === UploadState.SUCCESS ? <><CheckCircle2 className="text-green-400" size={18} /> Completado</> : 'Subir todas al Álbum'}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
