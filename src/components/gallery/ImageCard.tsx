'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface ImageCardProps {
  id: string;
  url: string;
  title?: string;
  category?: string;
  href?: string;
}

export default function ImageCard({ id, url, title, category, href }: ImageCardProps) {
  const content = (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative group mb-6 overflow-hidden bg-gray-100 cursor-pointer"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="relative w-full" style={{ paddingBottom: '120%' }}>
        <Image
          src={url}
          alt={title || "Fotografía"}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
      </div>
      {(title || category) && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 select-none pointer-events-none">
          {title && <h3 className="text-white font-medium text-lg">{title}</h3>}
          {category && <p className="text-gray-200 text-sm">{category}</p>}
        </div>
      )}
    </motion.div>
  );

  if (href) {
    return <Link href={href} className="block w-full">{content}</Link>;
  }

  return content;
}
