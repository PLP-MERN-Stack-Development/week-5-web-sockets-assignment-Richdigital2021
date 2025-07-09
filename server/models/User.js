const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    socketId: {
      type: String,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
// This code defines a Mongoose schema for a user in a chat application.
// The `User` schema includes a `username` field (required and unique), a `socketId` field (optional), an `isOnline` field (defaulting to false), and a `lastSeen` field (defaulting to the current date).
// The schema also includes timestamps for creation and updates, which are automatically managed by Mongoose.
