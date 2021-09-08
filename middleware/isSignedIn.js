const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../model/user");
module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  let decodedToken;
  let token;
  try {
    token = authHeader.split(" ")[1];
    decodedToken = jwt.verify(token, config.get("App.JwtKey"));
  } catch (err) {
    req.is_logged_in = false;
    return next();
  }
  if (!decodedToken) {
    req.is_logged_in = false;

    return next();
  }
  if (!decodedToken.userId) {
    req.is_logged_in = false;

    return next();
  }
  const user = await User.findOne({
    where: { id: decodedToken.userId },
    attributes: ["name", "id", "profile_url"],
  });
  if (!user) {
    req.is_logged_in = false;
    return next();
  }
  try {
    req.is_logged_in = true;
    req.user = user;
    return next();
  } catch (err) {
    console.log(err);
    return next(err);
  }
};
