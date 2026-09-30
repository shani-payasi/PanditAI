const { Server } = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const aiService = require('../service/ai.service');
const messageModel = require('../models/message.model');

function initSocketServer(httpServer) {

  const io = new Server(httpServer, {});

  // Socket Authentication Middleware
  io.use(async (socket, next) => {

    const cookies = cookie.parse(
      socket.handshake.headers?.cookie || ""
    );

    if (!cookies.token) {
      return next(
        new Error("Authentication error: No token provided")
      );
    }

    try {

      const decoded = jwt.verify(
        cookies.token,
        process.env.JWT_SECRET
      );

      const user = await userModel.findById(decoded.id);

      if (!user) {
        return next(
          new Error("Authentication error: User not found")
        );
      }

      socket.user = user;

      next();

    } catch (err) {

      console.error("Socket Authentication Error:", err);

      return next(
        new Error("Authentication error: Invalid token")
      );
    }
  });


  // Socket Connection
  io.on("connection", (socket) => {

    console.log("New socket connection:", socket.id);


    socket.on("ai-message", async (messagePayLoad) => {

      try {

        console.log("Message Payload:", messagePayLoad);


        // 1. Save user message
        await messageModel.create({
          chat: messagePayLoad.chat,
          user: socket.user._id,
          content: messagePayLoad.content,
          role: "user"
        });


        // 2. Get chat history
        const chatHistory = await messageModel.find({
          chat: messagePayLoad.chat
        });


        // 3. Convert history for Gemini
        const formattedHistory = chatHistory.map((item) => {
          return {
            role: item.role,
            parts: [
              {
                text: item.content
              }
            ]
          };
        });


        console.log("Chat History:", formattedHistory);


        // 4. Generate AI response
        const response = await aiService.generateResponse(
          formattedHistory
        );


        // 5. Save AI response
        await messageModel.create({
          chat: messagePayLoad.chat,
          user: socket.user._id,
          content: response,
          role: "model"
        });


        // 6. Send response to frontend
        socket.emit("ai-response", {
          content: response,
          chat: messagePayLoad.chat
        });


      } catch (error) {

        console.error("AI Message Error:", error);

        // Don't crash server
        socket.emit("ai-response", {
          content: "Sorry, AI service is temporarily unavailable.",
          chat: messagePayLoad.chat
        });

      }

    });

  });
}

module.exports = initSocketServer;