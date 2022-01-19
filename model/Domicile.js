const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const Domicile = sequelize.define("domicile", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lat: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lng: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Domicile;
