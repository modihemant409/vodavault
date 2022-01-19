const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const Package = sequelize.define("packages", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue:0,
    },
    num_of_domicile: {
        type: DataTypes.DOUBLE,
        defaultValue: "1",
    },
    num_of_asset: {
        type: DataTypes.DOUBLE,
        defaultValue: "1",
    },
    get_insurance: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    get_quick_quote: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    process_claim: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    technical_specialist: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
    status: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
});

module.exports = Package;