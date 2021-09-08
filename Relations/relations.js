const assetFiles = require("../model/assetFiles");
const assetInvoices = require("../model/assetInvoices");
const Assets = require("../model/Assets");
const assetStatus = require("../model/assetStatus");
const Domicile = require("../model/Domicile");
const User = require("../model/user");
const forgotPassword = require("../model/forgotPassword");

exports.relations = () => {
  //domicile relations
  User.hasMany(Domicile);
  Domicile.belongsTo(User);

  //assets relation sto domicile and user
  User.hasMany(Assets);
  Assets.belongsTo(User);

  Domicile.hasMany(Assets);
  Assets.belongsTo(Domicile);

  Assets.hasMany(assetFiles);
  assetFiles.belongsTo(Assets);

  Assets.hasMany(assetInvoices, {
    scope: { type: "warranty" },
    as: "warranty",
    foreignKey: "assetId",
  });
  assetInvoices.belongsTo(Assets, {
    as: "warranty",
    foreignKey: "assetId",
  });

  Assets.hasMany(assetInvoices, {
    scope: { type: "invoice" },
    as: "invoice",
    foreignKey: "assetId",
  });
  assetInvoices.belongsTo(Assets, {
    as: "invoice",
    foreignKey: "assetId",
  });

  Assets.hasMany(assetStatus);
  assetStatus.belongsTo(Assets);

  //forgot password
  User.hasOne(forgotPassword);
  forgotPassword.belongsTo(User);
};
