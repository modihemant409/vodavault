const url = "https://arabboard.org/api/v1";
const bcrypt = require("bcryptjs");
const joi = require("joi");
const mailer = require("../helper/mailHelper");
const jwt = require("jsonwebtoken");
const config = require("config");
const sequelize = require("../database/util");
const multer = require("multer");
const Joi = require("joi");
const uuid = require("uuid");
const path = require("path");
const ejs = require("ejs");

const User = require("../model/user");
const forgotPassword = require("../model/forgotPassword");
const helper = require("../helper/functions");

exports.createPassword = async (req, res, next) => {
  try {
    const password = req.params.password;
    const hashedPassword = await bcrypt.hash(password, 12);
    return res.status(200).json({
      message: "Password created successfully",
      password: hashedPassword,
      status: true,
    });
  } catch (err) {
    if (!err.statuscode) {
      err.statuscode = 500;
    }
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().normalize().required(),
  });
  const email = req.body.email;
  try {
    await schema.validateAsync(req.body);

    const checkEmail = await User.findOne({ where: { email: email } });
    if (checkEmail) {
      return res.status(401).json({
        status: false,
        message: "Mail address Already Exist",
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "ok",
      });
    }
  } catch (err) {
    if (!err.statuscode) {
      err.statuscode = 500;
    }
    next(err);
  }
};

exports.signup = async (req, res, next) => {
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
    const schema = joi.object({
      first_name: joi.string().trim().required(),
      last_name: joi.string().trim().required(),
      email: joi.string().trim().email().normalize().required(),
      password: joi.string().required().min(6),
      gender: joi.string().required(),
      mobile: joi.number().required(),
      profile_image: Joi.allow(),
      country: Joi.string().allow(),
      user_type: Joi.allow().valid("user", "specialist"),
      device_token: Joi.allow(),
    });
    const transaction = await sequelize.transaction();
    try {
      await schema.validateAsync(req.body);
      let user = await User.findOne({ where: { email: req.body.email } });
      if (user) {
        const error = new Error("Email Already Exist");
        error.statuscode = 401;
        throw error;
      }
      const create = new Object();
      for (const key in req.body) {
        if (key == "profile_image") {
          continue;
        }
        create[key] = req.body[key];
      }
      if (req.file) {
        create["profile_image"] =
          config.get("App.baseUrl.backEndUrl") + req.file.path;
      }
      const hashedPassword    = await bcrypt.hash(create["password"], 12);
      create["password"]      = hashedPassword;
      // create["password"]   = hashedPassword;
      const sevenDaysFromNow  = new Date(new Date().setDate(new Date().getDate() + 30));
      const mydate            = moment(sevenDaysFromNow).format('YYYY-MM-DD');
      create["expire_date"]   = mydate;

      console.log(create);
      user = await User.create(create, { transaction });

      const buff = Buffer.from(user.email, "utf-8");
      console.log(
        config.get("App.baseUrl.backEndUrl") +
          "verifyuser/" +
          buff.toString("base64")
      );
      const mailData = await ejs.renderFile(
        path.join(__dirname, "../", "views/mail", "verifyUser.ejs"),
        {
          mail: user.email,
          name: user.name,
          path:
            config.get("App.baseUrl.backEndUrl") +
            "verifyuser/" +
            buff.toString("base64"),
        }
      );
      mailer.sendEmail(
        user.email,
        config.get("App.email"),
        "User Verififcation",
        mailData
      );
      await transaction.commit();

      return res.status(200).json({
        status: true,
        message:
          "Registered succesfully. Please Verify you Email " +
          user.email +
          " to continue Login.",
      });
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      if (req.file) {
        helper.removeFile(req.file.path);
      }
      if (!err.statuscode) {
        err.statuscode = 500;
      }
      next(err);
    }
  });
};

