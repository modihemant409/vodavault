const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const valuationAssets = sequelize.define("valuation_asset", {});

module.exports = valuationAssets;
