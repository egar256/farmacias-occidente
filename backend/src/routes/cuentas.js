import express from 'express';
import { Cuenta } from '../models/index.js';

const router = express.Router();

// Get all cuentas
router.get('/', async (req, res) => {
  try {
    const cuentas = await Cuenta.findAll({
      order: [['nombre', 'ASC']]
    });
    res.json(cuentas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one cuenta
router.get('/:id', async (req, res) => {
  try {
    const cuenta = await Cuenta.findByPk(req.params.id);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    res.json(cuenta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create cuenta
router.post('/', async (req, res) => {
  try {
    const cuenta = await Cuenta.create(req.body);
    res.status(201).json(cuenta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update cuenta
router.put('/:id', async (req, res) => {
  try {
    const cuenta = await Cuenta.findByPk(req.params.id);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    await cuenta.update(req.body);
    res.json(cuenta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete cuenta
router.delete('/:id', async (req, res) => {
  try {
    const cuenta = await Cuenta.findByPk(req.params.id);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    await cuenta.destroy();
    res.json({ message: 'Cuenta eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