exports.verifyUser = async (req, res, next) => {
  const base64 = req.params.email;
  const email = Buffer.from(base64, "base64").toString("utf-8");
  try {
    const user = await User.findOne({ where: { email: email } });
    helper.dataNotFound(user, "Invalid user", 401);
    user.email_verified = "1";
    await user.save();
    return res.send("your Email is verified");
  } catch (err) {
    if (!err.statuscode) {
      err.statuscode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const schema = joi.object({
    email: joi.string().trim().required(),
    password: joi.string().required().min(6),
    device_token: Joi.allow(),
    device_type: Joi.allow(),
  });
  const email = req.body.email;
  const password = req.body.password;
  const device_token = req.body.device_token;
  const device_type = req.body.device_type;
  try {
    await schema.validateAsync(req.body);
    const user = await User.findOne({ where: { email: email } });
    helper.dataNotFound(user, "Email Incorrect", 401);

    const checkPassword = await bcrypt.compare(password, user.password);
    helper.dataNotFound(checkPassword, "Password Incorrect", 401);
    // if (user.email_verified != "1") {
    //   const error = new Error(
    //     "Email not verified. Please Verify Your Email " + user.email
    //   );
    //   error.statuscode = 401;
    //   throw error;
    // }
    if (user.is_blocked == "Blocked") {
      const error = new Error("Your account has been blocked");
      error.statuscode = 401;
      throw error;
    }
    const token = jwt.sign(
      { email: user.email, userId: user.id },
      config.get("App.JwtKey")
    );
    user.token = token;
    user.device_token = device_token;
    user.device_type = device_type;
    await user.save();
    await user.reload();

    delete user.dataValues.password;

    delete user.dataValues.memberCategoryId;
    delete user.dataValues.updatedAt;
    delete user.dataValues.createdAt;
    delete user.dataValues.is_blocked;
    delete user.dataValues.device_token;
    delete user.dataValues.device_type;
    delete user.dataValues.email_verified;
    delete user.dataValues.gender;
    delete user.dataValues.profile_url;

    res.status(200).json({
      status: true,
      data: user,
      message: "Logged in succesfully",
    });
  } catch (err) {
    if (!err.statuscode) {
      err.statuscode = 500;
    }
    next(err);
  }
};

exports.forgetPassword = async (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().normalize().required(),
  });
  const email = req.body.email;

  try {
    await schema.validateAsync(req.body);
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    helper.dataNotFound(user, "User not found", 404);
    if (user.email_verified != "1") {
      const error = new Error("email not verified");
      error.statuscode = 401;
      throw error;
    }
    let forgotpassword = await forgotPassword.findOne({
      where: { userId: user.id },
    });
    if (forgotpassword) {
      forgotpassword.destroy();
    }
    const otp = Math.random(new Date(), 5).toString().substring(3, 8);
    forgotpassword = new forgotPassword();
    forgotpassword.userId = user.id;
    forgotpassword.otp = otp;
    var expired_at = new Date();
    expired_at.setMinutes(expired_at.getMinutes() + 30);
    forgotpassword.expired_at = expired_at;
    await forgotpassword.save();
    await forgotpassword.reload();
    const mailData = await ejs.renderFile(
      path.join(__dirname, "../", "views/mail", "forgotPassword.ejs"),
      { name: user.name, otp: otp }
    );
    await mailer.sendEmail(
      user.email,
      config.get("App.email"),
      "User Verififcation",
      mailData
    );
    return res.status(200).json({
      status: true,
      message: "Otp sent to " + user.email,
    });
  } catch (err) {
    if (!err.statuscode) {
      err.statuscode = 500;
    }
    next(err);
  }
};

exports.checkOtp = async (req, res, next) => {
  const schema = joi.object({
    otp: joi.number().required(),
  });
  const otp = req.body.otp;

  try {
    await schema.validateAsync(req.body);
    const forgotpassword = await forgotPassword.findOne({
      where: { otp: otp },
    });
    helper.dataNotFound(forgotpassword, "Invalid otp", 401);
    if (forgotpassword.expired_at < new Date()) {
      const error = new Error("Otp Expired");
      error.statuscode = 401;
      throw error;
    }
    if (forgotpassword.is_used == "1") {
      const error = new Error("Otp already Used");
      error.statuscode = 401;
      throw error;
    }
    forgotpassword.is_used = "1";
    await forgotpassword.save();
    return res.status(200).json({
      status: true,
      message: "correct Otp",
    });
  } catch (err) {
    if (!err.statuscode) {
      err.statuscode = 500;
    }
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  const schema = joi.object({
    password: joi.string().required().min(6),
    otp: joi.string().required(),
  });
  const otp = req.body.otp;
  const newPassword = req.body.password;
  try {
    await schema.validateAsync(req.body);
    const forgotpassword = await forgotPassword.findOne({
      where: { otp: otp },
    });
    helper.dataNotFound(forgotpassword, "invalid User", 401);

    const user = await User.findByPk(forgotpassword.userId);
    const compare = await bcrypt.compare(newPassword, user.password);
    if (compare) {
      const error = new Error(
        "new password must be different from old password"
      );
      error.statuscode = 422;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    await user.reload();
    delete user.dataValues.password;
    res.status(200).json({
      status: true,
      data: user,
      message: "Password Changed Successfully",
    });
  } catch (err) {
    if (!err.statuscode) {
      err.statuscode = 500;
    }
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const userId = req.userId;
    await User.update(
      { device_token: "", token: null },
      { where: { id: userId } }
    );
    return res.status(200).json({
      message: "logged out",
      status: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.setNewPassword = async (req, res, next) => {
  const schema = joi.object({
    old_password: joi.string().required().min(6),
    new_password: joi.string().required().min(6),
  });

  const { new_password, old_password } = req.body;
  try {
    await schema.validateAsync(req.body);
    const user = await User.findByPk(req.userId);
    let compare = await bcrypt.compare(old_password, user.password);
    if (!compare) {
      const error = new Error("Incorrect Password");
      error.statuscode = 422;
      throw error;
    }
    if (old_password == new_password) {
      const error = new Error("Old Password must be different from old One");
      error.statuscode = 422;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(new_password, 12);
    user.password = hashedPassword;
    await user.save();
    await user.reload();
    res.status(200).json({
      status: true,
      message: "New Password set Successfully",
    });
  } catch (err) {
    if (!err.statuscode) {
      err.statuscode = 500;
    }
    next(err);
  }
};

exports.socialLogin = async (req, res, next) => {
  try {
    let user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      const create = new Object();
      if (req.body.profile_pic) {
        create["profile_image"] = request.body.profile_pic;
      }

      let Password = "".padStart(10, Math.random(0, 9999));
      create["password"] = await bcrypt.hash(Password, 12);
      create["user_type"] = "user";
      for (const key in req.body) {
        if (key == "profile_pic") {
          continue;
        }
        create[key] = req.body[key];
      }
      create["email_verified"] = "1";
      user = await User.create(create);
    }
    const token = jwt.sign(
      { email: user.email, userId: user.id },
      config.get("App.JwtKey")
    );
    await user.update({
      token: token,
      device_token: req.body.device_token || null,
      device_type: req.body.device_type || null,
    });

    return res.send({
      data: user,
      message: "Login successfully.",
      status: true,
    });
  } catch (err) {
    return next(err);
  }
};
