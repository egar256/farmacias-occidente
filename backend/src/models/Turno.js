import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Turno = sequelize.define('Turno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  orden: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'turnos',
  timestamps: true
});

export default Turno;
