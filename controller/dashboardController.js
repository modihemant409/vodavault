const Assets = require("../model/Assets");
const Domicile = require("../model/Domicile");

exports.getDashboard = async (req, res, next) => {
  try {
    const object = new Object();
    object["asset_count"] = await Assets.count({
      where: { userId: req.userId },
    });
    object["domicile_count"] = await Domicile.count({
      where: { userId: req.userId },
    });
    object["total_quotation"] = 0;
    object["total_insurance"] = 0;
    return res.send({
      data: object,
      message: "fetched successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};
