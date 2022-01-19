const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const Notification = sequelize.define("notification", {
  notification: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue("notification");
      return rawValue ? JSON.parse(rawValue) : null;
    },
  },
});

module.exports = Notification;
