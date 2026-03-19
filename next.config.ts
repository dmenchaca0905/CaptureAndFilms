/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // El más importante para tus fotos
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Para que no te dé el error de la captura
      },
    ],
  },
};

export default nextConfig;