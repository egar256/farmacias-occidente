import ExcelJS from 'exceljs';
import { RegistroTurno, Sucursal, Turno, Cuenta } from '../models/index.js';
import { Op } from 'sequelize';

// Helper function to format currency
function formatCurrency(value) {
  return `Q ${parseFloat(value || 0).toFixed(2)}`;
}

// Reporte 1: Detalle por turno/sucursal con faltantes
export async function generateDetalleReport(fecha_inicio, fecha_fin) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Detalle por Turno');
  
  // Headers
  worksheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 12 },
    { header: 'Sucursal', key: 'sucursal', width: 20 },
    { header: 'Turno', key: 'turno', width: 15 },
    { header: 'Correlativo', key: 'correlativo', width: 12 },
    { header: 'Cuenta', key: 'cuenta', width: 25 },
    { header: 'Monto Depositado', key: 'monto_depositado', width: 18 },
    { header: 'Venta Tarjeta', key: 'venta_tarjeta', width: 15 },
    { header: 'Total Ventas', key: 'total_ventas', width: 15 },
    { header: 'Total Sistema', key: 'total_sistema', width: 15 },
    { header: 'Gastos', key: 'gastos', width: 12 },
    { header: 'Canjes', key: 'canjes', width: 12 },
    { header: 'Total Vendido', key: 'total_vendido', width: 15 },
    { header: 'Total Facturado', key: 'total_facturado', width: 17 },
    { header: 'Faltante', key: 'faltante', width: 12 },
    { header: 'Observaciones', key: 'observaciones', width: 30 }
  ];
  
  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  
  // Get data
  const where = {};
  if (fecha_inicio && fecha_fin) {
    where.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
  }
  
  const registros = await RegistroTurno.findAll({
    where,
    include: [
      { model: Sucursal, as: 'sucursal' },
      { model: Turno, as: 'turno' },
      { model: Cuenta, as: 'cuenta' }
    ],
    order: [['fecha', 'ASC'], ['sucursal_id', 'ASC'], ['turno_id', 'ASC']]
  });
  
  // Add data rows
  registros.forEach(registro => {
    const totalVentas = parseFloat(registro.total_ventas || 0);
    const totalSistema = parseFloat(registro.total_sistema || 0);
    const faltante = totalVentas - totalSistema;
    
    const row = worksheet.addRow({
      fecha: registro.fecha,
      sucursal: registro.sucursal?.nombre || '',
      turno: registro.turno?.nombre || '',
      correlativo: registro.correlativo_ventas || '',
      cuenta: registro.cuenta ? `${registro.cuenta.numero} - ${registro.cuenta.nombre}` : '',
      monto_depositado: parseFloat(registro.monto_depositado || 0),
      venta_tarjeta: parseFloat(registro.venta_tarjeta || 0),
      total_ventas: parseFloat(registro.total_ventas || 0),
      total_sistema: parseFloat(registro.total_sistema || 0),
      gastos: parseFloat(registro.gastos || 0),
      canjes: parseFloat(registro.canjes || 0),
      total_vendido: parseFloat(registro.total_vendido || 0),
      total_facturado: parseFloat(registro.total_facturado || 0),
      faltante: faltante,
      observaciones: registro.observaciones || ''
    });
    
    // Highlight faltante if negative
    if (faltante < 0) {
      row.getCell('faltante').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' }
      };
      row.getCell('faltante').font = { color: { argb: 'FFFFFFFF' } };
    }
    
    // Format currency columns
    ['monto_depositado', 'venta_tarjeta', 'total_ventas', 'total_sistema', 'gastos', 'canjes', 'total_vendido', 'total_facturado', 'faltante'].forEach(col => {
      row.getCell(col).numFmt = '"Q"#,##0.00';
    });
  });
  
  return workbook;
}

