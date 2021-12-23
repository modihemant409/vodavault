const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const specialistRequest = sequelize.define("specialist_request", {
  request_time: {
    type: DataTypes.STRING,
    allowNull: false,
    // set(value) {
    //   return this.setDataValue("request_time", value.toString());
    // },
    get() {
      const rawValue = this.getDataValue("request_time");
      return rawValue ? rawValue.split(",") : null;
    },
  },
  alloted_time: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("cancelled", "pending", "alloted", "completed"),
    defaultValue: "pending",
  },
  is_user_premimum: {
    type: DataTypes.ENUM("0", "1"),
    defaultValue: "0",
  },
  completed_at: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "reason if cancelled",
  },
});

module.exports = specialistRequest;
