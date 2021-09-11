const forgotPassword = require("../model/forgotPassword");
const User = require("../model/user");
const Domicile = require("../model/Domicile");
const Assets = require("../model/Assets");
const assetFiles = require("../model/assetFiles");
const assetInvoices = require("../model/assetInvoices");
const assetStatus = require("../model/assetStatus");
const Quotation = require("../model/quotation");
const quotationAssets = require("../model/quotationAssets");
const Insurance = require("../model/Insurance");
const insuranceAssets = require("../model/insuranceAssets");
const specialistInfo = require("../model/specialistInfo");
const specialistRequest = require("../model/specialistRequest");
const specialistAssets = require("../model/specialistAsset");
const Notification = require("../model/notification");
const chatMessage = require("../model/chatMessage");

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

  //Quotation with Asset and User
  User.hasMany(Quotation);
  Quotation.belongsTo(User);

  Quotation.hasMany(quotationAssets);
  quotationAssets.belongsTo(Quotation);

  Assets.hasOne(quotationAssets);
  quotationAssets.belongsTo(Assets);

  //insurance

  User.hasMany(Insurance);
  Insurance.belongsTo(User);

  Insurance.hasMany(insuranceAssets);
  insuranceAssets.belongsTo(Insurance);

  Assets.hasOne(insuranceAssets);
  insuranceAssets.belongsTo(Assets);

  //specialist info
  User.hasOne(specialistInfo, { foreignKey: "specialistId" });
  specialistInfo.belongsTo(User, {
    foreignKey: "specialistId",
  });

  //specialist request
  User.hasMany(specialistRequest);
  specialistRequest.belongsTo(User);

  Domicile.hasOne(specialistRequest);
  specialistRequest.belongsTo(Domicile);

  User.hasMany(specialistRequest, {
    foreignKey: "specialistId",
  });
  specialistRequest.belongsTo(User, {
    foreignKey: "specialistId",
    as: "specialist",
  });

  //specialist assets

  specialistRequest.hasMany(specialistAssets);
  specialistAssets.belongsTo(specialistRequest);

  Assets.hasOne(specialistAssets);
  specialistAssets.belongsTo(Assets);

  //notification
  User.hasMany(Notification);
  Notification.belongsTo(User);

  //chat
  specialistRequest.hasMany(chatMessage, { foreignKey: "requestId" });
  chatMessage.belongsTo(specialistRequest, { foreignKey: "requestId" });
};
