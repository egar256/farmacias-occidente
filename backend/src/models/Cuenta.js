import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cuenta = sequelize.define('Cuenta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  banco: {
    type: DataTypes.STRING,
    allowNull: false
  },
  es_especial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'cuentas',
  timestamps: true
});

export default Cuenta;
