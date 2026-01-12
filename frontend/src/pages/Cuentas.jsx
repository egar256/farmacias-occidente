import { useState, useEffect } from 'react';
import { getCuentas, createCuenta, updateCuenta, deleteCuenta } from '../services/api';

function Cuentas() {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    nombre: '',
    banco: '',
    es_especial: false,
    activo: true
  });

  useEffect(() => {
    loadCuentas();
  }, []);

  const loadCuentas = async () => {
    try {
      setLoading(true);
      const response = await getCuentas();
      setCuentas(response.data);
    } catch (error) {
      console.error('Error loading cuentas:', error);
      alert('Error al cargar cuentas');
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
    
    if (!formData.numero.trim() || !formData.nombre.trim() || !formData.banco.trim()) {
      alert('Todos los campos son requeridos');
      return;
    }

    try {
      if (editingId) {
        await updateCuenta(editingId, formData);
        alert('Cuenta actualizada exitosamente');
      } else {
        await createCuenta(formData);
        alert('Cuenta creada exitosamente');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ numero: '', nombre: '', banco: '', es_especial: false, activo: true });
      loadCuentas();
    } catch (error) {
      console.error('Error saving cuenta:', error);
      alert('Error al guardar cuenta: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (cuenta) => {
    setEditingId(cuenta.id);
    setFormData({
      numero: cuenta.numero,
      nombre: cuenta.nombre,
      banco: cuenta.banco,
      es_especial: cuenta.es_especial,
      activo: cuenta.activo
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta cuenta?')) {
      return;
    }
    
    try {
      await deleteCuenta(id);
      alert('Cuenta eliminada exitosamente');
      loadCuentas();
    } catch (error) {
      console.error('Error deleting cuenta:', error);
      alert('Error al eliminar cuenta');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ numero: '', nombre: '', banco: '', es_especial: false, activo: true });
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
        <h1 className="text-3xl font-bold text-gray-800">Cuentas de Depósito</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
        >
          Nueva Cuenta
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId ? 'Editar Cuenta' : 'Nueva Cuenta'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cuenta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                  Banco <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="banco"
                  value={formData.banco}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="es_especial"
                    checked={formData.es_especial}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Cuenta Especial
                  </label>
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
            </div>

            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Las cuentas especiales se usan para calcular el "Total no facturado" en los reportes.
              </p>
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
        {cuentas.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay cuentas registradas
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banco</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cuentas.map((cuenta) => (
                <tr key={cuenta.id} className={cuenta.es_especial ? 'bg-orange-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{cuenta.numero}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{cuenta.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{cuenta.banco}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cuenta.es_especial ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                      {cuenta.es_especial ? 'Especial' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cuenta.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {cuenta.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => handleEdit(cuenta)}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cuenta.id)}
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

export default Cuentas;
