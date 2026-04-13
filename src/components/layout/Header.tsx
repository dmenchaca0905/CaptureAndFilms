import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-gray-50/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row min-h-[64px] items-center justify-between py-2 sm:py-0 gap-2 sm:gap-0">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <Image 
              src="/logo-app.png" 
              alt="CaptureAndFilms Logo" 
              width={100} 
              height={48} 
              className="h-8 md:h-12 w-auto object-contain"
              priority
            />
            <span className="text-xl md:text-3xl font-medium tracking-tighter text-gray-900 leading-none">
              CaptureAndFilms
            </span>
          </Link>
          <nav className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Portafolio</Link>
            <Link href="#services" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Servicios</Link>
            <Link href="/admin" className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Administrador</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
