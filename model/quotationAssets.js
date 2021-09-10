const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const quotationAssets = sequelize.define("quotation_asset", {});

module.exports = quotationAssets;
