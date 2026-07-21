// controllers/messageController.js
const Message = require("../models/Message");
const mongoose = require("mongoose");

// ✅ Get all messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          senderId: new mongoose.Types.ObjectId(req.user.id),
          receiverId: new mongoose.Types.ObjectId(userId)
        },
        {
          senderId: new mongoose.Types.ObjectId(userId),
          receiverId: new mongoose.Types.ObjectId(req.user.id)
        }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// ✅ Create / send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    // validation
    if (!receiverId || !message) {
      return res.status(400).json({ message: "Receiver ID and message are required" });
    }

    const newMessage = new Message({
      senderId: req.user.id,
      receiverId: new mongoose.Types.ObjectId(receiverId),
      message
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error sending message" });
  }
};