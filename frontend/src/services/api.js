import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Sucursales
export const getSucursales = () => api.get('/sucursales');
export const getSucursal = (id) => api.get(`/sucursales/${id}`);
export const createSucursal = (data) => api.post('/sucursales', data);
export const updateSucursal = (id, data) => api.put(`/sucursales/${id}`, data);
export const deleteSucursal = (id) => api.delete(`/sucursales/${id}`);

// Turnos
export const getTurnos = () => api.get('/turnos');
export const getTurno = (id) => api.get(`/turnos/${id}`);
export const createTurno = (data) => api.post('/turnos', data);
export const updateTurno = (id, data) => api.put(`/turnos/${id}`, data);
export const deleteTurno = (id) => api.delete(`/turnos/${id}`);

// Cuentas
export const getCuentas = () => api.get('/cuentas');
export const getCuenta = (id) => api.get(`/cuentas/${id}`);
export const createCuenta = (data) => api.post('/cuentas', data);
export const updateCuenta = (id, data) => api.put(`/cuentas/${id}`, data);
export const deleteCuenta = (id) => api.delete(`/cuentas/${id}`);

// Distritos
export const getDistritos = () => api.get('/distritos');
export const getDistrito = (id) => api.get(`/distritos/${id}`);
export const createDistrito = (data) => api.post('/distritos', data);
export const updateDistrito = (id, data) => api.put(`/distritos/${id}`, data);
export const deleteDistrito = (id) => api.delete(`/distritos/${id}`);

// Registros
export const getRegistros = (params) => api.get('/registros', { params });
export const getRegistro = (id) => api.get(`/registros/${id}`);
export const createRegistro = (data) => api.post('/registros', data);
export const updateRegistro = (id, data) => api.put(`/registros/${id}`, data);
export const deleteRegistro = (id) => api.delete(`/registros/${id}`);
export const getResumenSucursal = (params) => api.get('/registros/resumen/sucursal', { params });

// Reportes
export const downloadReporteDetalle = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return `${API_BASE_URL}/reportes/detalle?${queryString}`;
};

export const downloadReporteResumenDiario = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return `${API_BASE_URL}/reportes/resumen-diario?${queryString}`;
};

export const downloadReporteResumenGlobal = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return `${API_BASE_URL}/reportes/resumen-global?${queryString}`;
};

// Depositos por Cuenta
export const getDepositosCuenta = (params) => api.get('/reportes/depositos-cuenta', { params });

export const downloadReporteDepositosCuenta = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return `${API_BASE_URL}/reportes/depositos-cuenta/excel?${queryString}`;
};

// Usuarios
export const getUsuarios = () => api.get('/usuarios');
export const getUsuario = (id) => api.get(`/usuarios/${id}`);
export const createUsuario = (data) => api.post('/usuarios', data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);

// Metas
export const getMetas = (params) => api.get('/metas', { params });
export const getMetaEspecifica = (sucursal_id, año, mes) => api.get(`/metas/${sucursal_id}/${año}/${mes}`);
export const createMeta = (data) => api.post('/metas', data);
export const updateMeta = (id, data) => api.put(`/metas/${id}`, data);
export const deleteMeta = (id) => api.delete(`/metas/${id}`);
export const getDashboardVentas = (params) => api.get('/reportes/dashboard-ventas', { params });

export default api;
