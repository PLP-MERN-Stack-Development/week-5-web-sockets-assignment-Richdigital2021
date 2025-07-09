// server.js - Main server file for Socket.io chat application

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config();

// Import models
const User = require("./models/User");
const Room = require("./models/Room");
const Message = require("./models/Message");

// Initialize app and server
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

// In-memory stores
const users = {}; // Track connected users
const typingUsers = {}; // Track who is typing

// Socket.io Logic
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // User join (optional custom event)
  socket.on("user_join", (username) => {
    users[socket.id] = { username, id: socket.id };
    console.log(`${username} joined. Socket ID: ${socket.id}`);
  });

  // Join room
  socket.on("joinRoom", ({ username, roomId }) => {
    socket.join(roomId);
    users[socket.id] = { username, roomId };
    console.log(`${username} joined room ${roomId}`);
  });

  // Typing indicator
  socket.on("typing", ({ roomId, username }) => {
    typingUsers[socket.id] = username;
    io.to(roomId).emit("typing_users", Object.values(typingUsers));
  });

  socket.on("stopTyping", ({ roomId }) => {
    delete typingUsers[socket.id];
    io.to(roomId).emit("typing_users", Object.values(typingUsers));
  });

  // Send message
  socket.on("send_message", async (messageData) => {
    try {
      const { content, roomId } = messageData;
      const sender = users[socket.id]?.username || "Anonymous";

      // Save to MongoDB
      const newMessage = new Message({
        content,
        sender,
        roomId,
        timestamp: new Date(),
      });

      const savedMessage = await newMessage.save();

      io.to(roomId).emit("receive_message", savedMessage);

      // Notify others
      socket.broadcast.to(roomId).emit("notify_message", {
        sender,
        content,
      });
    } catch (error) {
      console.error("❌ Error saving message:", error);
    }
  });

  // Private message
  socket.on("private_message", ({ toSocketId, message, from }) => {
    const messageData = {
      sender: from,
      content: message,
      isPrivate: true,
      timestamp: new Date().toISOString(),
    };
    socket.to(toSocketId).emit("private_message", messageData);
    socket.emit("private_message", messageData); // Echo back to sender
  });

  // Disconnect
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      console.log(`❌ ${user.username} disconnected`);
    }
    delete users[socket.id];
    delete typingUsers[socket.id];
  });
});

// REST API Routes

// ✅ Register user
app.post("/api/register", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username });
      await user.save();
    }
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Login user
app.post("/api/login", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get rooms
app.get("/api/rooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch rooms" });
  }
});

// ✅ Create room
app.post("/api/rooms", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Room name required" });

    const newRoom = new Room({ name });
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Get messages for a room
app.get("/api/messages/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({
      timestamp: 1,
    });
    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err.message);
    res.status(500).json({ error: "Could not fetch messages" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("💬 Socket.io Chat Server is running");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Export for testing or other uses
module.exports = { app, server, io };
