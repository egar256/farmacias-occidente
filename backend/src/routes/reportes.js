import express from 'express';
import { generateDetalleReport, generateResumenDiarioReport, generateResumenGlobalReport } from '../services/excelService.js';

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
    const { fecha_inicio, fecha_fin } = req.query;
    
    const workbook = await generateResumenGlobalReport(fecha_inicio, fecha_fin);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-resumen-global.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