// Reporte 2: Resumen diario del mes con bandera de faltante
export async function generateResumenDiarioReport(fecha_inicio, fecha_fin) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Resumen Diario');
  
  // Headers
  worksheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 12 },
    { header: 'Sucursal', key: 'sucursal', width: 20 },
    { header: 'Total Depositado', key: 'total_depositado', width: 18 },
    { header: 'Total Tarjeta', key: 'total_tarjeta', width: 15 },
    { header: 'Total Ventas', key: 'total_ventas', width: 15 },
    { header: 'Total Sistema', key: 'total_sistema', width: 15 },
    { header: 'Total Facturado', key: 'total_facturado', width: 17 },
    { header: 'Faltante', key: 'faltante', width: 12 },
    { header: 'Tiene Faltante', key: 'tiene_faltante', width: 15 }
  ];
  
  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  
  // Get data
  const where = {};
  if (fecha_inicio && fecha_fin) {
    where.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
  }
  
  const registros = await RegistroTurno.findAll({
    where,
    include: [
      { model: Sucursal, as: 'sucursal' }
    ],
    order: [['fecha', 'ASC'], ['sucursal_id', 'ASC']]
  });
  
  // Group by fecha and sucursal
  const resumen = {};
  
  registros.forEach(registro => {
    const key = `${registro.fecha}_${registro.sucursal_id}`;
    
    if (!resumen[key]) {
      resumen[key] = {
        fecha: registro.fecha,
        sucursal: registro.sucursal?.nombre || '',
        total_depositado: 0,
        total_tarjeta: 0,
        total_ventas: 0,
        total_sistema: 0,
        total_facturado: 0
      };
    }
    
    resumen[key].total_depositado += parseFloat(registro.monto_depositado || 0);
    resumen[key].total_tarjeta += parseFloat(registro.venta_tarjeta || 0);
    resumen[key].total_ventas += parseFloat(registro.total_ventas || 0);
    resumen[key].total_sistema += parseFloat(registro.total_sistema || 0);
    resumen[key].total_facturado += parseFloat(registro.total_facturado || 0);
  });
  
  // Add data rows
  Object.values(resumen).forEach(item => {
    const faltante = item.total_ventas - item.total_sistema;
    const tieneFaltante = faltante < 0 ? 'SÍ' : 'NO';
    
    const row = worksheet.addRow({
      fecha: item.fecha,
      sucursal: item.sucursal,
      total_depositado: item.total_depositado,
      total_tarjeta: item.total_tarjeta,
      total_ventas: item.total_ventas,
      total_sistema: item.total_sistema,
      total_facturado: item.total_facturado,
      faltante: faltante,
      tiene_faltante: tieneFaltante
    });
    
    // Highlight if tiene faltante
    if (faltante < 0) {
      row.getCell('tiene_faltante').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' }
      };
      row.getCell('tiene_faltante').font = { color: { argb: 'FFFFFFFF' }, bold: true };
    }
    
    // Format currency columns
    ['total_depositado', 'total_tarjeta', 'total_ventas', 'total_sistema', 'total_facturado', 'faltante'].forEach(col => {
      row.getCell(col).numFmt = '"Q"#,##0.00';
    });
  });
  
  return workbook;
}

