import { useState, useEffect } from 'react';
import { getSucursales, createSucursal, updateSucursal, deleteSucursal } from '../services/api';

function Sucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    activo: true
  });

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    try {
      setLoading(true);
      const response = await getSucursales();
      setSucursales(response.data);
    } catch (error) {
      console.error('Error loading sucursales:', error);
      alert('Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    try {
      if (editingId) {
        await updateSucursal(editingId, formData);
        alert('Sucursal actualizada exitosamente');
      } else {
        await createSucursal(formData);
        alert('Sucursal creada exitosamente');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ nombre: '', direccion: '', activo: true });
      loadSucursales();
    } catch (error) {
      console.error('Error saving sucursal:', error);
      alert('Error al guardar sucursal: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (sucursal) => {
    setEditingId(sucursal.id);
    setFormData({
      nombre: sucursal.nombre,
      direccion: sucursal.direccion || '',
      activo: sucursal.activo
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta sucursal?')) {
      return;
    }
    
    try {
      await deleteSucursal(id);
      alert('Sucursal eliminada exitosamente');
      loadSucursales();
    } catch (error) {
      console.error('Error deleting sucursal:', error);
      alert('Error al eliminar sucursal');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nombre: '', direccion: '', activo: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sucursales</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
        >
          Nueva Sucursal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId ? 'Editar Sucursal' : 'Nueva Sucursal'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Activo
                </label>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sucursales.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay sucursales registradas
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sucursales.map((sucursal) => (
                <tr key={sucursal.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{sucursal.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{sucursal.direccion || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sucursal.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {sucursal.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => handleEdit(sucursal)}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(sucursal.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Sucursales;
