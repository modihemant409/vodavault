const Joi = require("joi");
const config = require("config");
const helper = require("../helper/functions");

const Assets = require("../model/Assets");
const assetFiles = require("../model/assetFiles");
const assetStatus = require("../model/assetStatus");
const Quotation = require("../model/quotation");
const Insurance = require("../model/Insurance");
const insuranceAssets = require("../model/insuranceAssets");
const quotationAssets = require("../model/quotationAssets");
const Domicile = require("../model/Domicile");

exports.addQuotation = async (req, res, next) => {
  try {
    const quotation = await handleQuotations(req, next);
    let text = "Quotation created successfully";
    let id = quotation.id;
    if (req.body.is_completed == "1") {
      const result = await handleInsurance(req, next, quotation);
      text = "Assets Insured Successfully";
      id = null;
    }
    if (id == null) {
      return res.send({ message: text, status: true });
    }
    return res.send({ message: text, status: true, quotationId: id });
  } catch (error) {
    next(error);
  }
};

async function handleQuotations(req, next) {
  try {
    let quotation;
    var create = new Object();
    for (const key in req.body) {
      if (["quotationId", "is_completed", "asset_detail"].includes(key)) {
        continue;
      }
      create[key] = req.body[key];
    }
    if (req.body.quotationId) {
      quotation = await Quotation.findOne({
        where: { id: req.body.quotationId, userId: req.userId },
      });
      helper.dataNotFound(quotation, "invalid Quotation", 404);

      await quotation.update(create);
      await quotationAssets.destroy({ where: { quotationId: quotation.id } });
    } else {
      create["userId"] = req.userId;
      quotation = await Quotation.create(create);
    }
    const assets = req.body.asset_detail;
    for (const key in assets) {
      assets[key]["quotationId"] = quotation.id;
      assets[key]["userId"] = req.userId;
    }

    await quotationAssets.bulkCreate(assets);
    return quotation;
  } catch (error) {
    next(error);
  }
}

async function handleInsurance(req, next, quotation) {
  try {
    const data = await Quotation.findOne({
      where: { id: quotation.id },
      include: [quotationAssets],
    });
    const create = new Object();
    for (const key in data.dataValues) {
      if (key == "quotation_assets") {
        continue;
      }
      create[key] = quotation[key];
    }
    create["insurance_assets"] = [];
    const asset_list = [];
    for (const key in data.quotation_assets) {
      const innerData = data.quotation_assets[key].dataValues;
      create["insurance_assets"].push(innerData);
      asset_list.push(innerData.assetId);
    }

    await Insurance.create(create, { include: [insuranceAssets] });
    await quotationAssets.destroy({ where: { quotationId: data.id } });
    await data.destroy();

    await Assets.update(
      {
        status: "safe and insured",
      },
      { where: { id: asset_list } }
    );
    await assetStatus.update(
      { status: "safe and insured" },
      { where: { assetId: asset_list } }
    );
    return true;
  } catch (error) {
    next(error);
  }
}

exports.getPendingQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findAndCountAll({
      where: { userId: req.userId },
      include: [
        {
          model: quotationAssets,
          include: [{ model: Assets, include: [{ model: Domicile }] }],
        },
      ],
    });
    return res.send({
      message: "Pending Quotations fetched successfully",
      data: quotation,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.getInsuredQuotation = async (req, res, next) => {
  try {
    const insurance = await Insurance.findAndCountAll({
      where: { userId: req.userId },
      include: [
        {
          model: insuranceAssets,
          include: [{ model: Assets, include: [{ model: Domicile }] }],
        },
      ],
    });
    return res.send({
      message: "Insurances fetched successfully",
      data: insurance,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAssetForQuotation = async (req, res, next) => {
  const assets = await Assets.findAndCountAll({
    subQuery: false,
    include: [
      { model: quotationAssets, required: false },
      {
        model: insuranceAssets,
        required: false,
      },
      {
        model: Domicile,
      },
    ],
    where: {
      userId: req.userId,
      "$insurance_asset.id$": null,
      "$quotation_asset.id$": null,
    },
  });
  return res.send({ data: assets, status: true, message: "fetched" });
};

exports.addAssetWithInsurance = async (req, res, next) => {
  const schema = Joi.object({
    build_number: Joi.string().required(),
    domicileId: Joi.number().required(),
    name: Joi.string().required(),
    price: Joi.number().required(),
    start_date: Joi.number().allow(),
    end_date: Joi.number().allow(),
    category: Joi.string().allow(),
    brand: Joi.string().allow(),
  });

  try {
    const { build_number, domicileId, name, price } = req.body;
    await schema.validateAsync(req.body);
    const create = {
      build_number,
      domicileId,
      name,
      userId: req.userId,
      category: req.body.category || null,
      brand: req.body.brand || null,
      purchase_price: price,
      status: "safe and insured",
      asset_image:
        config.get("App.baseUrl.backEndUrl") +
        "assets/serverDefault/mobile.png",
      asset_statuses: [{ status: "safe" }, { status: "safe and insured" }],
      insurance_asset: {
        insurance: {
          type: "asset cover",
          price: price,
          start_date: req.body.start_date || null,
          end_date: req.body.end_date || null,
          userId: req.userId,
        },
      },
    };
    await Assets.create(create, {
      include: [
        { model: insuranceAssets, include: [Insurance] },
        assetFiles,
        assetStatus,
      ],
    });
    return res.send({ message: "Inserted successfully", status: true });
  } catch (error) {
    next(error);
  }
};
