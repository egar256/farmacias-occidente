import express from 'express';
import { Distrito } from '../models/index.js';

const router = express.Router();

// GET /api/distritos - listar todos los distritos
router.get('/', async (req, res) => {
  try {
    const distritos = await Distrito.findAll({
      order: [['nombre', 'ASC']]
    });
    res.json(distritos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/distritos/:id - obtener un distrito
router.get('/:id', async (req, res) => {
  try {
    const distrito = await Distrito.findByPk(req.params.id);
    
    if (!distrito) {
      return res.status(404).json({ error: 'Distrito no encontrado' });
    }
    
    res.json(distrito);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/distritos - crear distrito
router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    const distrito = await Distrito.create({ nombre });
    res.status(201).json(distrito);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/distritos/:id - actualizar distrito
router.put('/:id', async (req, res) => {
  try {
    const distrito = await Distrito.findByPk(req.params.id);
    
    if (!distrito) {
      return res.status(404).json({ error: 'Distrito no encontrado' });
    }
    
    const { nombre } = req.body;
    if (nombre !== undefined) {
      distrito.nombre = nombre;
    }
    
    await distrito.save();
    res.json(distrito);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/distritos/:id - eliminar distrito
router.delete('/:id', async (req, res) => {
  try {
    const distrito = await Distrito.findByPk(req.params.id);
    
    if (!distrito) {
      return res.status(404).json({ error: 'Distrito no encontrado' });
    }
    
    await distrito.destroy();
    res.json({ message: 'Distrito eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
