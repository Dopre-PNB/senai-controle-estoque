const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Produto = require('./Produto');
const Usuario = require('./Usuario');

const Movimentacao = sequelize.define('Movimentacao', {
  tipo: {
    type: DataTypes.ENUM('entrada', 'saida'),
    allowNull: false,
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { isInt: true, min: 1 },
  },
  data: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

// A associação padrão permite excluir o produto e mantém seu histórico.
Produto.hasMany(Movimentacao, { foreignKey: 'produto_id' });
Movimentacao.belongsTo(Produto, { foreignKey: 'produto_id' });
Usuario.hasMany(Movimentacao, {
  foreignKey: { name: 'usuario_id', allowNull: false },
});
Movimentacao.belongsTo(Usuario, {
  foreignKey: { name: 'usuario_id', allowNull: false },
});

module.exports = Movimentacao;
