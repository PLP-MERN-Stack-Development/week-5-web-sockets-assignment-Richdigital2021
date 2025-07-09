const express = require("express");
const router = express.Router();
const {
  getRoomMessages,
  createMessage,
} = require("../controllers/messageController.js");

router.get("/messages/:roomId", getRoomMessages);
router.post("/messages/:roomId", createMessage);

module.exports = router;
// This code defines the routes for handling messages in a chat application.
// It uses Express.js to create a router that handles fetching messages for a specific room and creating new messages in that room.
// The `getRoomMessages` function retrieves messages for a specific room, while the `createMessage` function allows users to send new messages to that room.
// The routes are defined under the `/messages` path, with the room ID as a parameter.
