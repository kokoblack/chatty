const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

// const crypto = require("crypto");
// const randomId = () => crypto.randomBytes(8).toString("hex");

const app = express();
const server = http.createServer(app);
const newUser = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/chattyDB");

const chattySchema = new mongoose.Schema({
  _id: String,
  room: String,
  user: [
    {
      name: String,
      admin: String,
      _id: String,
      socketID: String,
    },
  ],
  conversation: [
    {
      name: String,
      message: String,
    },
  ],
});

const Room = mongoose.model("Room", chattySchema);

app.route("/rooms").post(async (req, res) => {
  const room = new Room(req.body);
  await room.save();
  console.log(req.body);
  res.send("request was succesful with ststus code 200");
});

app
  .route("/rooms/:roomID")
  .get(async (req, res) => {
    const users = await Room.findById(req.params.roomID);
    const user = {
      user: users.user,
      room: users.room
    }
    res.send(user);
  })
  .patch(async (req, res) => {
    newUser.name = req.body.name;
    newUser.admin = req.body.admin;

    await Room.updateOne(
      { _id: req.params.roomID },
      { $push: { user: req.body } }
    );
    console.log(req.body);
    res.send("request was succesful with status code 200");
  });

app
  .route("/rooms/conversation/:roomID")
  .get(async (req, res) => {
    const message = await Room.findById(req.params.roomID, "conversation");
    res.send(message);
  })
  .patch(async (req, res) => {
    await Room.updateOne(
      { _id: req.params.roomID },
      { $push: { conversation: req.body } }
    );
    res.send("request was succesful with status code 200");
  });

// const users = [];

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log(`${socket.id} connected `);

  socket
    .on("new user", async (user, room) => {
      const roomID = user.roomID;
      const newUser = {
        name: user.name,
        admin: user.admin,
        _id: user.id,
        socketID: socket.id,
      };

      await Room.updateOne({ _id: roomID }, { $push: { user: newUser } });

      const users = await Room.findById(user.roomID, "user");
      const onlineUsers = users.user.map((eve) => eve.name)
      const admin = users.user.filter((eve) => eve.admin === 'yes')
      const notAdmin = users.user.filter((eve) => eve.admin === 'no')
      console.log(admin)

      io.sockets.in(room).emit("users", onlineUsers, admin, notAdmin);
      socket.to(room).emit("user connected", user.name, admin, notAdmin);
      socket.on("disconnect", async () => {
        const users = await Room.findById(user.roomID, "user");
        const connectedUsers = users.user.filter(
          (eve) => eve.socketID !== socket.id
        );
        const offlineUser = users.user.filter(
          (eve) => eve.socketID === socket.id
        );

        await Room.updateOne(
          { _id: roomID },
          { $set: { user: connectedUsers } }
        );

        socket.to(room).emit("offline", offlineUser, connectedUsers);
      });
    })

    .on("join-room", (room) => socket.join(room))
    .on("chat message", (msg, room) => {
      socket.to(room).emit("chat message", msg);
    });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
