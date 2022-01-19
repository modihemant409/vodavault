const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const assetStatus = sequelize.define("asset_status", {
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    },
    
});

module.exports = assetStatus;
