const config = require("config");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  config.get("database.name"),
  config.get("database.username"),
  config.get("database.password"),
  {
    dialect: "mysql",
    host: "localhost",
    logging: false,
  }
);

sequelize
  .authenticate()
  .then((res) => {
    console.log("Connection established with database.");
  })
  .catch((error) => {
    throw error;
  });

module.exports = sequelize;
