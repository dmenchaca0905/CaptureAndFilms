import AdminUpload from '@/components/admin/AdminUpload';

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-xl font-medium text-gray-900 mb-6">Subir Nueva Foto</h2>
        <AdminUpload />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Subidas Recientes</h2>
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">
          <p>Aún no hay fotos subidas.</p>
          <p className="text-sm mt-2">Las imágenes subidas aparecerán aquí conectadas a Firestore.</p>
        </div>
      </div>
    </div>
  );
}
