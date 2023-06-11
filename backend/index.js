const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
mongoose.connect("mongodb://127.0.0.1:27017/chattyDB");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const userSchema = new mongoose.Schema({
  name: String,
  ID: String,
  linkID: String,
  roomID: String,
});

const User = mongoose.model("User", userSchema);

app.post("/users", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  console.log(req.body);
});

io.on("connection", (socket) => {
  console.log(`${socket.id} connected `);
  socket
    .on("join-room", (room) => socket.join(room))
    .on("chat message", (msg, room) => {
      socket.to(room).emit("chat message", msg)
    })

    .on("disconnect", () => {
      console.log("user disconnected");
    });
  
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
