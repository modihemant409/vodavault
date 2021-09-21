const Assets = require("../model/Assets");
const Domicile = require("../model/Domicile");
const insuranceAssets = require("../model/insuranceAssets");
const quotationAssets = require("../model/quotationAssets");
const specialistRequest = require("../model/specialistRequest");
const valuationAssets = require("../model/valuationAssets");

exports.getDashboard = async (req, res, next) => {
  try {
    const object = new Object();
    object["asset_count"] = await Assets.count({
      where: { userId: req.userId },
    });
    object["domicile_count"] = await Domicile.count({
      where: { userId: req.userId },
    });
    object["total_insurance"] = await insuranceAssets.count({
      include: [{ model: Assets, where: { userId: req.userId } }],
    });

    const count = await quotationAssets.count({
      include: [{ model: Assets, where: { userId: req.userId } }],
    });
    object["quotation_in_pending"] = count;
    object["assets_not_quoted_not_insured"] =
      object["asset_count"] - object["total_insurance"] - count;

    object["total_quotations"] = await insuranceAssets.count({
      where: { through: "manual" },
      include: [{ model: Assets, where: { userId: req.userId } }],
    });
    object["total_jobs"] = await specialistRequest.count({
      where: { userId: req.userId },
    });
    object["total_valuation"] = await valuationAssets.count({
      include: [{ model: Assets, where: { userId: req.userId } }],
    });
    return res.send({
      data: object,
      message: "fetched successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};
