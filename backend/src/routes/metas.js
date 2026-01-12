import express from 'express';
import { MetaMensual, Sucursal } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/metas - listar metas (filtrar por año, mes)
router.get('/', async (req, res) => {
  try {
    const { anio, mes } = req.query;
    const where = {};
    
    if (anio) where.año = parseInt(anio);
    if (mes) where.mes = parseInt(mes);
    
    const metas = await MetaMensual.findAll({
      where,
      include: [{ model: Sucursal, as: 'sucursal' }],
      order: [['año', 'DESC'], ['mes', 'DESC'], ['sucursal_id', 'ASC']]
    });
    
    res.json(metas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metas/:sucursal_id/:anio/:mes - obtener meta específica
router.get('/:sucursal_id/:anio/:mes', async (req, res) => {
  try {
    const { sucursal_id, anio, mes } = req.params;
    
    const meta = await MetaMensual.findOne({
      where: {
        sucursal_id: parseInt(sucursal_id),
        año: parseInt(anio),
        mes: parseInt(mes)
      },
      include: [{ model: Sucursal, as: 'sucursal' }]
    });
    
    if (!meta) {
      return res.status(404).json({ error: 'Meta no encontrada' });
    }
    
    res.json(meta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/metas - crear/actualizar meta
router.post('/', async (req, res) => {
  try {
    const { sucursal_id, anio, mes, meta } = req.body;
    
    if (!sucursal_id || !anio || !mes || meta === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    const [metaMensual, created] = await MetaMensual.upsert({
      sucursal_id: parseInt(sucursal_id),
      año: parseInt(anio),
      mes: parseInt(mes),
      meta: parseFloat(meta)
    }, {
      returning: true
    });
    
    const metaConSucursal = await MetaMensual.findByPk(metaMensual.id, {
      include: [{ model: Sucursal, as: 'sucursal' }]
    });
    
    res.status(created ? 201 : 200).json(metaConSucursal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/metas/:id - actualizar meta
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { meta } = req.body;
    
    const metaMensual = await MetaMensual.findByPk(id);
    
    if (!metaMensual) {
      return res.status(404).json({ error: 'Meta no encontrada' });
    }
    
    if (meta !== undefined) {
      metaMensual.meta = parseFloat(meta);
    }
    
    await metaMensual.save();
    
    const metaActualizada = await MetaMensual.findByPk(id, {
      include: [{ model: Sucursal, as: 'sucursal' }]
    });
    
    res.json(metaActualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/metas/:id - eliminar meta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const metaMensual = await MetaMensual.findByPk(id);
    
    if (!metaMensual) {
      return res.status(404).json({ error: 'Meta no encontrada' });
    }
    
    await metaMensual.destroy();
    
    res.json({ message: 'Meta eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
