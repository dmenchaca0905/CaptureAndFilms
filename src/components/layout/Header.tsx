import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-gray-50/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-medium tracking-tighter text-gray-900">CaptureAndFilms</span>
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
