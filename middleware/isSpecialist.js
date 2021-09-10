const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../model/user");
module.exports = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.userId } });
    if (user.user_type != "specialist") {
      const error = new Error("unAuthorized access to specialist");
      error.statuscode = 401;
      throw error;
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
