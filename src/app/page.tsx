import MasonryGrid from '@/components/gallery/MasonryGrid';

export default function Home() {
  return (
    <div className="w-full bg-white min-h-screen pb-20">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
            El arte de <br />
            <span className="font-medium">pintar con luz</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
            Bienvenido a CaptureAndFilms. Creemos en preservar emociones, luz e historias auténticas. Explora parte de nuestro trabajo más reciente a continuación.
          </p>
        </div>
        
        <div className="w-full">
          <MasonryGrid />
        </div>
      </section>
    </div>
  );
}
