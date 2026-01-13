import express from 'express';
import { generateDetalleReport, generateResumenDiarioReport, generateResumenGlobalReport, generateResumenSucursalReport, generateDepositosCuentaReport } from '../services/excelService.js';
import { generateResumenSucursalPDF } from '../services/pdfService.js';
import { RegistroTurno, Sucursal, MetaMensual, Turno, Cuenta } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

// Reporte 1: Detalle por turno/sucursal
router.get('/detalle', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const workbook = await generateDetalleReport(fecha_inicio, fecha_fin);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-detalle.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte 2: Resumen diario
router.get('/resumen-diario', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const workbook = await generateResumenDiarioReport(fecha_inicio, fecha_fin);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-resumen-diario.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte 3: Resumen global
router.get('/resumen-global', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, sucursal_id } = req.query;
    
    const workbook = await generateResumenGlobalReport(fecha_inicio, fecha_fin, sucursal_id);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-resumen-global.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard de ventas vs metas
router.get('/dashboard-ventas', async (req, res) => {
  try {
    const { anio, mes, sucursal_id, fecha_corte } = req.query;
    
    if (!anio || !mes) {
      return res.status(400).json({ error: 'Año y mes son requeridos' });
    }
    
    const añoInt = parseInt(anio);
    const mesInt = parseInt(mes);
    
    // Calculate date range for the month
    const fechaInicio = new Date(añoInt, mesInt - 1, 1);
    const fechaFin = new Date(añoInt, mesInt, 0); // Last day of month
    
    // Calculate dias_mes
    const diasMes = fechaFin.getDate();
    
    // Calculate dias_transcurridos
    let diasTranscurridos = diasMes;
    if (fecha_corte) {
      const fechaCorteDate = new Date(fecha_corte);
      if (fechaCorteDate >= fechaInicio && fechaCorteDate <= fechaFin) {
        diasTranscurridos = fechaCorteDate.getDate();
      }
    }
    
    // Build where clause
    const where = {
      fecha: {
        [Op.between]: [
          fechaInicio.toISOString().split('T')[0],
          fechaFin.toISOString().split('T')[0]
        ]
      }
    };
    
    if (sucursal_id) {
      where.sucursal_id = parseInt(sucursal_id);
    }
    
    // Get registros grouped by sucursal
    const registros = await RegistroTurno.findAll({
      attributes: [
        'sucursal_id',
        [sequelize.fn('SUM', sequelize.col('total_meta')), 'total_meta'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('fecha'))), 'dias_con_ventas']
      ],
      where,
      include: [{ model: Sucursal, as: 'sucursal', attributes: ['nombre'] }],
      group: ['sucursal_id', 'sucursal.id'],
      raw: false
    });
    
    // Get metas for the period
    const metas = await MetaMensual.findAll({
      where: {
        año: añoInt,
        mes: mesInt,
        ...(sucursal_id ? { sucursal_id: parseInt(sucursal_id) } : {})
      }
    });
    
    // Create map of metas by sucursal_id
    const metasMap = {};
    metas.forEach(meta => {
      metasMap[meta.sucursal_id] = parseFloat(meta.meta);
    });
    
    // Build response
    const result = registros.map(registro => {
      const sucursalId = registro.sucursal_id;
      const totalMeta = parseFloat(registro.dataValues.total_meta || 0);
      const meta = metasMap[sucursalId] || 0;
      const diasConVentas = parseInt(registro.dataValues.dias_con_ventas || 0);
      
      // Calculate percentages and projections
      const pctActual = meta > 0 ? totalMeta / meta : 0;
      const proyeccion = diasTranscurridos > 0 ? (totalMeta / diasTranscurridos) * diasMes : 0;
      const pctProyectado = meta > 0 ? proyeccion / meta : 0;
      const desvio = proyeccion - meta;
      
      return {
        sucursal_id: sucursalId,
        sucursal_nombre: registro.sucursal?.nombre || '',
        total_ventas: totalMeta,
        meta: meta,
        dias_con_ventas: diasConVentas,
        dias_mes: diasMes,
        dias_transcurridos: diasTranscurridos,
        pct_actual: pctActual,
        proyeccion: proyeccion,
        pct_proyectado: pctProyectado,
        desvio: desvio
      };
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error en dashboard-ventas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export resumen sucursal to Excel or PDF
router.get('/resumen-sucursal/export', async (req, res) => {
  try {
    const { formato, fecha_inicio, fecha_fin, sucursal_id } = req.query;
    
    if (!formato || (formato !== 'excel' && formato !== 'pdf')) {
      return res.status(400).json({ error: 'Formato no válido. Use "excel" o "pdf"' });
    }
    
    if (formato === 'excel') {
      const workbook = await generateResumenSucursalReport(fecha_inicio, fecha_fin, sucursal_id);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=resumen-sucursal.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    } else if (formato === 'pdf') {
      const pdfBuffer = await generateResumenSucursalPDF(fecha_inicio, fecha_fin, sucursal_id);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=resumen-sucursal.pdf');
      
      res.send(pdfBuffer);
    }
  } catch (error) {
    console.error('Error generating export:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reporte de Depósitos por Cuenta
router.get('/depositos-cuenta', async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta, cuenta_id, sucursal_id } = req.query;
    
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
    
    // Only get registros with deposits (cuenta_id not null and monto_depositado > 0)
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
      order: [['fecha', 'DESC'], ['sucursal_id', 'ASC']]
    });
    
    // Build resumen por cuenta
    const resumenPorCuenta = {};
    const detalle = [];
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
          cuenta_id: cuenta.id,
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
      
      // Add to detalle
      detalle.push({
        id: registro.id,
        fecha: registro.fecha,
        sucursal_nombre: registro.sucursal?.nombre || '',
        turno_nombre: registro.turno?.nombre || '',
        cuenta_numero: cuenta.numero,
        cuenta_nombre: cuenta.nombre,
        banco: cuenta.banco,
        es_especial: cuenta.es_especial,
        monto_depositado: monto
      });
    });
    
    res.json({
      resumen_por_cuenta: Object.values(resumenPorCuenta),
      detalle: detalle,
      totales: {
        total_general: totalGeneral,
        total_cuentas_normales: totalCuentasNormales,
        total_cuentas_especiales: totalCuentasEspeciales
      }
    });
  } catch (error) {
    console.error('Error en depositos-cuenta:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reporte de Depósitos por Cuenta - Excel Export
router.get('/depositos-cuenta/excel', async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta, cuenta_id, sucursal_id } = req.query;
    
    const workbook = await generateDepositosCuentaReport(fecha_desde, fecha_hasta, cuenta_id, sucursal_id);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-depositos-cuenta.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating depositos excel:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
