const Joi = require("joi");
const multer = require("multer");
const helper = require("../helper/functions");
const uuid = require("uuid");
const config = require("config");

const User = require("../model/user");
const Notification = require("../model/notification");

exports.editProfile = async (req, res, next) => {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "assets/profiles");
    },
    filename: function (req, file, cb) {
      cb(null, uuid.v4() + file.originalname.replace(/\s/g, ""));
    },
  });
  var upload = multer({ storage: storage }).single("profile_image");
  upload(req, res, async function () {
    const schema = Joi.object({
      first_name: Joi.string().trim().allow(),
      last_name: Joi.string().trim().allow(),
      gender: Joi.string().allow(),
      mobile: Joi.number().allow(),
      profile_image: Joi.allow(),
    });
    try {
      await schema.validateAsync(req.body);
      let user = await User.findOne({ where: { id: req.userId } });
      const create = new Object();
      for (const key in req.body) {
        if (key == "profile_image") {
          continue;
        }
        create[key] = req.body[key];
      }
      if (req.file) {
        if (user.profile_image) {
          helper.removeFile(user.profile_image);
        }
        create["profile_image"] =
          config.get("App.baseUrl.backEndUrl") + req.file.path;
      }

      await user.update(create);

      return res.status(200).json({
        status: true,
        message: "updated successfully",
      });
    } catch (err) {
      if (req.file) {
        helper.removeFile(req.file.path);
      }
      next(err);
    }
  });
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: {
        exclude: [
          "memberCategoryId",
          "is_blocked",
          "device_token",
          "device_type",
          "email_verified",
          "user_type",
          "token",
          "password",
          "status",
        ],
      },
    });
    helper.dataNotFound(user, "invalid User", 404);
    return res.send({
      message: "fetched successfully",
      status: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeNotification = async (req, res, next) => {
  try {
    await Notification.destroy({
      where: { id: req.params.notificationId, userId: req.userId },
    });
    return res.send({ message: "removed successfully.", status: true });
  } catch (err) {
    next(err);
  }
};

exports.getNotification = async (req, res, next) => {
  const notification = await Notification.findAll({
    where: { userId: req.userId },
  });
  return res.send({
    message: "changed successfully.",
    status: true,
    data: notification,
  });
};

exports.addCountry = async (req, res, next) => {
  try {
    const country = req.params.country;
    await User.update({ country }, { where: { id: req.userId } });
    return res.send({ status: true, message: "success" });
  } catch (error) {
    next(error);
  }
};

exports.makeUserPremiume = async(req,res,next)=>{

  try {
    const is_user_premimum = req.body.status;
    const userId           = req.body.userId;
    await User.update({ is_user_premimum: is_user_premimum }, { where: { id: userId } });
    return res.send({ status: true, message: "success update user premium status" });
  } catch (error) {
    next(error);
  }

}