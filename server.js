const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const cors = require("cors");

//api route
const users = require("./api/users");

//keys
const db = require("./config/keys").mongo;
const secret = require("./config/keys").secret;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

mongoose
  .connect(db)
  .then(() => console.log("db connected"))
  .catch(err => console.log(err));

const port = process.env.PORT || 5000;

app.use("/api/users", users);

const io = socketio(4000);
let connectedUsers = [];
io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(socket.handshake.query.token, secret, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error"));
      } else {
        socket.decoded = decoded;
        next();
      }
    });
  } else {
    return next(new Error("Authentication error"));
  }
}).on("connection", socket => {
  connectedUsers.push(socket.decoded.username);
  io.emit("message", {
    text: `${socket.decoded.username} connected`,
    date: Date.now(),
    username: "Server",
    flag: "connection",
    username: socket.decoded.username,
    connectedUsers: connectedUsers
  });
  socket.on("message", message => {
    if (/^(\/pm)/.test(message.text)) {
      const username = message.text.split(" ")[1];
      const textToSend = message.text.split(" ")[2];
      for (let socketId of Object.keys(io.sockets.sockets)) {
        const socketReceiver = io.sockets.sockets[socketId];
        if (socketReceiver.decoded.username === username) {
          const messageToSend = { ...message };
          messageToSend.text = textToSend;
          messageToSend.private = true;
          io.to(`${socketId}`).emit("message", messageToSend);
          io.to(`${socket.id}`).emit("message", messageToSend);
          return;
        }
      }
      io.to(`${socket.id}`).emit("message", {
        text: "User not found",
        username: "Server",
        date: Date.now
      });
    } else {
      io.emit("message", message);
    }
  });
  socket.on("typing", username => {
    io.emit("typing", username);
  });
  socket.on("disconnect", () => {
    //console.log("disconnected!!!");
    io.emit("disconnect", socket.decoded.username);
    const newUsers = connectedUsers.filter(
      user => user !== socket.decoded.username
    );
    connectedUsers = newUsers;
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
