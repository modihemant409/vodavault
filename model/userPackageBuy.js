const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const userPackageBuy = sequelize.define("user_package_buys", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    package_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "1",
    },
});

module.exports = userPackageBuy;