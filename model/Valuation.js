const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const Valuation = sequelize.define("valuation", {
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Quotation;
