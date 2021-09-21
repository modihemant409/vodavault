const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const insuranceAssets = sequelize.define("insurance_asset", {
  through: {
    type: DataTypes.ENUM("bot", "manual"),
    defaultValue: "manual",
  },
});

module.exports = insuranceAssets;
