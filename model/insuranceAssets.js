const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const insuranceAssets = sequelize.define("insurance_asset", {});

module.exports = insuranceAssets;
