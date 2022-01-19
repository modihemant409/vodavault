const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/util");

const forgotPassword = sequelize.define("forgot_password", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  otp: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  is_used: {
    type: DataTypes.ENUM("0", "1"),
    defaultValue: "0",
    allowNull: false,
  },
  expired_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = forgotPassword;
