const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const Coupon = sequelize.define("coupons", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    coupon_code: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    start_date	: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    end_date	: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    no_of_days	: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}); 

module.exports = Coupon;