// Reporte 3: Resumen global de todas las sucursales
export async function generateResumenGlobalReport(fecha_inicio, fecha_fin, sucursal_id) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Detalle Diario');
  
  // Headers for daily detail
  worksheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 12 },
    { header: 'Sucursal', key: 'sucursal', width: 20 },
    { header: 'Total Depositado', key: 'total_depositado', width: 18 },
    { header: 'Total Tarjeta', key: 'total_tarjeta', width: 15 },
    { header: 'Total Sistema', key: 'total_sistema', width: 15 },
    { header: 'Total Gastos', key: 'total_gastos', width: 15 },
    { header: 'Total Canjes', key: 'total_canjes', width: 15 },
    { header: 'Total Vendido', key: 'total_vendido', width: 15 },
    { header: 'Total Facturado', key: 'total_facturado', width: 17 }
  ];
  
  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  
  // Get data
  const where = {};
  if (fecha_inicio && fecha_fin) {
    where.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
  }
  if (sucursal_id) {
    where.sucursal_id = parseInt(sucursal_id);
  }
  
  const registros = await RegistroTurno.findAll({
    where,
    include: [
      { model: Sucursal, as: 'sucursal' },
      { model: Cuenta, as: 'cuenta' }
    ],
    order: [['fecha', 'ASC'], ['sucursal_id', 'ASC']]
  });
  
  // Group by fecha and sucursal for daily detail
  const resumenDiario = {};
  
  registros.forEach(registro => {
    const key = `${registro.fecha}_${registro.sucursal_id}`;
    const sucursalNombre = registro.sucursal?.nombre || 'Sin sucursal';
    
    if (!resumenDiario[key]) {
      resumenDiario[key] = {
        fecha: registro.fecha,
        sucursal: sucursalNombre,
        sucursal_id: registro.sucursal_id,
        total_depositado: 0,
        total_tarjeta: 0,
        total_sistema: 0,
        total_gastos: 0,
        total_canjes: 0,
        total_vendido: 0,
        total_facturado: 0
      };
    }
    
    resumenDiario[key].total_depositado += parseFloat(registro.monto_depositado || 0);
    resumenDiario[key].total_tarjeta += parseFloat(registro.venta_tarjeta || 0);
    resumenDiario[key].total_sistema += parseFloat(registro.total_sistema || 0);
    resumenDiario[key].total_gastos += parseFloat(registro.gastos || 0);
    resumenDiario[key].total_canjes += parseFloat(registro.canjes || 0);
    resumenDiario[key].total_vendido += parseFloat(registro.total_vendido || 0);
    resumenDiario[key].total_facturado += parseFloat(registro.total_facturado || 0);
  });
  
  // Add daily detail rows
  Object.values(resumenDiario).forEach(item => {
    const row = worksheet.addRow({
      fecha: item.fecha,
      sucursal: item.sucursal,
      total_depositado: item.total_depositado,
      total_tarjeta: item.total_tarjeta,
      total_sistema: item.total_sistema,
      total_gastos: item.total_gastos,
      total_canjes: item.total_canjes,
      total_vendido: item.total_vendido,
      total_facturado: item.total_facturado
    });
    
    // Format currency columns
    ['total_depositado', 'total_tarjeta', 'total_sistema', 'total_gastos', 'total_canjes', 'total_vendido', 'total_facturado'].forEach(col => {
      row.getCell(col).numFmt = '"Q"#,##0.00';
    });
  });
  
  // Add total row
  const totales = Object.values(resumenDiario).reduce((acc, item) => {
    acc.total_depositado += item.total_depositado;
    acc.total_tarjeta += item.total_tarjeta;
    acc.total_sistema += item.total_sistema;
    acc.total_gastos += item.total_gastos;
    acc.total_canjes += item.total_canjes;
    acc.total_vendido += item.total_vendido;
    acc.total_facturado += item.total_facturado;
    return acc;
  }, {
    total_depositado: 0,
    total_tarjeta: 0,
    total_sistema: 0,
    total_gastos: 0,
    total_canjes: 0,
    total_vendido: 0,
    total_facturado: 0
  });
  
  const totalRow = worksheet.addRow({
    fecha: '',
    sucursal: 'TOTAL GENERAL',
    total_depositado: totales.total_depositado,
    total_tarjeta: totales.total_tarjeta,
    total_sistema: totales.total_sistema,
    total_gastos: totales.total_gastos,
    total_canjes: totales.total_canjes,
    total_vendido: totales.total_vendido,
    total_facturado: totales.total_facturado
  });
  
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFCC00' }
  };
  
  // Format currency columns
  ['total_depositado', 'total_tarjeta', 'total_sistema', 'total_gastos', 'total_canjes', 'total_vendido', 'total_facturado'].forEach(col => {
    totalRow.getCell(col).numFmt = '"Q"#,##0.00';
  });
  
  return workbook;
}
