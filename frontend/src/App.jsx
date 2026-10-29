import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/slices/authSlice";
import {
  fetchChats,
  addMessage,
  setAiResponding,
} from "./store/slices/chatSlice";
import { connectSocket, getSocket } from "./services/socket";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import AuthModal from "./components/AuthModal";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Check auth session on startup
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Connect socket and fetch chats upon authentication
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchChats());

      const socket = connectSocket();

      const handleAiResponse = (data) => {
        dispatch(
          addMessage({
            role: "model",
            content: data.content,
            chat: data.chat,
            createdAt: new Date().toISOString(),
          })
        );
        dispatch(setAiResponding(false));
      };

      socket.on("ai-response", handleAiResponse);

      return () => {
        socket.off("ai-response", handleAiResponse);
      };
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* If not authenticated, display login/signup modal */}
      {!isAuthenticated && <AuthModal />}

      {/* Main ChatGPT workspace layout */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <ChatArea sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </div>
  );
}

