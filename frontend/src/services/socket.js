import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem("chat_token");

  if (!socket) {
    socket = io("/", {
      withCredentials: true,
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
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
  } else if (!socket.connected) {
    socket.connect();
  }
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
