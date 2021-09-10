const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const specialistInfo = sequelize.define("specialist_info", {
  doc_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  FNP_no: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = specialistInfo;
