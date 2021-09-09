const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const quotationItem = sequelize.define("quotation_item", {});

module.exports = quotationItem;
