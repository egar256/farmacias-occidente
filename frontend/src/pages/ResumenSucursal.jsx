import { useState, useEffect } from 'react';
import { getResumenSucursal, getSucursales } from '../services/api';
import { formatCurrency } from '../utils/formatters';

function ResumenSucursal() {
  const [resumen, setResumen] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    sucursal_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resumenRes, sucursalesRes] = await Promise.all([
        getResumenSucursal(),
        getSucursales()
      ]);
      
      setResumen(resumenRes.data);
      setSucursales(sucursalesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.fecha_inicio) params.fecha_inicio = filters.fecha_inicio;
      if (filters.fecha_fin) params.fecha_fin = filters.fecha_fin;
      if (filters.sucursal_id) params.sucursal_id = filters.sucursal_id;
      
      const response = await getResumenSucursal(params);
      setResumen(response.data);
    } catch (error) {
      console.error('Error applying filters:', error);
      alert('Error al aplicar filtros');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      fecha_inicio: '',
      fecha_fin: '',
      sucursal_id: ''
    });
    loadData();
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Resumen por Sucursal</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              name="fecha_inicio"
              value={filters.fecha_inicio}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              name="fecha_fin"
              value={filters.fecha_fin}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sucursal
            </label>
            <select
              name="sucursal_id"
              value={filters.sucursal_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {sucursales.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {resumen.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay datos para mostrar
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Depositado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Tarjeta</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sistema</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Facturado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total No Facturado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Meta</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resumen.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.sucursal_nombre}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {formatCurrency(item.total_depositado)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {formatCurrency(item.total_tarjeta)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {formatCurrency(item.total_sistema)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                      {formatCurrency(item.total_facturado)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-orange-600 font-medium">
                      {formatCurrency(item.total_no_facturado)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-600 font-bold">
                      {formatCurrency(item.total_meta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumenSucursal;
