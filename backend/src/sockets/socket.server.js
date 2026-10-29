const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const aiService = require("../service/ai.service");
const { createMemory, queryMemory } = require("../service/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
      credentials: true,
    },
  });

  // ==========================================
  // 1. Socket Authentication Middleware
  // Supports Cookies, auth payload, or Bearer header
  // ==========================================
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      const token =
        cookies.token ||
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket Auth Error:", error.message);
      next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  // ==========================================
  // 2. Real-Time Socket Connection
  // ==========================================
  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.user.email} (${socket.id})`);

    socket.on("ai-message", async (payload) => {
      const { chat, content } = payload || {};

      if (!chat || !content || !content.trim()) {
        return socket.emit("ai-response", {
          content: "Please provide a valid message and chat ID.",
          chat,
        });
      }

      try {
        console.time(`[AI Turn] ${chat}`);

        // A. Parallel: Save user message + Fetch chat history + Embed query
        const [userMessage, rawHistory, vector] = await Promise.all([
          messageModel.create({
            chat,
            user: socket.user._id,
            content: content.trim(),
            role: "user",
          }),
          messageModel
            .find({ chat })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean(),
          aiService.generateVector(content.trim()).catch((err) => {
            console.warn("Vector embedding warning:", err.message);
            return null;
          }),
        ]);

        // B. Semantic Long-Term Memory (Pinecone) with Timeout Safeguard
        let memoryText = "";
        if (vector) {
          // Non-blocking background upsert for user vector
          createMemory({
            vector,
            messageId: userMessage._id,
            metadata: {
              chat,
              user: socket.user._id.toString(),
              content: content.trim(),
              role: "user",
            },
          }).catch((err) =>
            console.error("User memory store error:", err.message)
          );

          // Query past memories with 2-second timeout
          try {
            const memoryQuery = queryMemory({ queryVector: vector, limit: 3 });
            const timeout = new Promise((resolve) =>
              setTimeout(() => resolve([]), 2000)
            );
            const memories = await Promise.race([memoryQuery, timeout]);

            if (Array.isArray(memories) && memories.length > 0) {
              memoryText = memories
                .map((m) => m.metadata?.content)
                .filter(Boolean)
                .join("\n");
            }
          } catch (err) {
            console.warn("Pinecone query skipped:", err.message);
          }
        }

        // C. Context Assembly: Long-Term Memory + Short-Term History + Current Prompt
        const history = rawHistory.reverse();
        const stm = history.map((item) => ({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.content }],
        }));

        const ltm = memoryText
          ? [
              {
                role: "user",
                parts: [
                  {
                    text: `Relevant memories from previous conversations:\n${memoryText}\nUse these memories only when they are relevant.`,
                  },
                ],
              },
              {
                role: "model",
                parts: [{ text: "Understood, I will keep those memories in mind." }],
              },
            ]
          : [];

        const currentTurn = {
          role: "user",
          parts: [{ text: content.trim() }],
        };

        const aiInput = [...ltm, ...stm, currentTurn];

        // D. Generate AI Response
        const response = await aiService.generateResponse(aiInput);

        // E. Send response to client IMMEDIATELY
        socket.emit("ai-response", {
          content: response,
          chat,
        });

        console.timeEnd(`[AI Turn] ${chat}`);

        // F. Background Save AI Message and Vector to MongoDB & Pinecone (Non-blocking)
        (async () => {
          try {
            const aiMessage = await messageModel.create({
              chat,
              user: socket.user._id,
              content: response,
              role: "model",
            });

            const aiVector = await aiService.generateVector(response);
            await createMemory({
              vector: aiVector,
              messageId: aiMessage._id,
              metadata: {
                chat,
                user: socket.user._id.toString(),
                content: response,
                role: "model",
              },
            });
          } catch (bgError) {
            console.error("AI memory persistence error:", bgError.message);
          }
        })();

      } catch (error) {
        console.error("AI Message Error:", error.message || error);
        socket.emit("ai-response", {
          content: "Sorry, I encountered an issue generating a response. Please try again.",
          chat,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
}

module.exports = initSocketServer;

