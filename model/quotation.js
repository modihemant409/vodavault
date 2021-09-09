const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const Quotation = sequelize.define("quotation", {
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
  is_completed: {
    type: DataTypes.ENUM("0", "1"),
    allowNull: false,
    defaultValue: "0",
  },
  is_insured: {
    type: DataTypes.ENUM("0", "1"),
    allowNull: false,
    defaultValue: "0",
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
