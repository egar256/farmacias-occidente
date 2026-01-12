import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRegistros, getSucursales } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

function Dashboard() {
  const [stats, setStats] = useState({
    totalRegistros: 0,
    totalSucursales: 0,
    totalVentasHoy: 0,
    registrosRecientes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [registrosResponse, sucursalesResponse, registrosHoyResponse] = await Promise.all([
        getRegistros({ fecha_inicio: today }),
        getSucursales(),
        getRegistros({ fecha_inicio: today, fecha_fin: today })
      ]);
      
      const registrosRecientes = registrosResponse.data.slice(0, 5);
      const totalVentasHoy = registrosHoyResponse.data.reduce((sum, r) => sum + parseFloat(r.total_ventas || 0), 0);
      
      setStats({
        totalRegistros: registrosResponse.data.length,
        totalSucursales: sucursalesResponse.data.length,
        totalVentasHoy,
        registrosRecientes
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Total Sucursales</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{stats.totalSucursales}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Registros Hoy</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.totalRegistros}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Ventas Hoy</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">{formatCurrency(stats.totalVentasHoy)}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Registros Recientes</h2>
        </div>
        <div className="p-6">
          {stats.registrosRecientes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay registros recientes</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turno</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Ventas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.registrosRecientes.map((registro) => (
                    <tr key={registro.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(registro.fecha)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{registro.sucursal?.nombre}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{registro.turno?.nombre}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                        {formatCurrency(registro.total_ventas)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Link
          to="/registro-ventas"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
        >
          Nuevo Registro de Ventas
        </Link>
        <Link
          to="/reportes"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
        >
          Ver Reportes
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
