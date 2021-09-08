const fs = require("fs");
const Path = require("path");
const config = require("config");

exports.removeFile = (file) => {
  if (!file) {
    console.log("no file");
    return;
  }
  const path = Path.join(
    __dirname,
    "../",
    file.replace(config.get("App.baseUrl.backEndUrl"), "")
  );
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
    return "success";
  }
  return "doesn't exist";
};

exports.dataNotFound = (model, message, statuscode) => {
  if (!model) {
    const error = new Error(message);
    error.statuscode = statuscode;
    throw error;
  }
};

exports.randomStr = (len, arr) => {
  var ans = "";
  for (var i = len; i > 0; i--) {
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans;
};
