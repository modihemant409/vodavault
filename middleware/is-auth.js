const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../model/user");
module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("not Authorized");
    error.statusCode = 401;
    next(error);
    return 0;
  }
  let decodedToken;
  let token;
  try {
    token = authHeader.split(" ")[1];
    decodedToken = jwt.verify(token, config.get("App.JwtKey"));
  } catch (err) {
    const error = new Error("Please Login.");
    error.statusCode = 401;
    return next(error);
  }
  if (!decodedToken) {
    const error = new Error("not Authorized");
    error.statusCode = 401;
    return next(error);
  }
  if (!decodedToken.userId) {
    const error = new Error("not Authorized");
    error.statusCode = 401;
    return next(error);
  }
  const user = await User.findOne({ where: { id: decodedToken.userId } });
  if (!user) {
    const error = new Error("Please Login.");
    error.statusCode = 401;
    return next(error);
  }
  try {
    req.userId = decodedToken.userId;
    return next();
  } catch (err) {
    return next(err);
  }
};
