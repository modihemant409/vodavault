const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require("../database/util");
const Assets = sequelize.define("asset", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  purchase_price: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: " ",
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  build_number: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  asset_image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(
      "safe",
      "sold",
      "stolen",
      "recovered",
      "marketplace",
      "lost",
      "damaged",
      "safe and insured",
      "loan",
      "sell"
    ),
    defaultValue: "safe",
  },
});

module.exports = Assets;
