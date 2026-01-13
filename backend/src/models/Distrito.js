import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Distrito = sequelize.define('Distrito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'distritos',
  timestamps: true
});

export default Distrito;
