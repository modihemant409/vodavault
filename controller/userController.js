const Joi = require("joi");
const multer = require("multer");
const helper = require("../helper/functions");
const uuid = require("uuid");
const config = require("config");

const User = require("../model/user");

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
