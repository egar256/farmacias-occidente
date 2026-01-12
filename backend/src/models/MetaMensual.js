import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MetaMensual = sequelize.define('MetaMensual', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sucursal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sucursales',
      key: 'id'
    }
  },
  año: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  meta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'metas_mensuales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['sucursal_id', 'año', 'mes']
    }
  ]
});

export default MetaMensual;
