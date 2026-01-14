import express from 'express';
import { Sucursal } from '../models/index.js';

const router = express.Router();

// Get all sucursales
router.get('/', async (req, res) => {
  try {
    const sucursales = await Sucursal.findAll({
      order: [['nombre', 'ASC']]
    });
    res.json(sucursales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one sucursal
router.get('/:id', async (req, res) => {
  try {
    const sucursal = await Sucursal.findByPk(req.params.id);
    if (!sucursal) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }
    res.json(sucursal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create sucursal
router.post('/', async (req, res) => {
  try {
    const sucursal = await Sucursal.create(req.body);
    res.status(201).json(sucursal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update sucursal
router.put('/:id', async (req, res) => {
  try {
    const sucursal = await Sucursal.findByPk(req.params.id);
    if (!sucursal) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }
    await sucursal.update(req.body);
    res.json(sucursal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete sucursal
router.delete('/:id', async (req, res) => {
  try {
    const sucursal = await Sucursal.findByPk(req.params.id);
    if (!sucursal) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }
    await sucursal.destroy();
    res.json({ message: 'Sucursal eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
