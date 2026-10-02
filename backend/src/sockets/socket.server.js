const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const aiService = require("../service/ai.service");

const { createMemory,queryMemory } = require("../service/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  // Authentication
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(
        socket.handshake.headers?.cookie || ""
      );

      if (!cookies.token)
        return next(new Error("Authentication error: No token provided"));

      const decoded = jwt.verify(
        cookies.token,
        process.env.JWT_SECRET
      );

      const user = await userModel.findById(decoded.id);

      if (!user)
        return next(new Error("Authentication error: User not found"));

      socket.user = user;
      next();

    } catch (error) {
      console.error("Socket Authentication Error:", error);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Connection
  io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);

    socket.on("ai-message", async (messagePayLoad) => {
      try {
        // Save user message
        const userMessage = await messageModel.create({
          chat: messagePayLoad.chat,
          user: socket.user._id,
          content: messagePayLoad.content,
          role: "user"
        });

        // User vector
        const vector = await aiService.generateVector(
          messagePayLoad.content
        );

       const memory = await queryMemory({
  queryVector: vector,
  limit: 3,
  metadata: {}
});

        await createMemory({
          vector,
          messageId: userMessage._id,
          metadata: {
            chat: messagePayLoad.chat,
            user: socket.user._id,
            content: messagePayLoad.content,
            role: "user"
          }
        });

         
        console.log("Memory retrieved from Pinecone:", memory);

        // Chat history
        const chatHistory = (
          await messageModel
            .find({ chat: messagePayLoad.chat })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
        ).reverse();

        const formattedHistory = chatHistory.map((item) => ({
          type: item.role === "user"
            ? "user_input"
            : "model_output",
          content: [
            {
              type: "text",
              text: item.content
            }
          ]
        }));

        // AI response
        const response = await aiService.generateResponse(
          formattedHistory
        );

        // Save AI message
        const aiMessage = await messageModel.create({
          chat: messagePayLoad.chat,
          user: socket.user._id,
          content: response,
          role: "model"
        });

        // AI vector
        const aiVector = await aiService.generateVector(response);

       

        await createMemory({
          vector: aiVector,
          messageId: aiMessage._id,
          metadata: {
            chat: messagePayLoad.chat,
            user: socket.user._id,
            content: response,
            role: "model"
          }
        });

        // Send response
        socket.emit("ai-response", {
          content: response,
          chat: messagePayLoad.chat
        }); 

      } catch (error) {
        console.error("AI Message Error:", error);

        socket.emit("ai-response", {
          content: "Sorry, AI service is temporarily unavailable.",
          chat: messagePayLoad.chat
        });
      }
    });
  });
}

module.exports = initSocketServer;

