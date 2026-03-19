'use client';
import { db } from '../../lib/firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

enum UploadState {
  IDLE,
  UPLOADING,
  SUCCESS,
  ERROR
}

export default function AdminUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Weddings');
  const [status, setStatus] = useState<UploadState>(UploadState.IDLE);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) {
      setFile(selected);
      const objUrl = URL.createObjectURL(selected);
      setPreview(objUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif']
    },
    maxFiles: 1,
  });

  const handleRemove = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setStatus(UploadState.IDLE);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setStatus(UploadState.UPLOADING);

    try {
      // 1. Preparamos el paquete para Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'capture_and_films');

      // 2. Enviamos la imagen a la nube (Cloudinary)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await res.json();
      const cloudinaryUrl = data.secure_url;

      if (!cloudinaryUrl) {
        throw new Error("No se pudo obtener la URL de Cloudinary. Revisa tu Preset.");
      }

      // 3. Guardamos la referencia en tu base de datos (Firebase)
      await addDoc(collection(db, 'images'), {
        title: title,
        category: category,
        url: cloudinaryUrl,
        createdAt: new Date()
      });

      console.log("¡Éxito! Foto guardada en CaptureAndFilms");
      setStatus(UploadState.SUCCESS);

      // Limpieza automática
      setTimeout(() => {
        handleRemove();
        setTitle('');
        setStatus(UploadState.IDLE);
      }, 3000);

    } catch (error) {
      console.error("Error en la subida:", error);
      setStatus(UploadState.ERROR);
    }
  };
  return (
    <div className="w-full">
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-900 font-medium mb-1">
            Arrastra y suelta una imagen aquí
          </p>
          <p className="text-sm text-gray-500">
            o haz clic para seleccionar de tu computadora
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Soporta JPEG, PNG, WEBP (Máx 10MB)
          </p>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="flex gap-6">
            <div className="relative w-48 h-64 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {preview && (
                <Image 
                  src={preview} 
                  alt="Preview" 
                  fill
                  className="object-cover"
                />
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                disabled={status === UploadState.UPLOADING}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título de la Imagen</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="ej. El Beso en la Hora Dorada"
                  required
                  disabled={status === UploadState.UPLOADING}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                  disabled={status === UploadState.UPLOADING}
                >
                  <option value="Weddings">Bodas</option>
                  <option value="Portraits">Retratos</option>
                  <option value="Commercial">Comercial</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-gray-100 pt-6">
            <button
              type="submit"
              disabled={status === UploadState.UPLOADING || status === UploadState.SUCCESS || !title}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === UploadState.UPLOADING ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Subiendo...
                </>
              ) : status === UploadState.SUCCESS ? (
                <>
                  <CheckCircle2 className="text-green-400" size={18} />
                  Subido
                </>
              ) : (
                'Subir a la Galería'
              )}
            </button>
          </div>
          
          {status === UploadState.ERROR && (
            <p className="text-red-500 text-sm mt-2 text-right">La subida falló. Por favor, intenta de nuevo.</p>
          )}
        </form>
      )}
    </div>
  );
}
