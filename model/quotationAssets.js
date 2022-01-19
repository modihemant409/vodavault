const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const quotationAssets = sequelize.define("quotation_asset", {
  through: {
    type: DataTypes.ENUM("bot", "manual"),
    defaultValue: "manual",
  },
});

module.exports = quotationAssets;
