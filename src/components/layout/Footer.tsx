import { Instagram, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-100 py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <h2 className="text-2xl font-light text-gray-900 mb-4" id="services">¿Listo para capturar tu momento?</h2>
        <p className="text-gray-500 max-w-xl mb-2">
          Fotografía y video para eventos sociales
        </p>
        <p className="text-gray-400 max-w-xl mb-8 font-medium">
          Saltillo, Coahuila
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link 
            href="https://wa.me/528441821744" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-colors"
          >
            <MessageCircle size={20} />
            Contactar por WhatsApp
          </Link>
          <Link 
            href="https://www.instagram.com/captureandfilms?igsh=anZwYnI4YXRnNXkx" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-black transition-colors"
          >
            <Instagram size={20} />
            Seguir en Instagram
          </Link>
        </div>

        <div className="text-sm text-gray-400 flex flex-col sm:flex-row justify-between w-full pt-8 border-t border-gray-200">
          <p>&copy; {new Date().getFullYear()} CaptureAndFilms. Todos los derechos reservados.</p>
          <p className="mt-2 sm:mt-0">Diseño de Borde a Borde</p>
        </div>
      </div>
    </footer>
  );
}
