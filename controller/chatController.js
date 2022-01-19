const chatMessage = require("../model/chatMessage");
const User = require("../model/user");
const Notification = require("../model/notification");
const multer = require("multer");
const helper = require("../helper/functions");
const uuid = require("uuid");
const config = require("config");
const specialistRequest = require("../model/specialistRequest");
const { Op } = require("sequelize");

exports.sendMessage = async (req, res, next) => {
  const create = new Object();
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "assets/profiles");
    },
    filename: function (req, file, cb) {
      cb(null, uuid.v4() + file.originalname.replace(/\s/g, ""));
    },
  });
  var upload = multer({ storage: storage }).single("message");
  upload(req, res, async function () {
    try {
      for (const key in req.body) {
        create[key] = req.body[key];
      }
      if (req.body.type != "text") {
        create["message"] =
          req.body.type != "text"
            ? config.get("App.baseUrl.backEndUrl") + req.file.path
            : req.body.message;
        config.get("App.baseUrl.backEndUrl") + req.file.path;
      }
      create["date"] = new Date().toString();

      const message = new Object();
      const request = await specialistRequest.findByPk(req.body.requestId, {
        include: [{ model: User, as: "specialist" }, { model: User }],
      });
      await chatMessage.create(create);
      message["type"] = "message Received";
      message["request_id"] = request.id;
      if (req.body.from_ == "specialist") {
        message["message"] =
          req.body.type == "text"
            ? `Message received from specialist ${request.specialist.first_name}`
            : `File received from specialist ${request.specialist.first_name}`;
        await helper.sendNotification(
          request.user.device_type,
          message,
          request.user.device_token
        );
      } else {
        message["message"] =
          req.body.type == "text"
            ? `Message received from Customer ${request.user.first_name}`
            : `File received from specialist ${request.user.first_name}`;
        await helper.sendNotification(
          request.user.device_type,
          message,
          request.specialist.device_token
        );
      }
      await Notification.create({
        notification: JSON.stringify(message),
        userId: req.userId,
        requestId: request.id,
      });
      return res.send({ message: "sent successfully", status: true });
    } catch (error) {
      if (req.file) {
        helper.removeFile(req.file.path);
      }
      next(error);
    }
  });
};

exports.getMessage = async (req, res, next) => {
  try {
    const count = await chatMessage.count({
      where: { requestId: req.params.requestId },
    });
    const message = await chatMessage.findAll({
      where: { requestId: req.params.requestId },
      limit: 25,
      order: [["createdAt", "DESC"]],
    });
    return res.send({
      data: { total_message: count, message: message },
      status: true,
      message: "fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getMessageById = async (req, res, next) => {
  try {
    const message = await chatMessage.findOne({
      where: { id: req.params.messageId },
    });
    const count = await chatMessage.count({
      where: {
        requestId: message.requestId,
        createdAt: { [Op.gt]: message.createdAt },
      },
    });
    const new_message = await chatMessage.findAll({
      where: {
        requestId: message.requestId,
        createdAt: { [Op.gt]: message.createdAt },
      },
      limit: 25,
    });
    return res.send({
      data: { message_left: count, message: new_message },
      status: true,
      message: "fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};
