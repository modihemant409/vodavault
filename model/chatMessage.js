const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const chatMessage = sequelize.define("chat_message", {
  uuid: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  from_: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = chatMessage;
