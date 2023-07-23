require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const CryptoJS = require("crypto-js");

const app = express();
const server = http.createServer(app);
const newUser = {};
const io = new Server(server, {
  cors: {
    origin: "https://chatty-henna-nine.vercel.app",
    credentials: true,
  },
  allowEIO3: true,
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cors())
app.use(
  cors({
    origin: ["https://chatty-henna-nine.vercel.app"],
    methods: ["POST", "GET", "PATCH", "DELETE", "OPTIONS", "PUT"],
    credentials: true,
  })
);

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
      _id: String,
      option: String,
    },
  ],
});

const Room = mongoose.model("Room", chattySchema);

app.route("/").get((req,res) => {
  res.send("server is working")
})

app.route("/rooms").post(async (req, res) => {
  const room = new Room(req.body);
  await room.save();
  res.send("request was succesful with ststus code 200");
});

app
  .route("/rooms/:roomID")
  .get(async (req, res) => {
    const users = await Room.findById(req.params.roomID);

    if (users) {
      const user = {
        user: users.user,
        room: users.room,
      };
      res.send(user);
    } else {
      res.send(users);
    }
  })
  .patch(async (req, res) => {
    newUser.name = req.body.name;
    newUser.admin = req.body.admin;

    await Room.updateOne(
      { _id: req.params.roomID },
      { $push: { user: req.body } }
    );
    res.send("request was succesful with status code 200");
  })
  .delete(async (req, res) => {
    const room = await Room.findById(req.params.roomID);

    if (room) {
      console.log(room.user);
      if (room.user.length === 0) {
        await Room.deleteOne({ _id: req.params.roomID });
      }
    }
  });

app
  .route("/rooms/conversation/:roomID")
  .get(async (req, res) => {
    const message = await Room.findById(req.params.roomID, "conversation");
    const conversation = message?.conversation?.map((msg) => {
      return {
        name: msg.name,
        message: CryptoJS.AES.decrypt(
          msg.message,
          process.env.ENCRYPTION_KEY
        ).toString(CryptoJS.enc.Utf8),
        _id: msg._id,
        option: msg.option,
      };
    });
    res.send(conversation);
  })
  .patch(async (req, res) => {
    await Room.updateOne(
      { _id: req.params.roomID },
      { $push: { conversation: req.body } }
    );
    res.send("request was succesful with status code 200");
  });

// const users = [];

io.on("connection", (socket) => {
  socket
    .on("new user", async (user, room) => {
      const roomID = user.roomID;
      const newUser = {
        name: user.name,
        admin: user.admin,
        _id: user.id,
        socketID: socket.id,
      };

      const users = await Room.findById(user.roomID, "user");

      if (users?.user.length === 0) {
        await Room.updateOne({ _id: roomID }, { $push: { user: newUser } });
        const allUser = await Room.findById(user.roomID, "user");

        const onlineUsers = allUser?.user.map((eve) => eve.name);
        io.sockets.in(room).emit("online user", onlineUsers);
      } else {
        const checkUser = users?.user.map((user) => user._id).includes(user.id);
        if (!checkUser) {
          await Room.updateOne({ _id: roomID }, { $push: { user: newUser } });
          const allUser = await Room.findById(user.roomID, "user");
          const onlineUsers = allUser?.user.map((eve) => eve.name);
          io.sockets.in(room).emit("online user", onlineUsers);
        } else {
          const updateSocketID = users?.user.map((user) => {
            if (user._id === newUser._id) {
              return newUser;
            } else {
              return user;
            }
          });

          await Room.updateOne(
            { _id: roomID },
            { $push: { user: updateSocketID } }
          );
        }
      }

      io.sockets.in(room).emit("users", user, users?.user);
      socket.to(room).emit("user connected", user.name);
      socket.on("disconnect", async () => {
        const users = await Room.findById(user.roomID, "user");
        const offlineUser = users?.user.filter(
          (eve) => eve.socketID === socket.id
        );
        console.log("users", users);
        console.log(socket.id);
        console.log("offlineUser", offlineUser);

        const connectedUsers = users?.user.filter(
          (eve) => eve.socketID !== socket.id
        );
        console.log("connectedUsers", connectedUsers);

        await Room.updateOne(
          { _id: roomID },
          { $set: { user: connectedUsers } }
        );

        socket.to(room).emit("offline", offlineUser, connectedUsers, user);
      });
    })

    .on("join-room", (room) => socket.join(room))
    .on("chat message", async (msg, room, callback) => {
      callback({
        status: "ok",
      });

      socket.to(room).emit("chat message", msg);

      const encryptedMessage = CryptoJS.AES.encrypt(
        msg.message,
        process.env.ENCRYPTION_KEY
      ).toString();

      const message = {
        name: msg.name,
        message: encryptedMessage,
        _id: msg._id,
        option: msg.option,
      };

      await Room.updateOne(
        { _id: room },
        {
          $push: {
            conversation: message,
          },
        }
      );
    });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
