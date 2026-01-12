import express from 'express';
import { generateDetalleReport, generateResumenDiarioReport, generateResumenGlobalReport } from '../services/excelService.js';
import { RegistroTurno, Sucursal, MetaMensual } from '../models/index.js';
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
        [sequelize.fn('SUM', sequelize.col('total_vendido')), 'total_vendido'],
        [sequelize.fn('SUM', sequelize.col('gastos')), 'total_gastos'],
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
      const totalVendido = parseFloat(registro.dataValues.total_vendido || 0);
      const totalGastos = parseFloat(registro.dataValues.total_gastos || 0);
      const totalVentas = totalVendido + totalGastos;
      const meta = metasMap[sucursalId] || 0;
      const diasConVentas = parseInt(registro.dataValues.dias_con_ventas || 0);
      
      // Calculate percentages and projections
      const pctActual = meta > 0 ? totalVentas / meta : 0;
      const proyeccion = diasTranscurridos > 0 ? (totalVentas / diasTranscurridos) * diasMes : 0;
      const pctProyectado = meta > 0 ? proyeccion / meta : 0;
      const desvio = proyeccion - meta;
      
      return {
        sucursal_id: sucursalId,
        sucursal_nombre: registro.sucursal?.nombre || '',
        total_ventas: totalVentas,
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

export default router;
