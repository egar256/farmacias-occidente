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
    { header: 'Correlativo Inicial', key: 'correlativo_inicial', width: 15 },
    { header: 'Correlativo Final', key: 'correlativo_final', width: 15 },
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
    const montoDepositado = parseFloat(registro.monto_depositado || 0);
    const ventaTarjeta = parseFloat(registro.venta_tarjeta || 0);
    const gastos = parseFloat(registro.gastos || 0);
    // Faltante = total_sistema - (monto_depositado + venta_tarjeta + gastos)
    // Canjes NO se resta, es solo informativo
    const faltante = totalSistema - (montoDepositado + ventaTarjeta + gastos);
    
    const row = worksheet.addRow({
      fecha: registro.fecha,
      sucursal: registro.sucursal?.nombre || '',
      turno: registro.turno?.nombre || '',
      correlativo_inicial: registro.correlativo_inicial || '',
      correlativo_final: registro.correlativo_final || '',
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
    { header: 'Total Gastos', key: 'total_gastos', width: 15 },
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
        total_gastos: 0,
        total_facturado: 0
      };
    }
    
    resumen[key].total_depositado += parseFloat(registro.monto_depositado || 0);
    resumen[key].total_tarjeta += parseFloat(registro.venta_tarjeta || 0);
    resumen[key].total_ventas += parseFloat(registro.total_ventas || 0);
    resumen[key].total_sistema += parseFloat(registro.total_sistema || 0);
    resumen[key].total_gastos += parseFloat(registro.gastos || 0);
    resumen[key].total_facturado += parseFloat(registro.total_facturado || 0);
  });
  
  // Add data rows
  Object.values(resumen).forEach(item => {
    // Faltante = total_sistema - (total_depositado + total_tarjeta + total_gastos)
    // Canjes NO se resta, es solo informativo
    const faltante = item.total_sistema - (item.total_depositado + item.total_tarjeta + item.total_gastos);
    const tieneFaltante = faltante < 0 ? 'SÍ' : 'NO';
    
    const row = worksheet.addRow({
      fecha: item.fecha,
      sucursal: item.sucursal,
      total_depositado: item.total_depositado,
      total_tarjeta: item.total_tarjeta,
      total_ventas: item.total_ventas,
      total_sistema: item.total_sistema,
      total_gastos: item.total_gastos,
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
    ['total_depositado', 'total_tarjeta', 'total_ventas', 'total_sistema', 'total_gastos', 'total_facturado', 'faltante'].forEach(col => {
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

// Reporte: Resumen por Sucursal
export async function generateResumenSucursalReport(fecha_inicio, fecha_fin, sucursal_id) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Resumen por Sucursal');
  
  // Title
  worksheet.mergeCells('A1:E1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'Resumen por Sucursal';
  titleCell.font = { bold: true, size: 16 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Date range
  worksheet.mergeCells('A2:E2');
  const dateCell = worksheet.getCell('A2');
  let periodText = 'Período: ';
  if (fecha_inicio && fecha_fin) {
    periodText += `${fecha_inicio} - ${fecha_fin}`;
  } else if (fecha_inicio) {
    periodText += `Desde ${fecha_inicio}`;
  } else if (fecha_fin) {
    periodText += `Hasta ${fecha_fin}`;
  } else {
    periodText += 'Todos los registros';
  }
  dateCell.value = periodText;
  dateCell.font = { size: 10 };
  dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Headers (starting at row 4)
  worksheet.getRow(4).values = [
    'Sucursal',
    'Total Depositado',
    'Total Tarjeta',
    'Total Sistema',
    'Total Facturado'
  ];
  
  // Style header
  worksheet.getRow(4).font = { bold: true };
  worksheet.getRow(4).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  
  // Set column widths
  worksheet.columns = [
    { key: 'sucursal', width: 25 },
    { key: 'total_depositado', width: 18 },
    { key: 'total_tarjeta', width: 15 },
    { key: 'total_sistema', width: 15 },
    { key: 'total_facturado', width: 17 }
  ];
  
  // Get data
  const where = {};
  if (fecha_inicio && fecha_fin) {
    where.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
  } else if (fecha_inicio) {
    where.fecha = { [Op.gte]: fecha_inicio };
  } else if (fecha_fin) {
    where.fecha = { [Op.lte]: fecha_fin };
  }
  
  if (sucursal_id) {
    where.sucursal_id = parseInt(sucursal_id);
  }
  
  const registros = await RegistroTurno.findAll({
    where,
    include: [
      { model: Sucursal, as: 'sucursal' }
    ]
  });
  
  // Group by sucursal
  const resumen = {};
  
  registros.forEach(registro => {
    const sucursalId = registro.sucursal_id;
    const sucursalNombre = registro.sucursal?.nombre || 'Sin sucursal';
    
    if (!resumen[sucursalId]) {
      resumen[sucursalId] = {
        sucursal_id: sucursalId,
        sucursal_nombre: sucursalNombre,
        total_depositado: 0,
        total_tarjeta: 0,
        total_sistema: 0,
        total_facturado: 0
      };
    }
    
    resumen[sucursalId].total_depositado += parseFloat(registro.monto_depositado || 0);
    resumen[sucursalId].total_tarjeta += parseFloat(registro.venta_tarjeta || 0);
    resumen[sucursalId].total_sistema += parseFloat(registro.total_sistema || 0);
    resumen[sucursalId].total_facturado += parseFloat(registro.total_facturado || 0);
  });
  
  const data = Object.values(resumen);
  
  // Calculate totals
  const totales = {
    total_depositado: 0,
    total_tarjeta: 0,
    total_sistema: 0,
    total_facturado: 0
  };
  
  data.forEach(item => {
    totales.total_depositado += item.total_depositado;
    totales.total_tarjeta += item.total_tarjeta;
    totales.total_sistema += item.total_sistema;
    totales.total_facturado += item.total_facturado;
  });
  
  // Add data rows (starting at row 5)
  let currentRow = 5;
  data.forEach(item => {
    const row = worksheet.getRow(currentRow);
    row.values = [
      item.sucursal_nombre,
      item.total_depositado,
      item.total_tarjeta,
      item.total_sistema,
      item.total_facturado
    ];
    
    // Format currency columns
    ['total_depositado', 'total_tarjeta', 'total_sistema', 'total_facturado'].forEach((col, idx) => {
      row.getCell(idx + 2).numFmt = '"Q"#,##0.00';
    });
    
    currentRow++;
  });
  
  // Add totals row
  const totalRow = worksheet.getRow(currentRow);
  totalRow.values = [
    'TOTAL',
    totales.total_depositado,
    totales.total_tarjeta,
    totales.total_sistema,
    totales.total_facturado
  ];
  
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFCC00' }
  };
  
  // Format currency columns in totals
  ['total_depositado', 'total_tarjeta', 'total_sistema', 'total_facturado'].forEach((col, idx) => {
    totalRow.getCell(idx + 2).numFmt = '"Q"#,##0.00';
  });
  
  return workbook;
}

// Reporte: Depósitos por Cuenta
export async function generateDepositosCuentaReport(fecha_desde, fecha_hasta, cuenta_id, sucursal_id) {
  const workbook = new ExcelJS.Workbook();
  
  // Get data
  const where = {};
  
  // Filter by date range
  if (fecha_desde && fecha_hasta) {
    where.fecha = { [Op.between]: [fecha_desde, fecha_hasta] };
  } else if (fecha_desde) {
    where.fecha = { [Op.gte]: fecha_desde };
  } else if (fecha_hasta) {
    where.fecha = { [Op.lte]: fecha_hasta };
  }
  
  // Filter by cuenta
  if (cuenta_id) {
    where.cuenta_id = parseInt(cuenta_id);
  }
  
  // Filter by sucursal
  if (sucursal_id) {
    where.sucursal_id = parseInt(sucursal_id);
  }
  
  // Only get registros with deposits
  // Only apply the "not null" check if no specific cuenta_id was requested
  if (!cuenta_id) {
    where.cuenta_id = { [Op.ne]: null };
  }
  where.monto_depositado = { [Op.gt]: 0 };
  
  const registros = await RegistroTurno.findAll({
    where,
    include: [
      { model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
      { model: Turno, as: 'turno', attributes: ['id', 'nombre'] },
      { model: Cuenta, as: 'cuenta', attributes: ['id', 'numero', 'nombre', 'banco', 'es_especial'] }
    ],
    order: [['cuenta_id', 'ASC'], ['fecha', 'DESC']]
  });
  
  // Build resumen por cuenta
  const resumenPorCuenta = {};
  let totalGeneral = 0;
  let totalCuentasNormales = 0;
  let totalCuentasEspeciales = 0;
  
  registros.forEach(registro => {
    const cuenta = registro.cuenta;
    const monto = parseFloat(registro.monto_depositado || 0);
    
    if (!cuenta) return;
    
    // Add to resumen
    if (!resumenPorCuenta[cuenta.id]) {
      resumenPorCuenta[cuenta.id] = {
        cuenta_numero: cuenta.numero,
        cuenta_nombre: cuenta.nombre,
        banco: cuenta.banco,
        es_especial: cuenta.es_especial,
        total_depositado: 0,
        cantidad_depositos: 0
      };
    }
    
    resumenPorCuenta[cuenta.id].total_depositado += monto;
    resumenPorCuenta[cuenta.id].cantidad_depositos += 1;
    
    // Add to totals
    totalGeneral += monto;
    if (cuenta.es_especial) {
      totalCuentasEspeciales += monto;
    } else {
      totalCuentasNormales += monto;
    }
  });
  
  // Sheet 1: Resumen por Cuenta
  const resumenSheet = workbook.addWorksheet('Resumen por Cuenta');
  
  resumenSheet.columns = [
    { header: 'Cuenta', key: 'cuenta', width: 25 },
    { header: 'Banco', key: 'banco', width: 20 },
    { header: 'Tipo', key: 'tipo', width: 15 },
    { header: 'Total Depositado', key: 'total_depositado', width: 18 },
    { header: '# Depósitos', key: 'cantidad_depositos', width: 15 }
  ];
  
  // Style header
  resumenSheet.getRow(1).font = { bold: true };
  resumenSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  
  // Add data rows
  Object.values(resumenPorCuenta).forEach(item => {
    const row = resumenSheet.addRow({
      cuenta: `${item.cuenta_numero} - ${item.cuenta_nombre}`,
      banco: item.banco,
      tipo: item.es_especial ? 'ESPECIAL' : 'NORMAL',
      total_depositado: item.total_depositado,
      cantidad_depositos: item.cantidad_depositos
    });
    
    // Highlight special accounts
    if (item.es_especial) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF4CC' }
      };
    }
    
    // Format currency
    row.getCell('total_depositado').numFmt = '"Q"#,##0.00';
  });
  
  // Add totals
  resumenSheet.addRow({});
  const totalRow = resumenSheet.addRow({
    cuenta: 'TOTAL GENERAL',
    banco: '',
    tipo: '',
    total_depositado: totalGeneral,
    cantidad_depositos: Object.values(resumenPorCuenta).reduce((sum, item) => sum + item.cantidad_depositos, 0)
  });
  
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFCC00' }
  };
  totalRow.getCell('total_depositado').numFmt = '"Q"#,##0.00';
  
  // Add subtotals
  const normalRow = resumenSheet.addRow({
    cuenta: 'Total Cuentas Normales',
    banco: '',
    tipo: '',
    total_depositado: totalCuentasNormales,
    cantidad_depositos: ''
  });
  normalRow.font = { bold: true };
  normalRow.getCell('total_depositado').numFmt = '"Q"#,##0.00';
  
  const especialRow = resumenSheet.addRow({
    cuenta: 'Total Cuentas Especiales (No Facturado)',
    banco: '',
    tipo: '',
    total_depositado: totalCuentasEspeciales,
    cantidad_depositos: ''
  });
  especialRow.font = { bold: true };
  especialRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFF4CC' }
  };
  especialRow.getCell('total_depositado').numFmt = '"Q"#,##0.00';
  
  // Sheet 2: Detalle de Depósitos
  const detalleSheet = workbook.addWorksheet('Detalle de Depósitos');
  
  detalleSheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 12 },
    { header: 'Sucursal', key: 'sucursal', width: 20 },
    { header: 'Turno', key: 'turno', width: 15 },
    { header: 'Cuenta', key: 'cuenta', width: 25 },
    { header: 'Banco', key: 'banco', width: 20 },
    { header: 'Monto', key: 'monto', width: 15 }
  ];
  
  // Style header
  detalleSheet.getRow(1).font = { bold: true };
  detalleSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  
  // Add detail rows
  registros.forEach(registro => {
    const row = detalleSheet.addRow({
      fecha: registro.fecha,
      sucursal: registro.sucursal?.nombre || '',
      turno: registro.turno?.nombre || '',
      cuenta: `${registro.cuenta.numero} - ${registro.cuenta.nombre}`,
      banco: registro.cuenta.banco,
      monto: parseFloat(registro.monto_depositado || 0)
    });
    
    // Highlight special accounts
    if (registro.cuenta.es_especial) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF4CC' }
      };
    }
    
    // Format currency
    row.getCell('monto').numFmt = '"Q"#,##0.00';
  });
  
  return workbook;
}
