const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

async function createChat(req, res) {
  try {
    const { tittle } = req.body;
    const user = req.user;
    const chat = await chatModel.create({
      user: user._id,
      tittle: tittle || "New Chat",
    });

    res.status(201).json({
      Message: "Chat Created Successfully",
      chat: {
        _id: chat._id,
        tittle: chat.tittle,
        lastActivity: chat.lastActivity,
        user: chat.user,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create chat" });
  }
}

async function getChats(req, res) {
  try {
    const user = req.user;
    const chats = await chatModel
      .find({ user: user._id })
      .sort({ updatedAt: -1, createdAt: -1 });
    res.status(200).json({ chats });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chats" });
  }
}

async function getMessages(req, res) {
  try {
    const { chatId } = req.params;
    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
}

module.exports = {
  createChat,
  getChats,
  getMessages,
};
