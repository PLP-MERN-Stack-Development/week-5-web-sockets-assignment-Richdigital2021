// server.js - Main server file for Socket.io chat application

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/User");
const Room = require("./models/Room");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/chat-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", () => console.log("✅ Connected to MongoDB"));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory state
const users = {};
const messages = [];
const typingUsers = {};
let rooms = [];

// Socket.io Events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("user_join", (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit("user_list", Object.values(users));
    io.emit("user_joined", { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  socket.on("send_message", (messageData) => {
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || "Anonymous",
      senderId: socket.id,
      timestamp: new Date().toISOString(),
    };

    messages.push(message);
    if (messages.length > 100) messages.shift();

    io.emit("receive_message", message);
  });

  socket.on("typing", (isTyping) => {
    const username = users[socket.id]?.username;
    if (isTyping) typingUsers[socket.id] = username;
    else delete typingUsers[socket.id];

    io.emit("typing_users", Object.values(typingUsers));
  });

  socket.on("private_message", ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || "Anonymous",
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };

    socket.to(to).emit("private_message", messageData);
    socket.emit("private_message", messageData);
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      io.emit("user_left", { username: user.username, id: socket.id });
      console.log(`${user.username} left the chat`);
    }
    delete users[socket.id];
    delete typingUsers[socket.id];
    io.emit("user_list", Object.values(users));
    io.emit("typing_users", Object.values(typingUsers));
  });

  socket.on("send_message", (messageData) => {
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || "Anonymous",
      senderId: socket.id,
      timestamp: new Date().toISOString(),
    };

    messages.push(message);

    io.emit("receive_message", message);
    io.emit("notify_message", {
      sender: message.sender,
      content: message.content || message.message,
      timestamp: message.timestamp,
    });
  });
});

// API Routes
app.get("/api/messages", (req, res) => res.json(messages));
app.get("/api/users", (req, res) => res.json(Object.values(users)));
app.get("/api/rooms", (req, res) => {
  res.json(rooms);
});

// ✅ Register Route
app.post("/api/register", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(200)
        .json({ message: "User already exists", user: existingUser });
    }

    const user = new User({ username });
    await user.save();
    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new room
app.post("/api/rooms", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ message: "Room name is required" });

    const newRoom = new Room({ name });
    const savedRoom = await newRoom.save(); // ✅ Save to MongoDB
    res.status(201).json(savedRoom); // ✅ Respond with saved room
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// ✅ Login Route
app.post("/api/login", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Socket.io Chat Server is running");
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, server, io };
