const express = require("express");
const app = express();
const PORT = 47000;
const socket = require("socket.io");
const cors = require("cors");
//const helemt = require("helmet");
const path = require("path");

//database
const db = require("./database/util");

app.set("view engine", "ejs");
app.set("views", "views");

//Routes
const authRoutes = require("./routes/auth");
const domicileRoutes = require("./routes/domicile");
const assetRoutes = require("./routes/asset");
const dashboardRoutes = require("./routes/dashboard");
const userRoutes = require("./routes/user");

//Relations
const relations = require("./Relations/relations").relations();

//app.use(helemt());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/v1", authRoutes);
app.use("/api/v1/domicile", domicileRoutes);
app.use("/api/v1/asset", assetRoutes);
app.use("/api/v1/home", dashboardRoutes);
app.use("/api/v1/user", userRoutes);

//error handling
app.use((error, req, res, next) => {
  console.log(error);
  const status = false;
  const statusCode = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(statusCode).json({ status: status, message: message, data: data });
});

let Server;
let io;
db.sync()
  .then((result) => {
    Server = app.listen(PORT, (e) => {
      console.log("server is listening on " + PORT + " port");
    });

    // io = socket(Server, {
    //   cors: {
    //     origin: "*",
    //     methods: ["GET", "POST"],
    //   },
    // });
    // require("./routes/livelecture").setio(io);
    // const livelecture = require("./routes/livelecture").app;

    // app.use("/api/v1/live", livelecture);
  })
  .catch((err) => {
    console.log(err);
  });
