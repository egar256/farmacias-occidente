import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSucursales, getTurnos, getCuentas, createRegistro } from '../services/api';
import { formatCurrency, parseNumber } from '../utils/formatters';

function RegistroVentas() {
  const navigate = useNavigate();
  const [sucursales, setSucursales] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    sucursal_id: '',
    turno_id: '',
    correlativo_inicial: '',
    correlativo_final: '',
    cuenta_id: '',
    monto_depositado: '0',
    venta_tarjeta: '0',
    total_sistema: '0',
    gastos: '0',
    canjes: '0',
    observaciones: ''
  });
  const [calculated, setCalculated] = useState({
    total_ventas: 0,
    total_vendido: 0,
    total_facturado: 0
  });

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.monto_depositado, formData.venta_tarjeta, formData.total_sistema, formData.gastos, formData.canjes]);

  const loadFormData = async () => {
    try {
      const [sucursalesRes, turnosRes, cuentasRes] = await Promise.all([
        getSucursales(),
        getTurnos(),
        getCuentas()
      ]);
      
      setSucursales(sucursalesRes.data.filter(s => s.activo));
      setTurnos(turnosRes.data.filter(t => t.activo));
      setCuentas(cuentasRes.data.filter(c => c.activo));
    } catch (error) {
      console.error('Error loading form data:', error);
      alert('Error al cargar datos del formulario');
    }
  };

  const calculateTotals = () => {
    const depositado = parseNumber(formData.monto_depositado);
    const tarjeta = parseNumber(formData.venta_tarjeta);
    const sistema = parseNumber(formData.total_sistema);
    const gastos = parseNumber(formData.gastos);
    const canjes = parseNumber(formData.canjes);

    const total_ventas = depositado + tarjeta;
    const total_vendido = sistema - gastos - canjes;
    const total_facturado = total_ventas;

    setCalculated({
      total_ventas,
      total_vendido,
      total_facturado
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fecha || !formData.sucursal_id || !formData.turno_id) {
      alert('Por favor complete los campos requeridos: Fecha, Sucursal y Turno');
      return;
    }

    if (parseNumber(formData.monto_depositado) < 0 || parseNumber(formData.venta_tarjeta) < 0 ||
        parseNumber(formData.total_sistema) < 0 || parseNumber(formData.gastos) < 0 || 
        parseNumber(formData.canjes) < 0) {
      alert('Los campos monetarios deben ser mayores o iguales a 0');
      return;
    }

    setLoading(true);
    try {
      await createRegistro(formData);
      alert('Registro creado exitosamente');
      navigate('/listado-registros');
    } catch (error) {
      console.error('Error creating registro:', error);
      if (error.response?.data?.error?.includes('UNIQUE constraint failed')) {
        alert('Ya existe un registro para esta fecha, sucursal y turno');
      } else {
        alert('Error al crear registro: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Registro de Ventas por Turno</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sucursal <span className="text-red-500">*</span>
              </label>
              <select
                name="sucursal_id"
                value={formData.sucursal_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una sucursal</option>
                {sucursales.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turno <span className="text-red-500">*</span>
              </label>
              <select
                name="turno_id"
                value={formData.turno_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un turno</option>
                {turnos.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correlativo Inicial
              </label>
              <input
                type="text"
                name="correlativo_inicial"
                value={formData.correlativo_inicial}
                onChange={handleChange}
                placeholder="Ej: 001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correlativo Final
              </label>
              <input
                type="text"
                name="correlativo_final"
                value={formData.correlativo_final}
                onChange={handleChange}
                placeholder="Ej: 100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuenta de Depósito
              </label>
              <select
                name="cuenta_id"
                value={formData.cuenta_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una cuenta</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.numero} - {c.nombre} ({c.banco})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Depositado (Q)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="monto_depositado"
                value={formData.monto_depositado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venta con Tarjeta (Q)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="venta_tarjeta"
                value={formData.venta_tarjeta}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total de Ventas en Sistema (Q)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="total_sistema"
                value={formData.total_sistema}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gastos del Día (Q)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="gastos"
                value={formData.gastos}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canjes (Q)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="canjes"
                value={formData.canjes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Cálculos Automáticos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total de Ventas</div>
                <div className="text-xl font-bold text-blue-600">{formatCurrency(calculated.total_ventas)}</div>
                <div className="text-xs text-gray-500">Depósito + Tarjeta</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Vendido</div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(calculated.total_vendido)}</div>
                <div className="text-xs text-gray-500">Sistema - Gastos - Canjes</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Facturado</div>
                <div className="text-xl font-bold text-purple-600">{formatCurrency(calculated.total_facturado)}</div>
                <div className="text-xs text-gray-500">Igual a Total de Ventas</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Registro'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/listado-registros')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistroVentas;
