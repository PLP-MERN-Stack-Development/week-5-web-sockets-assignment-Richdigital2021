const Message = require("../models/Message");
const User = require("../models/User");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle joining a room
    socket.on("joinRoom", async ({ roomId, username }) => {
      const user = await User.findOneAndUpdate(
        { username },
        { socketId: socket.id, isOnline: true, lastSeen: Date.now() },
        { new: true }
      );

      socket.join(roomId);
      io.to(roomId).emit("userJoined", { user, roomId });

      //Typing indicator
      socket.on("typing", () => {
        socket.to(roomId).emit("typing", username);
      });

      socket.on("stopTyping", () => {
        socket.to(roomId).emit("stopTyping", username);
      });

      // Update user's last seen time when they leave the room
      socket.on("disconnect", async () => {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          { isOnline: false, lastSeen: Date.now() }
        );
      });

      // send Message
      socket.on("sendMessage", async (data) => {
        const message = await Message.create({
          content: data,
          sender: user._id,
          room: roomId,
        });
        const fullMessage = await message.populate("sender", "username");
        io.to(roomId).emit("newMessage", fullMessage);
      });

      // Fetch and send existing messages in the room
      const messages = await Message.find({ room: roomId })
        .populate("sender", "username")
        .sort({ createdAt: 1 });
      socket.emit("roomMessages", messages);
    });
    // Handle disconnect
    socket.on("disconnect", async () => {
      const offlineUser = await User.findOneAndUpdate(
        { socketId: socket.id },
        { isOnline: false, lastSeen: Date.now() }
      );
      io.emit("userOffline", offlineUser.username);
    });
  });
};
