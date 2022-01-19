const Joi     = require("joi");
const multer  = require("multer");
const helper  = require("../helper/functions");
const uuid    = require("uuid");
const config  = require("config");

const User              = require("../model/user");
const Coupon            = require("../model/Coupon");
const Notification      = require("../model/notification");
<<<<<<< HEAD
=======
const Package           = require("../model/package");
const packageAsset      = require("../model/packageAsset");
const userPackageBuy    = require("../model/userPackageBuy");
>>>>>>> cde4a08f3ab41a8b8153d359dee921d0a370b275
const { Sequelize,Op }  = require("sequelize");
const moment            = require('moment');

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

    const sevenDaysFromNow = new Date(new Date().setDate(new Date().getDate() +30));

    const mydate = moment(sevenDaysFromNow).format('YYYY-MM-DD');

    await User.update({ is_user_premimum: is_user_premimum, expire_date: mydate}, { where: { id: userId } });
    return res.send({ status: true, message: "success update user premium status" });
  } catch (error) {
    next(error);
  }
};

<<<<<<< HEAD
=======
exports.SubscriptionsBuy = async(req,res,next)=>{

  try {
    const userId           = req.body.user_id;
    const package_id       = req.body.package_id;
    const price            = req.body.price;
    const transaction_id   = req.body.transaction_id;

    await userPackageBuy.create({ 
        package_id: package_id,
        user_id: userId,
        price: price,
        transaction_id: transaction_id,
     });

    return res.send({ status: true, message: "success add subscription buy" });
  } catch (error) {
    next(error);
  }
};

>>>>>>> cde4a08f3ab41a8b8153d359dee921d0a370b275
exports.ApplyCoupon = async (req, res, next) => {

  try {
    const coupon_code = req.body.coupon_code;
    const userId = req.body.userId;

    var date_ob = new Date();
    var day = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();

    // var date = year + "-" + month + "-" + day;
    // console.log(date);

    // var hours = date_ob.getHours();
    // var minutes = date_ob.getMinutes();
    // var seconds = date_ob.getSeconds();

    var dateTime = year+"-"+month+"-"+day;
    // console.log(dateTime);
    const copounlist = await Coupon.findOne({
      where: {
        coupon_code: coupon_code,
        end_date: {
          // [Op.eq]: dateTime
          [Op.gte]: dateTime,
        }
      }
    });

    if (copounlist){
      
        const sevenDaysFromNow = new Date(new Date().setDate(new Date().getDate() + copounlist.no_of_days));
    
        const mydate = moment(sevenDaysFromNow).format('YYYY-MM-DD');
        // console.log(mydate);
        await User.update({ is_user_premimum: "1", expire_date: mydate}, { where: { id: userId } });
        return res.send({
          message: "successfully apply code",
          status: true,
          data: [],
        });

    }
    else{
        return res.send({
          message: "code not valid",
          status: false,
          data: [],
        });
    }
    //
    //await User.update({ is_user_premimum: is_user_premimum }, { where: { id: userId } });
<<<<<<< HEAD
   
=======
>>>>>>> cde4a08f3ab41a8b8153d359dee921d0a370b275

  } catch (error) {
    next(error);
  }
<<<<<<< HEAD
};
=======
};

exports.SubscriptionsData = async (req, res, next) => {

  try {
        // console.log(mydate);
   const notification = await Package.findAll({
      where: { status: '1' },
     include: [
     {
         model: packageAsset,
     },
    ]
    });
        return res.send({
          message: "subscriptions data list",
          status: true,
          data: notification,
        });

    //await User.update({ is_user_premimum: is_user_premimum }, { where: { id: userId } });

  } catch (error) {
    next(error);
  }
};
exports.SubscriptionsDetails = async (req, res, next) => {

  try {

  // console.log(mydate);
   const notification = await Package.findOne({
     where: { id: req.params.package_id },
     include: [
     {
         model: packageAsset,
     },
    ]
    });
        return res.send({
          message: "subscriptions data list",
          status: true,
          data: notification,
        });

    //await User.update({ is_user_premimum: is_user_premimum }, { where: { id: userId } });

  } catch (error) {
    next(error);
  }
};

exports.My_Subscription = async (req, res, next) => {

  try {
    const notification = await userPackageBuy.findAll({
      where: { user_id: req.params.userId },
      include: [
        {
          model: Package,
        },
      ]
    });

    return res.send({
      message: "subscriptions list",
      status: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};
>>>>>>> cde4a08f3ab41a8b8153d359dee921d0a370b275
