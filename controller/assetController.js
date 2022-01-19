const Joi = require("joi");
const multer = require("multer");
const uuid = require("uuid");
const config = require("config");
const helper = require("../helper/functions");

const Assets = require("../model/Assets");
const assetFiles = require("../model/assetFiles");
const Domicile = require("../model/Domicile");
const assetStatus = require("../model/assetStatus");
const assetInvoices = require("../model/assetInvoices");
const quotationAssets = require("../model/quotationAssets");
const { Op } = require("sequelize");
const specialistAssets = require("../model/specialistAsset");
const insuranceAssets = require("../model/insuranceAssets");
const Quotation = require("../model/quotation");
const Insurance = require("../model/Insurance");
const valuationAssets = require("../model/valuationAssets");
const Valuation = require("../model/Valuation");
const moment = require("moment");

exports.getAssetList = async (req, res, next) => {
  const asset = await Assets.findAll({
    where: { userId: req.userId },
    attributes: { exclude: ["userId", "domicileId"] },
    include: [
      {
        model: assetFiles,
      },
      {
        model: Domicile,
      },
    ],
  });
  return res.send({
    message: "fetched successfully",
    data: asset,
    status: true,
  });
};

exports.getAssetByBuild = async (req, res, next) => {
  try {
    const asset = await Assets.findOne({
      where: { build_number: req.params.build_number, userId: req.userId },
    });
    return res.send({
      data: asset,
      message: "fetched successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAssetDetail = async (req, res, next) => {
  try {
    const assetId = req.params.assetId;
    console.log(assetId);
    const asset = await Assets.findOne({
      where: { id: assetId, userId: req.userId },
      include: [
        {
          model: assetFiles,
        },
        {
          model: assetStatus,
        },
        {
          model: Domicile,
        },
        { model: specialistAssets },
        {
          model: assetInvoices,
          as: "warranty",
          attributes: { exclude: ["assetId", "type"] },
        },
        {
          model: assetInvoices,
          as: "invoice",
          attributes: { exclude: ["assetId", "type"] },
        },
      ],
    });
    helper.dataNotFound(asset, "Asset not found", 404);
    return res.send({
      message: "fetched successfully",
      data: asset,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.addMultipleAssets = async (req, res, next) => {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "assets/asset_images");
    },
    filename: function (req, file, cb) {
      cb(null, uuid.v4() + file.originalname.replace(/\s/g, ""));
    },
  });
  var upload = multer({ storage: storage }).any();
  const object = new Array();

  upload(req, res, async function () {
    try {
      for (let i = 0; i < req.body.name.length; i++) {
        let array = new Array();
        for (const file in req.files) {
          if (req.files[file].fieldname.includes(`file[${i}]`)) {
            array.push({
              file: config.get("App.baseUrl.backEndUrl") + req.files[file].path,
            });
          }
        }
        object.push({
          name: req.body.name[i],
          domicileId: req.body.domicileId[i],
          purchase_price: req.body.purchase_price
            ? req.body.purchase_price[i]
            : null,
          build_number: req.body.build_number ? req.body.build_number[i] : null,
          description: req.body.description ? req.body.description[i] : null,
          category: req.body.category ? req.body.category[i] : null,
          brand: req.body.brand ? req.body.brand[i] : null,
          asset_image: array.length ? array[0].file : null,
          userId: req.userId,
          asset_files: array,
          asset_statuses: [{ status: "safe" }],
        });
      }
      await Assets.bulkCreate(object, { include: [assetFiles, assetStatus] });
      return res.send({ message: "inserted successfully", status: true });
    } catch (error) {
      req.files.forEach((file) => {
        helper.removeFile(file.path);
      });
      return next(error);
    }
  });
};

exports.addSingleAsset = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    purchase_price: Joi.number().allow(),
    build_number: Joi.allow(),
    description: Joi.allow(),
    domicileId: Joi.number().allow(),
    category: Joi.allow(),
    brand: Joi.allow(),
  });

  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "assets/asset_images");
    },
    filename: function (req, file, cb) {
      cb(null, uuid.v4() + file.originalname.replace(/\s/g, ""));
    },
  });
  var upload = multer({ storage: storage }).array("asset_image");
  upload(req, res, async function () {
    try {
      await schema.validateAsync(req.body);
      const create = new Object();
      for (const key in req.body) {
        create[key] = req.body[key];
      }
      create["asset_image"] =
        config.get("App.baseUrl.backEndUrl") + req.files[0].path;
      create["userId"] = req.userId;
      const asset = await Assets.create(create);
      const files = new Array();
      for (const key in req.files) {
        files.push({
          assetId: asset.id,
          file: config.get("App.baseUrl.backEndUrl") + req.files[key].path,
        });
      }
      await assetFiles.bulkCreate(files);
      await assetStatus.create({ status: "safe", assetId: asset.id });
      return res.send({ message: "asset created successfully", status: true });
    } catch (error) {
      next(error);
    }
  });
};

