const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const PackageAsset = sequelize.define("package_assets", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    package_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    damaged: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    loan: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    lost: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    market_place: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    recovered: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    safe: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    sell: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    sold: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    stolen: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    get_valuation: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    status: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
});

module.exports = PackageAsset;