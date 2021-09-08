const express = require("express");
const app = express.Router();
const liveController = require("../controller/liveConroller");
const isAuth = require("../middleware/is-auth");
const isInstructor = require("../middleware/isInstructor");
const message = require("../model/message");

exports.setio = (socket) => {
  let io = socket;
  let socketList = {};
  app.get("/ping", (req, res) => {
    res
      .send({
        success: true,
      })
      .status(200);
  });

  app.post(
    "/schedule_lecture",
    isAuth,
    isInstructor,
    liveController.scheduleLive
  );

  app.get("/getmylives", isAuth, isInstructor, liveController.getMyLives);
  app.post("/cancellive", isAuth, isInstructor, liveController.cancelLive);
  app.post("/startlive", isAuth, isInstructor, liveController.startLive);
  app.get("/getLiveStatus/:roomname", liveController.getLiveStatus);
  app.post(
    "/livecompleted",
    isAuth,
    isInstructor,
    liveController.liveCompleted
  );

  //conference
  app.post("/start-conference", isAuth, liveController.startConference);
  app.get(
    "/conference-status/:roomname",
    isAuth,
    liveController.getConferenceStatus
  );
  app.post(
    "/change-conference-status",
    isAuth,
    liveController.changeConferenceStatus
  );

  io.on("connection", function (socket) {
    console.log("User Connected :" + socket.id);

    socket.on("disconnect", (data) => {
      console.log("User disconnected!");
    });

    socket.on("leave", (roomName, streamId) => {
      console.log("leave ", roomName, "stream id", streamId, socket.id);
      socket.broadcast.to(roomName).emit("leave", streamId, socket.id);
    });
    //Triggered when a peer hits the join room button.

    socket.on("join", function (data) {
      let rooms = io.sockets.adapter.rooms;
      console.log("roomname from front ", data.roomName);
      console.log("rooms ", rooms);

      let room = rooms.get(data.roomName);
      console.log("room", room);
      //room == undefined when no such room exists.
      if (room == undefined) {
        console.log("room creating data", data);
        if (data.adminId != data.userId) {
          console.log("in session-expired");
          console.log(socket.id);
          socket.emit("session-expired");
          return;
        }
        socketList[data.roomName] = data;
        socket.join(data.roomName);
        console.log("room created");
        socket.emit("created");
      } else {
        //room.size == 1 when one person is inside the room.
        socket.join(data.roomName);
        socket.emit("joined");
        if (data.userId == socketList[data.roomName].userId) {
          socketList[data.roomName] = data;
        }
        console.log("joined");
      }
      // else {
      //   //when there are already two people inside the room.
      //   //socket.emit("full");
      // }
      console.log(rooms);
    });

    //Triggered when the person who joined the room is ready to communicate.
    socket.on("ready", function (roomName, id) {
      console.log("READY", roomName, "id ", id);
      socket.broadcast.to(roomName).emit("ready", id); //Informs the other peer in the room.
    });

    //Triggered when server gets an icecandidate from a peer in the room.

    socket.on("candidate", function (candidate, roomName, fromId, toId) {
      console.log("candidate", candidate, " from ", fromId, " to ", toId);
      // socket.broadcast.to(roomName).emit("candidate", candidate, fromId); //Sends Candidate to the other peer in the room.
      socket.to(toId).emit("candidate", candidate, fromId); //Sends Candidate to the other peer in the room.
    });

    //Triggered when server gets an offer from a peer in the room.

    socket.on("offer", function (offer, toId, userInfo) {
      console.log("offer", offer, " from ", userInfo.socketId, " to ", toId);
      //socket.to(roomName).emit("offer", offer); //Sends Offer to the other peer in the room.
      socket.to(toId).emit("offer", offer, userInfo.socketId, userInfo); //Sends Offer to the other peer in the room.
    });

    //Triggered when server gets an answer from a peer in the room.

    socket.on("answer", function (answer, toId, userInfo) {
      console.log("answer", answer, " from ", " to ", toId);
      //socket.broadcast.to(roomName).emit("answer", answer); //Sends Answer to the other peer in the room.
      socket.to(toId).emit("answer", answer, userInfo.socketId, userInfo); //Sends Answer to the other peer in the room.
    });

    socket.on("leaveAll", (roomName) => {
      console.log("leaveAll", roomName);
      socket.broadcast.to(roomName).emit("leaveAll");
    });

    socket.on("updatemedia", (data) => {
      socket.broadcast.to(data.roomName).emit("updatemedia", data);
    });

    socket.on("sendMessage", (data) => {
      console.log("Message receieved", data);
      socket.broadcast.to(data.roomName).emit("receiveMessage", data);
    });
    //chat module
    socket.on("join-chat", (userInfo) => {
      socket.join(userInfo.roomname);
      console.log("room joined", userInfo);
      socket.broadcast.to(userInfo.roomname).emit("room-joined", userInfo);
    });

    socket.on("send-message", async (data) => {
      console.log("message_received", data);
      await message.create({
        message: data.message,
        senderId: data.senderId,
        type: data.type,
        receiverId: data.receiverId,
        roomname: data.roomname,
      });
      socket.broadcast.to(data.roomname).emit("message_received", data);
    });
  });
};

