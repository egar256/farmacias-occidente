import sequelize from '../config/database.js';
import Sucursal from './Sucursal.js';
import Turno from './Turno.js';
import Cuenta from './Cuenta.js';
import RegistroTurno from './RegistroTurno.js';
import Usuario from './Usuario.js';

// Define associations
RegistroTurno.belongsTo(Sucursal, { foreignKey: 'sucursal_id', as: 'sucursal' });
RegistroTurno.belongsTo(Turno, { foreignKey: 'turno_id', as: 'turno' });
RegistroTurno.belongsTo(Cuenta, { foreignKey: 'cuenta_id', as: 'cuenta' });

Sucursal.hasMany(RegistroTurno, { foreignKey: 'sucursal_id' });
Turno.hasMany(RegistroTurno, { foreignKey: 'turno_id' });
Cuenta.hasMany(RegistroTurno, { foreignKey: 'cuenta_id' });

// Initialize database with seed data
export async function initializeDatabase() {
  try {
    await sequelize.sync();
    
    // Seed Turnos
    const turnosCount = await Turno.count();
    if (turnosCount === 0) {
      await Turno.bulkCreate([
        { nombre: 'Diurno AM', orden: 1 },
        { nombre: 'Diurno PM', orden: 2 },
        { nombre: 'Nocturno', orden: 3 }
      ]);
      console.log('✓ Turnos inicializados');
    }
    
    // Seed Cuentas
    const cuentasCount = await Cuenta.count();
    if (cuentasCount === 0) {
      await Cuenta.bulkCreate([
        {
          numero: '7100717710',
          nombre: 'Grupo de negocios Tel',
          banco: 'Interbanco',
          es_especial: false
        },
        {
          numero: '3285010891',
          nombre: 'SELVIN GIAN TELLO',
          banco: 'BANRURAL',
          es_especial: true
        },
        {
          numero: 'ALDO',
          nombre: 'ALDO IVAN TELLO',
          banco: 'BANRURAL',
          es_especial: true
        },
        {
          numero: 'OFICINA',
          nombre: 'Oficina',
          banco: 'Cuenta Especial',
          es_especial: true
        }
      ]);
      console.log('✓ Cuentas inicializadas');
    }
    
    // Seed Usuario admin
    const usuariosCount = await Usuario.count();
    if (usuariosCount === 0) {
      await Usuario.create({
        username: 'admin',
        nombre: 'Administrador'
      });
      console.log('✓ Usuario admin creado');
    }
    
    console.log('✓ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar base de datos:', error);
    throw error;
  }
}

export { sequelize, Sucursal, Turno, Cuenta, RegistroTurno, Usuario };
