import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './models/index.js';

// Import routes
import sucursalesRoutes from './routes/sucursales.js';
import turnosRoutes from './routes/turnos.js';
import cuentasRoutes from './routes/cuentas.js';
import registrosRoutes from './routes/registros.js';
import reportesRoutes from './routes/reportes.js';
import usuariosRoutes from './routes/usuarios.js';
import metasRoutes from './routes/metas.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sucursales', sucursalesRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/metas', metasRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
      console.log(`\nPresiona Ctrl+C para detener el servidor\n`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
