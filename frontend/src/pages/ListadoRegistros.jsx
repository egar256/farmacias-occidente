import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRegistros, getSucursales, getTurnos, deleteRegistro } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { FaPencilAlt } from 'react-icons/fa';

function ListadoRegistros() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    sucursal_id: '',
    turno_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [registrosRes, sucursalesRes, turnosRes] = await Promise.all([
        getRegistros(),
        getSucursales(),
        getTurnos()
      ]);
      
      setRegistros(registrosRes.data);
      setSucursales(sucursalesRes.data);
      setTurnos(turnosRes.data);
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
      if (filters.turno_id) params.turno_id = filters.turno_id;
      
      const response = await getRegistros(params);
      setRegistros(response.data);
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
      sucursal_id: '',
      turno_id: ''
    });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este registro?')) {
      return;
    }
    
    try {
      await deleteRegistro(id);
      alert('Registro eliminado exitosamente');
      loadData();
    } catch (error) {
      console.error('Error deleting registro:', error);
      alert('Error al eliminar registro');
    }
  };

  const handleEdit = (id) => {
    navigate(`/registro-ventas?id=${id}`);
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Listado de Registros</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Turno
            </label>
            <select
              name="turno_id"
              value={filters.turno_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {turnos.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
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
        {registros.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay registros para mostrar
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turno</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correlativo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Depositado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tarjeta</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Ventas</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sistema</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gastos</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Canjes</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Faltante</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registros.map((registro) => {
                  // Faltante = total_sistema - (monto_depositado + venta_tarjeta + gastos)
                  // Canjes NO se resta, es solo informativo
                  const totalSistema = parseFloat(registro.total_sistema || 0);
                  const montoDepositado = parseFloat(registro.monto_depositado || 0);
                  const ventaTarjeta = parseFloat(registro.venta_tarjeta || 0);
                  const gastos = parseFloat(registro.gastos || 0);
                  const faltante = totalSistema - (montoDepositado + ventaTarjeta + gastos);
                  const tieneFaltante = faltante < 0;
                  
                  // Format correlativo display
                  let correlativoDisplay = '';
                  if (registro.correlativo_inicial && registro.correlativo_final) {
                    correlativoDisplay = `${registro.correlativo_inicial} - ${registro.correlativo_final}`;
                  } else if (registro.correlativo_inicial) {
                    correlativoDisplay = registro.correlativo_inicial;
                  } else if (registro.correlativo_final) {
                    correlativoDisplay = registro.correlativo_final;
                  }
                  
                  return (
                    <tr key={registro.id} className={tieneFaltante ? 'bg-red-50' : ''}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(registro.fecha)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{registro.sucursal?.nombre}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{registro.turno?.nombre}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{correlativoDisplay}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        {formatCurrency(registro.monto_depositado)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        {formatCurrency(registro.venta_tarjeta)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                        {formatCurrency(registro.total_ventas)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        {formatCurrency(registro.total_sistema)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        {formatCurrency(registro.gastos)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-600">
                        {formatCurrency(registro.canjes)}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${tieneFaltante ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(faltante)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() => handleEdit(registro.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium mr-3 inline-flex items-center"
                          title="Editar"
                        >
                          <FaPencilAlt className="mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(registro.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListadoRegistros;
