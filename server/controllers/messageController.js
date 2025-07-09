const Message = require("../models/Message");

exports.getRoomMessages = async (req, res) => {
  const messages = await Message.find({ room: req.params.roomId })
    .populate("sender", "username")
    .populate("room", "name")
    .sort({ createdAt: 1 });
  res.json(messages);
};
exports.createMessage = async (req, res) => {
  const { content } = req.body;
  const { roomId } = req.params;

  try {
    const message = await Message.create({
      content,
      sender: req.user._id,
      room: roomId,
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
