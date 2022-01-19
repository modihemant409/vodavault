const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: " ",
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  mobile: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  profile_image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("Blocked", "Unblocked"),
    defaultValue: "Unblocked",
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_type: {
    type: DataTypes.ENUM("admin", "user", "specialist"),
    defaultValue: "user",
  },
  gender: {
    type: DataTypes.ENUM("male", "female", "other"),
    defaultValue: "male",
  },
  email_verified: {
    type: DataTypes.ENUM("0", "1"),
    defaultValue: "0",
  },
  is_user_premimum: {
    type: DataTypes.ENUM("0", "1"),
    defaultValue: "0",
  },
  expire_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_booked: {
    type: DataTypes.ENUM("0", "1"),
    defaultValue: "0",
  },
  device_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  device_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = User;
