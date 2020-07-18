const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const socketio = require("socket.io");
const io = socketio(http);
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, "../public");

app.use(express.static(publicDirectory));

io.on("connection", socket => {
  console.log("New websocket connection");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", `${user.username} has joined!`));

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (msg, callback) => {
    const filter = new Filter();

    const user = getUser(socket.id);

    if (filter.isProfane(msg)) return callback("Profanity not allowed");

    io.to(user.room).emit("message", generateMessage(user.username, msg));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id); 

    if (user) {
      io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left`));
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
    
    
  });

  socket.on("sendLocation", (obj, callback) => {
    const user = getUser(socket.id);
    
    const url = `https://google.com/maps?q=${obj.latitude},${obj.longitude}`;
    
    io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, url));
    callback();
  });
});

http.listen(port, console.log(`Server running on ${port}`));
