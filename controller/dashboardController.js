const Assets = require("../model/Assets");
const Domicile = require("../model/Domicile");
const insuranceAssets = require("../model/insuranceAssets");
const quotationAssets = require("../model/quotationAssets");
const specialistRequest = require("../model/specialistRequest");

exports.getDashboard = async (req, res, next) => {
  try {
    const object = new Object();
    object["asset_count"] = await Assets.count({
      where: { userId: req.userId },
    });
    object["domicile_count"] = await Domicile.count({
      where: { userId: req.userId },
    });
    const count = await quotationAssets.count({
      include: [{ model: Assets, where: { userId: req.userId } }],
    });
    object["total_insurance"] = await insuranceAssets.count({
      include: [{ model: Assets, where: { userId: req.userId } }],
    });

    object["total_quotation"] =
      object["asset_count"] - object["total_insurance"] - count;

    object["total_jobs"] = await specialistRequest.count({
      where: { userId: req.userId },
    });
    object["total_valuation"] = 0;
    return res.send({
      data: object,
      message: "fetched successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};
