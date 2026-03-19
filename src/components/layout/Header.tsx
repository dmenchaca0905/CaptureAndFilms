import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-medium tracking-tighter text-gray-900">CaptureAndFilms</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Portafolio</Link>
            <Link href="#services" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Servicios</Link>
            <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Administrador</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