exports.updateAsset = (req, res, next) => {
  const schema = Joi.object({
    assetId: Joi.number().required(),
    name: Joi.string().allow(),
    purchase_price: Joi.number().allow(),
    build_number: Joi.allow(),
    description: Joi.allow(),
    domicileId: Joi.number().allow(),
  });

  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "assets/asset_images");
    },
    filename: function (req, file, cb) {
      cb(null, uuid.v4() + file.originalname.replace(/\s/g, ""));
    },
  });
  var upload = multer({ storage: storage }).single("asset_image");
  upload(req, res, async function () {
    try {
      await schema.validateAsync(req.body);
      const asset = await Assets.findOne({
        where: { id: req.body.assetId, userId: req.userId },
      });
      helper.dataNotFound(asset, "Asset not found", 404);
      const update = new Object();
      for (const key in req.body) {
        if (key == "assetId") continue;
        update[key] = req.body[key];
      }
      // if (req.file) {
      //   update["asset_image"] =
      //     config.get("App.baseUrl.backEndUrl") + req.file.path;
      //   await assetFiles.create({
      //     file: config.get("App.baseUrl.backEndUrl") + req.file.path,
      //     assetId: asset.id,
      //   });
      //   if (asset.asset_image) {
      //     helper.removeFile(asset.asset_image);
      //     await assetFiles.destroy({
      //       where: { file: asset.asset_image, assetId: asset.id },
      //     });
      //   }
      // }
      await asset.update(update);
      return res.send({ message: "asset updated successfully", status: true });
    } catch (error) {
      next(error);
    }
  });
};

exports.deleteAsset = async (req, res, next) => {
  try {
    const assetId = req.params.assetId;
    const asset = await Assets.findOne({
      where: { id: assetId, userId: req.userId },
      include: [
        { model: quotationAssets, include: [Quotation], required: false },
        { model: insuranceAssets, include: [Insurance], required: false },
        { model: valuationAssets, include: [Valuation], required: false },
      ],
    });
    helper.dataNotFound(asset, "Asset Not found", 404);
    const images = await assetFiles.findAll({
      where: { assetId: asset.id },
    });
    images.forEach((data) => {
      helper.removeFile(data.file);
    });
    await assetFiles.destroy({ where: { assetId: asset.id } });
    const files = await assetInvoices.findAll({
      where: { assetId: asset.id },
    });
    files.forEach((data) => {
      helper.removeFile(data.file);
    });
    await assetInvoices.destroy({ where: { assetId: asset.id } });
    await assetStatus.destroy({ where: { assetId: asset.id } });
    await quotationAssets.destroy({ where: { assetId: asset.id } });
    await insuranceAssets.destroy({ where: { assetId: asset.id } });
    await valuationAssets.destroy({ where: { assetId: asset.id } });
    if (asset.quotation_asset) {
      const quotation = await Quotation.findOne({
        where: { id: asset.quotation_asset.quotationId },
        include: [quotationAssets],
      });
      if (!quotation.quotation_assets.length) {
        await quotation.destroy();
      }
    }
    if (asset.insurance_asset) {
      const insurance = await Insurance.findOne({
        where: { id: asset.insurance_asset.insuranceId },
        include: [insuranceAssets],
      });
      if (!insurance.insurance_assets.length) {
        await insurance.destroy();
      }
    }
    if (asset.valuation_assets) {
      const valuation = await Valuation.findOne({
        where: { id: asset.valuation_assets.valuationId },
        include: [valuationAssets],
      });
      if (!quotation.valuation_assets.length) {
        await valuation.destroy();
      }
    }
    await asset.destroy();
    return res.send({
      message: "asset deleted successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAssetAttachment = async (req, res, next) => {
  try {
    const type = req.query.type;
    if (!["image", "warranty", "invoice"].includes(type)) {
      const error = new Error("Invalid file type");
      error.statuscode = 421;
      throw error;
    }
    const attachmentId = req.params.attachmentId;
    let file;
    if (type == "image") {
      file = await assetFiles.findOne({
        where: { id: attachmentId },
        include: [{ model: Assets, where: { userId: req.userId } }],
      });
      if (file.asset.asset_image == file.file) {
        const otherImage = await assetFiles.findOne({
          where: { assetId: file.assetId, file: { [Op.ne]: file.file } },
        });
        if (otherImage) {
          await Assets.update(
            { asset_image: otherImage.file },
            { where: { id: file.assetId } }
          );
        } else {
          await Assets.update(
            { asset_image: null },
            { where: { id: file.assetId } }
          );
        }
      }
    } else if (type == "invoive") {
      file = await assetInvoices.findOne({
        where: { id: attachmentId },
        include: [
          { model: Assets, as: "invoice", where: { userId: req.userId } },
        ],
      });
    } else {
      file = await assetInvoices.findOne({
        where: { id: attachmentId },
        include: [
          { model: Assets, as: "warranty", where: { userId: req.userId } },
        ],
      });
    }
    helper.dataNotFound(file, "invalid file access", 404);
    helper.removeFile(file.file);
    await file.destroy();
    return res.send({
      message: "file removed successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.addAssetAttachment = async (req, res, next) => {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "assets/asset_attachments");
    },
    filename: function (req, file, cb) {
      cb(null, uuid.v4() + file.originalname.replace(/\s/g, ""));
    },
  });
  var upload = multer({ storage: storage }).single("file");
  upload(req, res, async function () {
    try {
      const { assetId, type } = req.body;
      const asset = await Assets.findOne({
        where: { id: assetId, userId: req.userId },
      });
      helper.dataNotFound(asset, "Invalid asset ", 404);
      if (!["warranty", "invoice"].includes(type)) {
        const error = new Error("type can be only Invoice or Warranty");
        error.statuscode = 421;
        throw error;
      }

      if (!req.file) {
        const error = new Error("file required to upload");
        error.statuscode = 404;
        throw error;
      }
      await assetInvoices.create({
        assetId,
        type,
        file: config.get("App.baseUrl.backEndUrl") + req.file.path,
      });
      return res.send({ message: "uploaded successfully", status: true });
    } catch (error) {
      if (req.file) {
        helper.removeFile(req.file.path);
      }
      next(error);
    }
  });
};

exports.addImageToAsset = async (req, res, next) => {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "assets/asset_attachments");
    },
    filename: function (req, file, cb) {
      cb(null, uuid.v4() + file.originalname.replace(/\s/g, ""));
    },
  });
  var upload = multer({ storage: storage }).single("file");
  upload(req, res, async function () {
    try {
      const { assetId } = req.body;
      const asset = await Assets.findOne({
        where: { id: assetId, userId: req.userId },
      });
      helper.dataNotFound(asset, "Invalid asset ", 404);
      if (!req.file) {
        const error = new Error("file required to upload");
        error.statuscode = 404;
        throw error;
      }
      await assetFiles.create({
        assetId,
        file: config.get("App.baseUrl.backEndUrl") + req.file.path,
      });
      if (asset.asset_image == null) {
        asset.update({
          asset_image: config.get("App.baseUrl.backEndUrl") + req.file.path,
        });
      }
      return res.send({ message: "uploaded successfully", status: true });
    } catch (error) {
      if (req.file) {
        helper.removeFile(req.file.path);
      }
      next(error);
    }
  });
};

