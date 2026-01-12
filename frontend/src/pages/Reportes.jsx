import { useState } from 'react';
import { downloadReporteDetalle, downloadReporteResumenDiario, downloadReporteResumenGlobal } from '../services/api';

function Reportes() {
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDownload = (reportType) => {
    const params = {};
    if (filters.fecha_inicio) params.fecha_inicio = filters.fecha_inicio;
    if (filters.fecha_fin) params.fecha_fin = filters.fecha_fin;

    let url;
    switch (reportType) {
      case 'detalle':
        url = downloadReporteDetalle(params);
        break;
      case 'resumen-diario':
        url = downloadReporteResumenDiario(params);
        break;
      case 'resumen-global':
        url = downloadReporteResumenGlobal(params);
        break;
      default:
        return;
    }

    window.open(url, '_blank');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Reportes Excel</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Rango de Fechas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Dejar en blanco para exportar todos los registros
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Reporte 1</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Detalle por turno/sucursal con indicador de faltantes
          </p>
          <button
            onClick={() => handleDownload('detalle')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
          >
            Descargar Excel
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Reporte 2</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Resumen diario del mes con bandera de faltante
          </p>
          <button
            onClick={() => handleDownload('resumen-diario')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
          >
            Descargar Excel
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Reporte 3</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Resumen global de todas las sucursales
          </p>
          <button
            onClick={() => handleDownload('resumen-global')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
          >
            Descargar Excel
          </button>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Información sobre los reportes</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Reporte 1:</strong> Incluye todos los turnos con sus detalles completos y marca los registros con faltante (diferencia negativa entre ventas y sistema)</li>
          <li>• <strong>Reporte 2:</strong> Agrupa por día y sucursal, incluye columna "Tiene Faltante" (SÍ/NO)</li>
          <li>• <strong>Reporte 3:</strong> Resumen consolidado por sucursal con totales generales, incluye total no facturado (cuentas especiales) y total meta</li>
        </ul>
      </div>
    </div>
  );
}

export default Reportes;
