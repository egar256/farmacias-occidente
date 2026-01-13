import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RegistroTurno = sequelize.define('RegistroTurno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  sucursal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sucursales',
      key: 'id'
    }
  },
  turno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'turnos',
      key: 'id'
    }
  },
  correlativo_inicial: {
    type: DataTypes.TEXT
  },
  correlativo_final: {
    type: DataTypes.TEXT
  },
  cuenta_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'cuentas',
      key: 'id'
    }
  },
  monto_depositado: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  venta_tarjeta: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_ventas: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_sistema: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  gastos: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  canjes: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_vendido: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_facturado: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_no_facturado: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_meta: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'registros_turno',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['fecha', 'sucursal_id', 'turno_id']
    }
  ]
});

export default RegistroTurno;
