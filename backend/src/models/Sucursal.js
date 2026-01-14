import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Sucursal = sequelize.define('Sucursal', {
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
  direccion: {
    type: DataTypes.STRING
  },
  distrito_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'distritos',
      key: 'id'
    },
    allowNull: true
  },
  dias_atencion: {
    type: DataTypes.STRING,
    defaultValue: 'L,M,X,J,V,S' // Por defecto Lunes a Sábado
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'sucursales',
  timestamps: true
});

export default Sucursal;
