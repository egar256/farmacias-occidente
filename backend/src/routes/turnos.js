import express from 'express';
import { Turno } from '../models/index.js';

const router = express.Router();

// Get all turnos
router.get('/', async (req, res) => {
  try {
    const turnos = await Turno.findAll({
      order: [['orden', 'ASC']]
    });
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one turno
router.get('/:id', async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    res.json(turno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create turno
router.post('/', async (req, res) => {
  try {
    const turno = await Turno.create(req.body);
    res.status(201).json(turno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update turno
router.put('/:id', async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    await turno.update(req.body);
    res.json(turno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete turno
router.delete('/:id', async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    await turno.destroy();
    res.json({ message: 'Turno eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
