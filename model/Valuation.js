const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const Valuation = sequelize.define("valuation", {
  instruction: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
});

module.exports = Valuation;
