const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const assetInvoices = sequelize.define("asset_invoices", {
  file: {
    type: DataTypes.TEXT,
    allowNull: false,
    },
    type: {
        type:DataTypes.ENUM("invoice","warranty")
    }
    
});

module.exports = assetInvoices;
