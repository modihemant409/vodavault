const Joi = require("joi");
const Domicile = require("../model/Domicile");
const helper = require("../helper/functions");
const Assets = require("../model/Assets");

exports.addDomicile = async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      address: Joi.string().required(),
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    });
    await schema.validateAsync(req.body);
    const create = new Object();
    for (const key in req.body) {
      create[key] = req.body[key];
    }
    create["userId"] = req.userId;
    await Domicile.create(create);
    return res.send({ status: true, message: "Domicile added successfully" });
  } catch (error) {
    return next(error);
  }
};

exports.domicileList = async (req, res, next) => {
  try {
    const domicile = await Domicile.findAll({
      where: { userId: req.userId },
      attributes: { exclude: ["userId", "updatedAt"] },
    });
    return res.send({
      status: true,
      message: "Domicile fetched successfully",
      data: domicile,
    });
  } catch (error) {
    return next(error);
  }
};

exports.editDomicile = async (req, res, next) => {
  try {
    const schema = Joi.object({
      domicileId: Joi.number().allow(),
      name: Joi.string().allow(),
      description: Joi.string().allow(),
      address: Joi.string().allow(),
      lat: Joi.number().allow(),
      lng: Joi.number().allow(),
    });
    await schema.validateAsync(req.body);
    const domicileId = req.body.domicileId;
    const domicile = await Domicile.findOne({ where: { id: domicileId } });
    helper.dataNotFound(domicile, "Domicile not found", 404);
    if (domicile.userId != req.userId) {
      const error = new Error("unAuthorized Access!!");
      error.statuscode = 401;
      throw error;
    }
    const update = new Object();
    for (const key in req.body) {
      if (key == "domicileId") {
        continue;
      }
      update[key] = req.body[key];
    }
    console.log(update);
    console.log(domicile);
    await domicile.update(update);
    return res.send({ message: "updated successfully", status: true });
  } catch (error) {
    return next(error);
  }
};

exports.deleteDomicile = async (req, res, next) => {
  try {
    const domicileId = req.params.domicileId;
    const domicile = await Domicile.findOne({ where: { id: domicileId } });
    helper.dataNotFound(domicile, "Domicile not found", 404);
    if (domicile.userId != req.userId) {
      const error = new Error("unAuthorized Access!!");
      error.statuscode = 401;
      throw error;
    }
    await domicile.destroy();
    return res.send({ message: "deleted successfully", status: true });
  } catch (error) {
    return next(error);
  }
};

exports.domicileDetail = async (req, res, next) => {
  try {
    const domicileId = req.params.domicileId || null;
    const domicile = await Domicile.findOne({
      where: { id: domicileId, userId: req.userId },
      include: [
        {
          model: Assets,
        },
      ],
    });
    helper.dataNotFound(domicile, "Domicile not fount", 404);
    return res.send({
      message: "fetched successfully",
      data: domicile,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.GetCurrentDomicile = async (req, res, next) => {
  try {
    const schema = Joi.object({
      lat: Joi.number().required(),
      lon: Joi.number().required(),
    });
    await schema.validateAsync(req.body);
    let lat1 = req.body.lat;
    let lon1 = req.body.lon;
    const domiciles = await Domicile.findAll({ where: { userId: req.userId } });
    const pi80 = Math.PI / 180;
    lat1 *= pi80;
    lon1 *= pi80;

    domiciles.forEach((domicile) => {
      let lat2 = domicile.lat;
      let lon2 = domicile.lng;
      lat2 *= pi80;
      lon2 *= pi80;

      const r = 6371; // mean radius of Earth in km
      let dlat = lat2 - lat1;
      let dlon = lon2 - lon1;
      let a =
        Math.sin(dlat / 2) * Math.sin(dlat / 2) +
        Math.cos(lat1) *
          Math.cos(lat2) *
          Math.sin(dlon / 2) *
          Math.sin(dlon / 2);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      let km = r * c * 1000;
      if (km <= 100) {
        return res.send({
          message: "No domicile found",
          status: true,
          data: domicile,
        });
      }
    });
    return res.send({ message: "No domicile found", status: true, data: null });
  } catch (error) {
    next(error);
  }
};
