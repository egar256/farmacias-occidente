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
    unique: true,
    validate: {
      len: {
        args: [1, 100],
        msg: 'El nombre del distrito debe tener entre 1 y 100 caracteres'
      }
    }
  }
}, {
  tableName: 'distritos',
  timestamps: true
});

export default Distrito;
