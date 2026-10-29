import { io } from "socket.io-client";

// Connect socket to backend URL (not Vercel frontend)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

let socket = null;

export const connectSocket = () => {
  if (socket && socket.connected) return socket;

  const token = localStorage.getItem("chat_token");

  socket = io(BACKEND_URL, {
    withCredentials: true,
    auth: { token },
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendAiMessage = ({ chat, content }) => {
  const activeSocket = connectSocket();
  if (activeSocket.connected) {
    activeSocket.emit("ai-message", { chat, content });
  } else {
    activeSocket.once("connect", () => {
      activeSocket.emit("ai-message", { chat, content });
    });
  }
};
