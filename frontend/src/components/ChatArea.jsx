import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  setAiResponding,
  createChat,
} from "../store/slices/chatSlice";
import { sendAiMessage } from "../services/socket";
import MessageItem from "./MessageItem";
import {
  ArrowUp,
  Bot,
  PanelLeft,
  Sparkles,
  Loader2,
  Brain,
  Database,
  Cpu,
} from "lucide-react";

export default function ChatArea({ sidebarOpen, setSidebarOpen }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentChat, messages, isAiResponding, loadingMessages } = useSelector(
    (state) => state.chat
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiResponding]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isAiResponding) return;

    let chatId = currentChat?._id;

    // If no active chat, create one first
    if (!chatId) {
      const title = textToSend.slice(0, 30) || "New Conversation";
      const actionResult = await dispatch(createChat(title));
      if (createChat.fulfilled.match(actionResult)) {
        chatId = actionResult.payload._id;
      } else {
        return;
      }
    }

    // 1. Dispatch user message to Redux store
    const userMsg = {
      role: "user",
      content: textToSend.trim(),
      createdAt: new Date().toISOString(),
      chat: chatId,
    };
    dispatch(addMessage(userMsg));
    dispatch(setAiResponding(true));
    setInput("");

    // 2. Emit socket event to backend
    sendAiMessage({
      chat: chatId,
      content: textToSend.trim(),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestionPrompts = [
    {
      title: "Explain Dual-Memory RAG",
      desc: "How does short-term vs long-term memory work?",
    },
    {
      title: "Cosine Similarity in Pinecone",
      desc: "How are 768-dimension vectors compared?",
    },
    {
      title: "WebSocket vs REST API",
      desc: "Why use Socket.IO for conversational AI?",
    },
  ];

  return (
    <div className="flex h-full flex-1 flex-col bg-[var(--bg-primary)]">
      {/* Top Bar */}
      <header className="flex h-12 items-center justify-between border-b border-[var(--border-color)] px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            title="Toggle sidebar"
          >
            <PanelLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--text-primary)]">
              {currentChat?.tittle || "New Chat"}
            </span>
            <span className="flex items-center gap-1 rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
              <Sparkles size={11} className="text-[var(--accent-primary)]" />
              Gemini 3.8 Flash + Pinecone RAG
            </span>
          </div>
        </div>
      </header>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto">
        {loadingMessages ? (
          <div className="flex h-full items-center justify-center text-xs text-[var(--text-secondary)]">
            <Loader2 size={18} className="mr-2 animate-spin text-[var(--accent-primary)]" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-primary)] text-white shadow-lg">
              <Bot size={30} />
            </div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              How can I help you today?
            </h1>
            <p className="mt-1 max-w-md text-xs text-[var(--text-secondary)]">
              Backed by Gemini 3.8 Flash, Gemini Embeddings, and Pinecone Long-Term Memory.
            </p>

            {/* Architectural Highlights */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-[11px] text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 px-3 py-1">
                <Brain size={12} className="text-[var(--accent-primary)]" />
                <span>Short-Term Memory (Mongo)</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 px-3 py-1">
                <Database size={12} className="text-[var(--accent-primary)]" />
                <span>Long-Term Memory (Pinecone)</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 px-3 py-1">
                <Cpu size={12} className="text-[var(--accent-primary)]" />
                <span>768-Dim Vector Space</span>
              </div>
            </div>

            {/* Starter Suggestion Pills */}
            <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-3">
              {suggestionPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.title)}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/40 p-3 text-left transition-colors hover:bg-[var(--bg-secondary)]"
                >
                  <div className="text-xs font-medium text-[var(--text-primary)]">
                    {item.title}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-transparent pb-4">
            {messages.map((msg, index) => (
              <MessageItem key={msg._id || index} message={msg} user={user} />
            ))}

            {/* AI Thinking Indicator */}
            {isAiResponding && (
              <div className="bg-[var(--bg-secondary)]/30 border-y border-[var(--border-color)]/30 py-4 px-4 md:px-8">
                <div className="mx-auto flex max-w-3xl gap-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-white shadow-sm">
                    <Bot size={16} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Loader2 size={14} className="animate-spin text-[var(--accent-primary)]" />
                    <span>Searching memory & synthesizing response...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Message Input Bar */}
      <footer className="border-t border-[var(--border-color)]/50 bg-[var(--bg-primary)] p-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative flex items-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm focus-within:border-[var(--text-secondary)]">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything (e.g. vector databases, project architecture)..."
              className="max-h-36 min-h-[48px] w-full resize-none bg-transparent py-3 pl-4 pr-12 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isAiResponding}
              className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-20"
              title="Send message"
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          </div>
          <div className="mt-2 text-center text-[10px] text-[var(--text-secondary)]/70">
            Conversational RAG Agent • Google Gemini 3.8 Flash • Pinecone Vector DB
          </div>
        </div>
      </footer>
    </div>
  );
}

