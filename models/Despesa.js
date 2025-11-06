const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  name:       { type: DataTypes.STRING, allowNull: false },
  price:      { type: DataTypes.DECIMAL(10,2), allowNull: false },
  imageUrl:   DataTypes.STRING
}, {
  tableName: 'products',
  timestamps: true      // createdAt / updatedAt automáticos
});

module.exports = Product;