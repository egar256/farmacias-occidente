import { useState, useEffect } from 'react';
import { getDepositosCuenta, downloadReporteDepositosCuenta, getSucursales, getCuentas } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { FaDownload, FaSearch } from 'react-icons/fa';

function ReporteDepositos() {
  const [loading, setLoading] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [filters, setFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    cuenta_id: '',
    sucursal_id: ''
  });
  const [data, setData] = useState({
    resumen_por_cuenta: [],
    detalle: [],
    totales: {
      total_general: 0,
      total_cuentas_normales: 0,
      total_cuentas_especiales: 0
    }
  });

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [sucursalesRes, cuentasRes] = await Promise.all([
        getSucursales(),
        getCuentas()
      ]);
      
      setSucursales(sucursalesRes.data.filter(s => s.activo));
      setCuentas(cuentasRes.data.filter(c => c.activo));
    } catch (error) {
      console.error('Error loading form data:', error);
      alert('Error al cargar datos del formulario');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde;
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta;
      if (filters.cuenta_id) params.cuenta_id = filters.cuenta_id;
      if (filters.sucursal_id) params.sucursal_id = filters.sucursal_id;
      
      const response = await getDepositosCuenta(params);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error al buscar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const params = {};
    if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde;
    if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta;
    if (filters.cuenta_id) params.cuenta_id = filters.cuenta_id;
    if (filters.sucursal_id) params.sucursal_id = filters.sucursal_id;
    
    const url = downloadReporteDepositosCuenta(params);
    // Use anchor tag for better SPA compatibility
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reporte-depositos-cuenta.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Depósitos por Cuenta</h1>
      
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Desde
            </label>
            <input
              type="date"
              name="fecha_desde"
              value={filters.fecha_desde}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Hasta
            </label>
            <input
              type="date"
              name="fecha_hasta"
              value={filters.fecha_hasta}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuenta
            </label>
            <select
              name="cuenta_id"
              value={filters.cuenta_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {cuentas.map(c => (
                <option key={c.id} value={c.id}>
                  {c.numero} - {c.nombre}
                </option>
              ))}
            </select>
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
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition disabled:opacity-50 inline-flex items-center"
          >
            <FaSearch className="mr-2" />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition inline-flex items-center"
          >
            <FaDownload className="mr-2" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Resumen por Cuenta Section */}
      {data.resumen_por_cuenta.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen por Cuenta</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuenta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banco</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Depositado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"># Depósitos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.resumen_por_cuenta.map((cuenta) => (
                  <tr 
                    key={cuenta.cuenta_id}
                    className={cuenta.es_especial ? 'bg-yellow-50' : ''}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {cuenta.cuenta_numero} - {cuenta.cuenta_nombre}
                      {cuenta.es_especial && (
                        <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                          ESPECIAL
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{cuenta.banco}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold">
                      {formatCurrency(cuenta.total_depositado)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {cuenta.cantidad_depositos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detalle de Depósitos Section */}
      {data.detalle.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Detalle de Depósitos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turno</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuenta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banco</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.detalle.map((item) => (
                  <tr 
                    key={item.id}
                    className={item.es_especial ? 'bg-yellow-50' : ''}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(item.fecha)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.sucursal_nombre}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.turno_nombre}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {item.cuenta_numero} - {item.cuenta_nombre}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.banco}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold">
                      {formatCurrency(item.monto_depositado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Totales Section */}
      {data.resumen_por_cuenta.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Totales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total General</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(data.totales.total_general)}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Cuentas Normales</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.totales.total_cuentas_normales)}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Cuentas Especiales (No Facturado)</div>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(data.totales.total_cuentas_especiales)}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && data.resumen_por_cuenta.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No hay datos para mostrar. Use los filtros y presione "Buscar".
        </div>
      )}
    </div>
  );
}

export default ReporteDepositos;