exports.changeAssetStatus = async (req, res, next) => {
  try {
    const schema = Joi.object({
      assetId: Joi.number().required(),
      status: Joi.required().valid(
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
    });
    await schema.validateAsync(req.body);
    const { assetId, status } = req.body;
    const asset = await Assets.findOne({
      where: { id: assetId, userId: req.userId },
    });
    await assetStatus.create({ status, assetId });
    await asset.update({ status });
    return res.send({ message: "status changed successfully", status: true });
  } catch (error) {
    next(error);
  }
};

exports.detectObject = async (req, res, next) => {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "assets/vodaVault");
    },
    filename: function (req, file, cb) {
      cb(null, uuid.v4() + file.originalname.replace(/\s/g, ""));
    },
  });
  var upload = multer({ storage: storage }).single("image");
  upload(req, res, async function () {
    const dataUrl = config.get("App.baseUrl.backEndUrl") + req.file.path;
    try {
      const microsofComputerVision = require("microsoft-computer-vision");
      const myKey = config.get("computer-vision");
      const data = new Object();

      microsofComputerVision
        .tagImage({
          "Ocp-Apim-Subscription-Key": myKey,
          "request-origin": "centralindia",
          "content-type": "application/json",
          url: dataUrl,
        })
        .then((result) => {
          data["tags"] = result;
          return microsofComputerVision.orcImage({
            "Ocp-Apim-Subscription-Key": myKey,
            "request-origin": "centralindia",
            "content-type": "application/json",
            url: dataUrl,
            language: "en",
            "detect-orientation": true,
          });
        })
        .then((result1) => {
          data["text"] = result1;
          res.send({ status: true, data });
          helper.removeFile(dataUrl);
        })
        .catch((err) => {
          helper.removeFile(dataUrl);
          return next(err);
        });
    } catch (error) {
      helper.removeFile(dataUrl);
      return next(error);
    }
  });
};

exports.changeStatusToLoan = async (req, res, next) => {
  try {
    const id = req.body.assetId.split(",");
    await Assets.update({ status: "loan" }, { where: { id: id } });
    const create = [];
    id.forEach((element) => {
      create.push({ assetId: element, status: "loan" });
    });
    console.log(create);
    await assetStatus.bulkCreate(create);
    return res.send({ message: "updated successfully", status: true });
  } catch (error) {
    next(error);
  }
};

exports.getAssetForLoan = async (req, res, next) => {
  try {
    const assets = await Assets.findAll({
      where: { userId: req.userId, status: ["safe", "safe and insured"] },
    });
    return res.send({
      data: assets,
      message: "fetched successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};
