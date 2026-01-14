import { useState, useEffect } from 'react';
import { getSucursales, getDashboardVentas, getMetas, createMeta } from '../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

function DashboardMetas() {
  const currentDate = new Date();
  const [filters, setFilters] = useState({
    anio: currentDate.getFullYear(),
    mes: currentDate.getMonth() + 1,
    sucursal_id: '',
    fecha_corte: currentDate.toISOString().split('T')[0]
  });
  
  const [sucursales, setSucursales] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [metasConfig, setMetasConfig] = useState([]);

  useEffect(() => {
    loadSucursales();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadSucursales = async () => {
    try {
      const response = await getSucursales();
      setSucursales(response.data);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const params = {
        anio: filters.anio,
        mes: filters.mes,
        fecha_corte: filters.fecha_corte
      };
      if (filters.sucursal_id) {
        params.sucursal_id = filters.sucursal_id;
      }
      
      const response = await getDashboardVentas(params);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      setDashboardData([]);
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

  const handleOpenModal = async () => {
    try {
      const response = await getMetas({ anio: filters.anio, mes: filters.mes });
      const metasMap = {};
      response.data.forEach(meta => {
        metasMap[meta.sucursal_id] = meta.meta;
      });
      
      const config = sucursales.map(sucursal => ({
        sucursal_id: sucursal.id,
        sucursal_nombre: sucursal.nombre,
        meta: metasMap[sucursal.id] || 0
      }));
      
      setMetasConfig(config);
      setShowModal(true);
    } catch (error) {
      console.error('Error al cargar metas:', error);
    }
  };

  const handleMetaChange = (sucursalId, value) => {
    setMetasConfig(prev => prev.map(item => 
      item.sucursal_id === sucursalId 
        ? { ...item, meta: parseFloat(value) || 0 }
        : item
    ));
  };

  const handleSaveMetas = async () => {
    try {
      for (const config of metasConfig) {
        await createMeta({
          sucursal_id: config.sucursal_id,
          anio: filters.anio,
          mes: filters.mes,
          meta: config.meta
        });
      }
      setShowModal(false);
      loadDashboardData();
      alert('Metas guardadas exitosamente');
    } catch (error) {
      console.error('Error al guardar metas:', error);
      alert('Error al guardar metas');
    }
  };

  const getColorByPercentage = (pct) => {
    if (pct >= 1.0) return '#10B981'; // Verde
    if (pct >= 0.95) return '#F59E0B'; // Amarillo
    if (pct >= 0.90) return '#3B82F6'; // Azul
    return '#D83636'; // Rojo
  };

  const formatCurrency = (value) => {
    return `Q${parseFloat(value).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Calculate totals
  const totales = dashboardData.reduce((acc, item) => {
    acc.total_ventas += item.total_ventas;
    acc.total_meta += item.meta;
    acc.total_proyeccion += item.proyeccion;
    return acc;
  }, { total_ventas: 0, total_meta: 0, total_proyeccion: 0 });

  const pct_alcanzado_total = totales.total_meta > 0 ? totales.total_ventas / totales.total_meta : 0;

  // Prepare data for bar chart (sorted by percentage descending)
  const barChartData = [...dashboardData]
    .sort((a, b) => b.pct_actual - a.pct_actual)
    .map(item => ({
      nombre: item.sucursal_nombre,
      porcentaje: item.pct_actual * 100,
      color: getColorByPercentage(item.pct_actual)
    }));

  // Prepare data for line chart (daily sales)
  const getDailySalesData = () => {
    // This is a placeholder - in a real implementation, you'd need daily data from the backend
    // For now, we'll show a simple projection line
    const diasMes = dashboardData[0]?.dias_mes || 30;
    const data = [];
    
    for (let dia = 1; dia <= diasMes; dia++) {
      data.push({
        dia,
        ventas: 0 // This should come from actual daily data
      });
    }
    
    return data;
  };

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard de Metas y Ventas</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <input
              type="number"
              name="anio"
              value={filters.anio}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
            <select
              name="mes"
              value={filters.mes}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {meses.map(mes => (
                <option key={mes.value} value={mes.value}>{mes.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sucursal</label>
            <select
              name="sucursal_id"
              value={filters.sucursal_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {sucursales.map(sucursal => (
                <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Corte</label>
            <input
              type="date"
              name="fecha_corte"
              value={filters.fecha_corte}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleOpenModal}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
            >
              Configurar Metas
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Ventas</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totales.total_ventas)}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Meta</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totales.total_meta)}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Proyección Total</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totales.total_proyeccion)}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">% Alcanzado</h3>
              <p 
                className="text-2xl font-bold"
                style={{ color: getColorByPercentage(pct_alcanzado_total) }}
              >
                {formatPercentage(pct_alcanzado_total)}
              </p>
            </div>
          </div>

          {/* Sucursales Table */}
          <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Meta</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Actual</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Proyección</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Proy</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Desvío</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.map((item) => (
                    <tr key={item.sucursal_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.sucursal_nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(item.total_ventas)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(item.meta)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold"
                          style={{ color: getColorByPercentage(item.pct_actual) }}>
                        {formatPercentage(item.pct_actual)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(item.proyeccion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold"
                          style={{ color: getColorByPercentage(item.pct_proyectado) }}>
                        {formatPercentage(item.pct_proyectado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {item.dias_con_ventas}/{item.dias_mes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold"
                          style={{ color: item.desvio >= 0 ? '#10B981' : '#D83636' }}>
                        {formatCurrency(item.desvio)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">% Alcanzado por Sucursal</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="nombre" type="category" width={100} />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="porcentaje">
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas Diarias del Mes</h3>
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>Gráfico de ventas diarias (requiere datos diarios del backend)</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal for Configuring Goals */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Configurar Metas - {meses.find(m => m.value === filters.mes)?.label} {filters.anio}
              </h2>
            </div>
            
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-140px)]">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sucursal</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Meta Mensual (Q)</th>
                  </tr>
                </thead>
                <tbody>
                  {metasConfig.map((config) => (
                    <tr key={config.sucursal_id} className="border-t">
                      <td className="px-4 py-2 text-sm text-gray-900">{config.sucursal_nombre}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={config.meta}
                          onChange={(e) => handleMetaChange(config.sucursal_id, e.target.value)}
                          className="w-full px-3 py-2 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMetas}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
              >
                Guardar Metas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardMetas;
