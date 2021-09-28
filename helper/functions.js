const fs = require("fs");
const Path = require("path");
const config = require("config");
const axios = require("axios").default;
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
hhhh;
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

exports.sendNotification = async (deviceType, message, token) => {
  var notification;
  var notificationBody;
  if (deviceType == "android") {
    notification = {
      title: "VodaVault",
      sound: "default",
      icon: "",
      ...message,
    };
    notificationBody = {
      data: notification,
      to: token,
    };
  } else {
    notification = {
      title: "VodaVault",
      sound: "default",
      icon: "",
      ...message,
    };
    const body = {
      ...message,
    };
    notificationBody = {
      data: notification,
      to: token,
      body,
    };
  }
  axios
    .post("https://fcm.googleapis.com/fcm/send", notificationBody, {
      headers: {
        Authorization:
          "key=" +
          "AAAA5mnI-WY:APA91bEuH4xxGXfhQQShPwR2oH1NttlM3kAkuG8Q_-eYDXx0TD4_n8RL_H2qILSKtCgvXqkL5kq0LPyAxypvonn91PyQyfNAo4FZwctLZy8V3fcEVy3sb_gjzTqKI-ruL5xby06luEJq",
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
  return true;
};
