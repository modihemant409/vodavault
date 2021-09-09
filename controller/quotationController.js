const Joi = require("joi");
const multer = require("multer");
const uuid = require("uuid");
const config = require("config");
const helper = require("../helper/functions");

const Assets = require("../model/Assets");
const assetFiles = require("../model/assetFiles");
const assetStatus = require("../model/assetStatus");
const assetInvoices = require("../model/assetInvoices");
const { Op } = require("sequelize");
const Quotation = require("../model/quotation");

exports.addQuotation = async (req, res, next) => {
  const create = new Object();
  for (const key in req.body) {
  }

  return res.send({
    message: "fetched successfully",
    data: asset,
    status: true,
  });
};
