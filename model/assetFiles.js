const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const assetFiles = sequelize.define("asset_file", {
  file: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = assetFiles;
