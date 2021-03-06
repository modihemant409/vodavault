const specialistRequest = require("../model/specialistRequest");
const helper = require("../helper/functions");
const User = require("../model/user");
const Notification = require("../model/notification");
const Assets = require("../model/Assets");
const assetFiles = require("../model/assetFiles");
const Domicile = require("../model/Domicile");
const assetStatus = require("../model/assetStatus");
const specialistAssets = require("../model/specialistAsset");
const config = require("config");

const multer = require("multer");
const uuid = require("uuid");
const Joi = require("joi");

exports.addRequest = async (req, res, next) => {
  try {
    const create = new Object();
    const check = await specialistRequest.findOne({
      where: {
        domicileId: req.body.domicileId,
        status: ["pending", "alloted"],
      },
    });
    helper.dataNotFound(!check, "request already sent for this Domicile", 409);
    for (const key in req.body) {
      create[key] = req.body[key];
    }
    create["userId"] = req.userId;
    const user = await User.findOne({ where: { id: req.userId } });
    const request = await specialistRequest.create(create);
    const message = new Object();
    message["message"] = "Request For Specialist Placed Successfully";
    message["type"] = "Request Placed";
    message["request_id"] = request.id;

    await helper.sendNotification(user.device_type, message, user.device_token);
    await Notification.create({
      notification: JSON.stringify(message),
      userId: req.userId,
      requestId: request.id,
    });
    return res.send({
      message: "request sent successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.requestAgain = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.userId } });
    const request = await specialistRequest.findOne({
      where: { id: req.params.requestId },
    });
    helper.dataNotFound(request, "Invalid request", 404);
    request.status = "pending";
    request.reason = null;
    request.specialistId = null;
    await request.save();
    const message = new Object();
    message["message"] = "Request For Specialist Placed again Successfully";
    message["type"] = "Request Placed Again";
    message["request_id"] = request.id;

    await helper.sendNotification(user.device_type, message, user.device_token);
    await Notification.create({
      notification: JSON.stringify(message),
      userId: req.userId,
      requestId: request.id,
    });
    return res.send({ message: "request sent successfully", status: true });
  } catch (error) {
    next(error);
  }
};

exports.cancelRequest = async (req, res, next) => {
  try {
    const requestId = req.body.requestId;
    const reason = req.body.reason || null;
    const request = await specialistRequest.findOne({
      where: { id: requestId, userId: req.userId },
    });
    helper.dataNotFound(request, "Invalid request", 404);
    await request.update({ status: "cancelled", reason });
    const user = await User.findByPk(req.userId);
    const specialist = await User.findByPk(request.specialistId);
    if (specialist) {
      const message = new Object();
      message["message"] =
        "Request Cancelled by " + user.first_name + " " + user.last_name;
      message["type"] = "Request Cancelled";
      message["request_id"] = request.id;
      await helper.sendNotification(
        specialist.device_type,
        message,
        specialist.device_token
      );
      await Notification.create({
        notification: JSON.stringify(message),
        userId: specialist.id,
        requestId: request.id,
      });
    }
    return res.send({
      message: "request cancelled successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSentRequest = async (req, res, next) => {
  try {
    console.log(req.userId);
    const request = await specialistRequest.findAll({
      where: { userId: req.userId },
      include: [
        { model: Domicile },
        {
          model: User,
          foreignKey: "specialistId",
          as: "specialist",
        },
        {
          model: specialistAssets,
        },
      ],
    });
    return res.send({
      message: "fetched successfully",
      data: request,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRequestDetail = async (req, res, next) => {
  try {
    const request = await specialistRequest.findOne({
      where: { id: req.params.requestId },
      include: [
        { model: Domicile },
        {
          model: User,
          foreignKey: "specialistId",
          as: "specialist",
        },
        {
          model: specialistAssets,
          include: [Assets],
        },
      ],
    });
    return res.send({
      message: "fetched successfully",
      data: request,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

//specialist
exports.getAllJobs = async (req, res, next) => {
  try {
    const request = await specialistRequest.findAll({
      where: { specialistId: req.userId },
      include: [
        { model: Domicile },
        {
          model: User,
        },
      ],
    });
    return res.send({
      message: "fetched successfully",
      data: request,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllCancelledJobs = async (req, res, next) => {
  try {
    const request = specialistRequest.findAll({
      where: { specialistId: req.userId, status: "cancelled" },
      include: [
        { model: Domicile },
        {
          model: User,
        },
      ],
    });
    return res.send({
      message: "fetched successfully",
      data: request,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.addAssetBySpecialist = async (req, res, next) => {
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
      const request = await specialistRequest.findOne({
        where: {
          id: req.body.requestId,
          specialistId: req.userId,
          domicileId: req.body.domicileId[0],
        },
      });
      console.log(request.dataValues);
      helper.dataNotFound(request, "Request not found", 404);
      for (let i = 0; i < req.body.name.length; i++) {
        let array = [];
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
          asset_files: array,
          asset_statuses: [{ status: "safe" }],
          specialist_asset: [{ specialistRequestId: request.id }],
        });
      }
      await Assets.bulkCreate(object, {
        include: [assetFiles, assetStatus, specialistAssets],
      });
      return res.send({ message: "inserted successfully", status: true });
    } catch (error) {
      req.files.forEach((file) => {
        helper.removeFile(file.path);
      });
      return next(error);
    }
  });
};

exports.getJobDetail = async (req, res, next) => {
  try {
    const request = await specialistRequest.findOne({
      where: { id: req.params.requestId, specialistId: req.userId },
      include: [
        {
          model: User,
          attributes: [
            "first_name",
            "last_name",
            "profile_image",
            "id",
            "user_type",
            "email",
            "mobile",
          ],
        },
        { model: Domicile },
        { model: specialistAssets, include: [Assets] },
      ],
    });
    helper.dataNotFound(request, "Request not found", 404);
    return res.send({
      message: "fetched successfully",
      data: request,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.confirmAssets = async (req, res, next) => {
  try {
    const assets = req.body.assets;
    await Assets.update({ userId: req.userId }, { where: { id: assets } });
    await specialistAssets.update(
      { is_confirmed: "1" },
      { where: { assetId: assets } }
    );

    const requestAsset = await specialistAssets.findOne({
      where: { assetId: assets[0] },
    });
    const request = await specialistRequest.findByPk(
      requestAsset.specialistRequestId
    );
    const user = await User.findByPk(req.userId);
    const specialist = await User.findByPk(request.specialistId);
    const message = new Object();
    message["message"] =
      "Assets confirmed by " + user.first_name + " " + user.last_name;
    message["type"] = "Assets Confirmed";
    message["request_id"] = request.id;

    await helper.sendNotification(
      specialist.device_type,
      message,
      specialist.device_token
    );
    await Notification.create({
      notification: JSON.stringify(message),
      userId: specialist.id,
      requestId: request.id,
    });
    return res.send({ message: "assets added successfully", status: true });
  } catch (error) {
    next(error);
  }
};

exports.markJobAsCompleted = async (req, res, next) => {
  try {
    const request = await specialistRequest.findOne({
      where: { id: req.params.requestId, specialistId: req.userId },
    });
    helper.dataNotFound(request, "invalid Job Id", 404);
    await request.update({
      status: "completed",
      completed_at: new Date().toString(),
    });
    const user = await User.findByPk(request.userId);
    const specialist = await User.findByPk(request.specialistId);

    const message = new Object();
    message[
      "message"
    ] = `Job Completed By ${specialist.first_name} ${specialist.last_name} Successfully`;
    message["type"] = "Job Completed";
    message["request_id"] = request.id;

    await helper.sendNotification(user.device_type, message, user.device_token);
    await Notification.create({
      notification: JSON.stringify(message),
      userId: req.userId,
      requestId: request.id,
    });
    return res.send({ status: true, message: "Job completed successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getSpecialistDashboard = async (req, res, next) => {
  try {
    const data = new Object();
    data["all_jobs"] = await specialistRequest.count({
      where: { specialistId: req.userId },
    });
    data["cancelled_jobs"] = await specialistRequest.count({
      where: { specialistId: req.userId, status: "cancelled" },
    });
    data["pending_jobs"] = await specialistRequest.count({
      where: { specialistId: req.userId, status: "alloted" },
    });
    data["my_customers"] = await specialistRequest.findAll({
      where: { specialistId: req.userId },
      group: ["userId"],
    });
    data["my_customers"] = data["my_customers"].length;
    return res.send({ data, message: "fetched successfully", status: true });
  } catch (error) {
    next(error);
  }
};

exports.getMyCustomer = async (req, res, next) => {
  try {
    const request = await specialistRequest.findAll({
      where: { specialistId: req.userId },
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "last_name", "profile_image"],
        },
        {
          model: Domicile,
        },
      ],
      group: ["userId"],
    });
    return res.send({
      data: request,
      message: "fetched successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.getJobOfCustomer = async (req, res, next) => {
  try {
    const request = await specialistRequest.findAll({
      where: { specialistId: req.userId, userId: req.params.customerId },
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "last_name", "profile_image"],
        },
        {
          model: Domicile,
        },
      ],
    });
    return res.send({
      data: request,
      message: "fetched successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.checkForSpecialistLocation = async (req, res, next) => {
  try {
    const schema = Joi.object({
      lat: Joi.number().required(),
      lon: Joi.number().required(),
      requestId: Joi.required(),
    });
    await schema.validateAsync(req.body);
    let lat1 = req.body.lat;
    let lon1 = req.body.lon;
    const request = await specialistRequest.findOne({
      where: { id: req.body.requestId },
    });
    const domicile = await Domicile.findOne({
      where: { id: request.domicileId },
    });
    const pi80 = Math.PI / 180;
    lat1 *= pi80;
    lon1 *= pi80;

    let lat2 = domicile.lat;
    let lon2 = domicile.lng;
    lat2 *= pi80;
    lon2 *= pi80;

    const r = 6371; // mean radius of Earth in km
    let dlat = lat2 - lat1;
    let dlon = lon2 - lon1;
    let a =
      Math.sin(dlat / 2) * Math.sin(dlat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let km = r * c * 1000;
    if (km <= 200) {
      return res.send({
        message: "domicile found",
        status: true,
        data: domicile,
      });
    }
    return res.send({ message: "No domicile found", status: true, data: null });
  } catch (error) {
    next(error);
  }
};
