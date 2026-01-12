import express from 'express';
import { RegistroTurno, Sucursal, Turno, Cuenta } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all registros with filters
router.get('/', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, sucursal_id, turno_id } = req.query;
    
    const where = {};
    if (fecha_inicio && fecha_fin) {
      where.fecha = {
        [Op.between]: [fecha_inicio, fecha_fin]
      };
    } else if (fecha_inicio) {
      where.fecha = {
        [Op.gte]: fecha_inicio
      };
    } else if (fecha_fin) {
      where.fecha = {
        [Op.lte]: fecha_fin
      };
    }
    
    if (sucursal_id) {
      where.sucursal_id = sucursal_id;
    }
    
    if (turno_id) {
      where.turno_id = turno_id;
    }
    
    const registros = await RegistroTurno.findAll({
      where,
      include: [
        { model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
        { model: Turno, as: 'turno', attributes: ['id', 'nombre'] },
        { model: Cuenta, as: 'cuenta', attributes: ['id', 'numero', 'nombre', 'banco', 'es_especial'] }
      ],
      order: [['fecha', 'DESC'], ['sucursal_id', 'ASC'], ['turno_id', 'ASC']]
    });
    
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one registro
router.get('/:id', async (req, res) => {
  try {
    const registro = await RegistroTurno.findByPk(req.params.id, {
      include: [
        { model: Sucursal, as: 'sucursal' },
        { model: Turno, as: 'turno' },
        { model: Cuenta, as: 'cuenta' }
      ]
    });
    
    if (!registro) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create registro
router.post('/', async (req, res) => {
  try {
    // Calculate fields
    const data = { ...req.body };
    
    // Total de ventas = depósito + tarjeta
    data.total_ventas = parseFloat(data.monto_depositado || 0) + parseFloat(data.venta_tarjeta || 0);
    
    // Total vendido = Total sistema - Gastos - Canjes
    data.total_vendido = parseFloat(data.total_sistema || 0) - parseFloat(data.gastos || 0) - parseFloat(data.canjes || 0);
    
    // Total facturado = Total de ventas
    data.total_facturado = data.total_ventas;
    
    const registro = await RegistroTurno.create(data);
    
    const registroCompleto = await RegistroTurno.findByPk(registro.id, {
      include: [
        { model: Sucursal, as: 'sucursal' },
        { model: Turno, as: 'turno' },
        { model: Cuenta, as: 'cuenta' }
      ]
    });
    
    res.status(201).json(registroCompleto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update registro
router.put('/:id', async (req, res) => {
  try {
    const registro = await RegistroTurno.findByPk(req.params.id);
    
    if (!registro) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    // Calculate fields
    const data = { ...req.body };
    
    // Total de ventas = depósito + tarjeta
    data.total_ventas = parseFloat(data.monto_depositado || 0) + parseFloat(data.venta_tarjeta || 0);
    
    // Total vendido = Total sistema - Gastos - Canjes
    data.total_vendido = parseFloat(data.total_sistema || 0) - parseFloat(data.gastos || 0) - parseFloat(data.canjes || 0);
    
    // Total facturado = Total de ventas
    data.total_facturado = data.total_ventas;
    
    await registro.update(data);
    
    const registroActualizado = await RegistroTurno.findByPk(req.params.id, {
      include: [
        { model: Sucursal, as: 'sucursal' },
        { model: Turno, as: 'turno' },
        { model: Cuenta, as: 'cuenta' }
      ]
    });
    
    res.json(registroActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete registro
router.delete('/:id', async (req, res) => {
  try {
    const registro = await RegistroTurno.findByPk(req.params.id);
    
    if (!registro) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    await registro.destroy();
    res.json({ message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary by sucursal
router.get('/resumen/sucursal', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, sucursal_id } = req.query;
    
    const where = {};
    if (fecha_inicio && fecha_fin) {
      where.fecha = {
        [Op.between]: [fecha_inicio, fecha_fin]
      };
    }
    
    if (sucursal_id) {
      where.sucursal_id = sucursal_id;
    }
    
    const registros = await RegistroTurno.findAll({
      where,
      include: [
        { model: Sucursal, as: 'sucursal' },
        { model: Cuenta, as: 'cuenta' }
      ]
    });
    
    // Group by sucursal
    const resumen = {};
    
    for (const registro of registros) {
      const sucursalId = registro.sucursal_id;
      const sucursalNombre = registro.sucursal?.nombre || 'Sin sucursal';
      
      if (!resumen[sucursalId]) {
        resumen[sucursalId] = {
          sucursal_id: sucursalId,
          sucursal_nombre: sucursalNombre,
          total_depositado: 0,
          total_tarjeta: 0,
          total_sistema: 0,
          total_facturado: 0,
          total_no_facturado: 0,
          total_gastos: 0,
          total_canjes: 0,
          total_meta: 0
        };
      }
      
      const monto = parseFloat(registro.monto_depositado || 0);
      const tarjeta = parseFloat(registro.venta_tarjeta || 0);
      const sistema = parseFloat(registro.total_sistema || 0);
      const facturado = parseFloat(registro.total_facturado || 0);
      const gastos = parseFloat(registro.gastos || 0);
      const canjes = parseFloat(registro.canjes || 0);
      const vendido = parseFloat(registro.total_vendido || 0);
      
      resumen[sucursalId].total_depositado += monto;
      resumen[sucursalId].total_tarjeta += tarjeta;
      resumen[sucursalId].total_sistema += sistema;
      resumen[sucursalId].total_facturado += facturado;
      resumen[sucursalId].total_gastos += gastos;
      resumen[sucursalId].total_canjes += canjes;
      
      // Total no facturado = depósitos a cuentas especiales
      if (registro.cuenta?.es_especial) {
        resumen[sucursalId].total_no_facturado += monto;
      }
    }
    
    // Calculate total_meta = total_vendido + gastos
    for (const sucursalId in resumen) {
      const totalVendido = resumen[sucursalId].total_sistema - resumen[sucursalId].total_gastos - resumen[sucursalId].total_canjes;
      resumen[sucursalId].total_meta = totalVendido + resumen[sucursalId].total_gastos;
    }
    
    res.json(Object.values(resumen));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