// Socket
//   io.on("connection", (socket) => {
//     console.log(`New User connected: ${socket.id}`);

//     socket.on("disconnect", () => {
//       socket.disconnect();
//       console.log("User disconnected!");
//     });

//     socket.on("BE-check-user", ({ roomId, userName }) => {
//       let error = false;
//       console.log(roomId, userName);
//       io.sockets.in(roomId).clients((err, clients) => {
//         clients.forEach((client) => {
//           if (socketList[client] == userName) {
//             error = true;
//           }
//         });
//         socket.emit("FE-error-user-exist", { error });
//       });
//     });

//     /**
//      * Join Room
//      */
//     // socket.on("BE-join-room", ({ roomId, userName }) => {
//     //   // Socket Join RoomName
//     //   console.log(roomId, userName);
//     //   socket.join(roomId);
//     //   socketList[socket.id] = { userName, video: true, audio: true };

//     //   // Set User List
//     //   io.sockets.in(roomId).clients((err, clients) => {
//     //     try {
//     //       const users = [];
//     //       clients.forEach((client) => {
//     //         // Add User List
//     //         users.push({ userId: client, info: socketList[client] });
//     //       });

//     //       socket.broadcast.to(roomId).emit("FE-user-join", users);
//     //       // io.sockets.in(roomId).emit('FE-user-join', users);
//     //     } catch (e) {
//     //       io.sockets.in(roomId).emit("FE-error-user-exist", { err: true });
//     //     }
//     //   });
//     // });

//     socket.on('BE-join-room', ({ roomId,hostId, userName }) => {
//     // Socket Join RoomName
//     socket.join(roomId);
//     socketList[socket.id] = { userName, hostId, video: true, audio: true };

//     // Set User List
//     io.sockets.in(roomId).clients((err, clients) => {
//       try {
//         const users = [];
//         clients.forEach((client) => {
//           // Add User List
//           console.log("client ", client)
//           users.push({ userId: client, info: socketList[client] });
//         });

//         socket.broadcast.to(roomId).emit('FE-user-join', users);
//         // io.sockets.in(roomId).emit('FE-user-join', users);
//         console.log("socket list", socketList);
//         console.log("users ", users)
//       } catch (e) {
//         io.sockets.in(roomId).emit('FE-error-user-exist', { err: true });
//       }
//     });
//   });

//     socket.on("BE-call-user", ({ userToCall, from, signal }) => {
//       console.log(signal, "usertocall " + userToCall, "from " + from);
//       io.to(userToCall).emit("FE-receive-call", {
//         signal,
//         from,
//         info: socketList[socket.id],
//       });
//     });

//     socket.on("BE-accept-call", ({ signal, to }) => {
//       console.log(signal, "accept " + to);
//       io.to(to).emit("FE-call-accepted", {
//         signal,
//         answerId: socket.id,
//       });
//     });

//     socket.on("BE-send-message", ({ roomId, msg, sender }) => {
//       io.sockets.in(roomId).emit("FE-receive-message", { msg, sender });
//     });

//     socket.on("BE-leave-room", ({ roomId, leaver }) => {
//       delete socketList[socket.id];
//       socket.broadcast
//         .to(roomId)
//         .emit("FE-user-leave", { userId: socket.id, userName: [socket.id] });
//       io.sockets.sockets[socket.id].leave(roomId);
//     });

//     socket.on("BE-toggle-camera-audio", ({ roomId, switchTarget }) => {
//       if (switchTarget === "video") {
//         socketList[socket.id].video = !socketList[socket.id].video;
//       } else {
//         socketList[socket.id].audio = !socketList[socket.id].audio;
//       }
//       socket.broadcast
//         .to(roomId)
//         .emit("FE-toggle-camera", { userId: socket.id, switchTarget });
//     });
//   });
//};
exports.app = app;

