const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const specialistAssets = sequelize.define("specialist_asset", {
  is_confirmed: {
    type: DataTypes.ENUM("0", "1"),
    defaultValue: "0",
  },
});

module.exports = specialistAssets;