// const express = require("express");
// const message = require("../model/message");
// const app = express.Router();

// exports.setio = (socket) => {
//   let io = socket;
//   let socketList = {};
//   app.get("/ping", (req, res) => {
//     res
//       .send({
//         success: true,
//       })
//       .status(200);
//   });

//   // Socket
//   io.on("connection", function (socket) {
//     console.log("User Connected :" + socket.id);

//     socket.on("disconnect", (data) => {
//       console.log("User disconnected!");
//     });

//     socket.on("leave", (roomName, streamId) => {
//       console.log("leave ", roomName, "stream id", streamId, socket.id);
//       socket.broadcast.to(roomName).emit("leave", streamId, socket.id);
//     });
//     //Triggered when a peer hits the join room button.

//     socket.on("join", function (data) {
//       let rooms = io.sockets.adapter.rooms;
//       console.log("roomname from front ", data.roomName);
//       console.log("rooms ", rooms);

//       let room = rooms.get(data.roomName);
//       console.log("room", room);
//       //room == undefined when no such room exists.
//       if (room == undefined) {
//         if (data.adminId != data.userId) {
//           socket.to(socket.id).emit("leaveAll");
//         }
//         socketList[data.roomName] = data;
//         socket.join(data.roomName);
//         socket.emit("created");
//       } else {
//         //room.size == 1 when one person is inside the room.
//         socket.join(data.roomName);
//         socket.emit("joined");
//         if (data.userId == socketList[data.roomName].userId) {
//           socketList[data.roomName] = data;
//         }
//         console.log("joined");
//       }
//       // else {
//       //   //when there are already two people inside the room.
//       //   //socket.emit("full");
//       // }
//       console.log(rooms);
//     });

//     //Triggered when the person who joined the room is ready to communicate.
//     socket.on("ready", function (roomName, id) {
//       console.log("READY", roomName, "id ", id);
//       socket.broadcast.to(roomName).emit("ready", id); //Informs the other peer in the room.
//     });

//     //Triggered when server gets an icecandidate from a peer in the room.

//     socket.on("candidate", function (candidate, roomName, fromId, toId) {
//       console.log("candidate", candidate, " from ", fromId, " to ", toId);
//       // socket.broadcast.to(roomName).emit("candidate", candidate, fromId); //Sends Candidate to the other peer in the room.
//       socket.to(toId).emit("candidate", candidate, fromId); //Sends Candidate to the other peer in the room.
//     });

//     //Triggered when server gets an offer from a peer in the room.

//     socket.on("offer", function (offer, toId, userInfo) {
//       console.log("offer", offer, " from ", userInfo.socketId, " to ", toId);
//       //socket.to(roomName).emit("offer", offer); //Sends Offer to the other peer in the room.
//       socket.to(toId).emit("offer", offer, userInfo.socketId, userInfo); //Sends Offer to the other peer in the room.
//     });

//     //Triggered when server gets an answer from a peer in the room.

//     socket.on("answer", function (answer, toId, userInfo) {
//       console.log("answer", answer, " from ", " to ", toId);
//       //socket.broadcast.to(roomName).emit("answer", answer); //Sends Answer to the other peer in the room.
//       socket.to(toId).emit("answer", answer, userInfo.socketId, userInfo); //Sends Answer to the other peer in the room.
//     });

//     socket.on("leaveAll", (roomName) => {
//       console.log("leaveAll", roomName);
//       socket.broadcast.to(roomName).emit("leaveAll");
//     });

//     socket.on("updatemedia", (data) => {
//       socket.broadcast.to(data.roomName).emit("updatemedia", data);
//     });

//     //chat module
//     socket.on("join-chat", (userInfo) => {
//       socket.join(userInfo.roomName);
//       console.log("room joined", userInfo);
//       socket.broadcast.to(userInfo.roomName).emit("room-joined", userInfo);
//     });

//     socket.on("send-message", async (data) => {
//       console.log("message_received", data);
//       await message.create({
//         message: data.message,
//         senderId: data.from,
//         type: data.type,
//         receiverId: data.send_to,
//         roomname: data.roomName,
//       });
//       socket.broadcast.to(data.roomName).emit("message_received", data);
//     });
//   });
// };

// exports.app = app;
