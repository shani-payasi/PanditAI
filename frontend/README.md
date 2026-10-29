# ChatGPT Conversational RAG Frontend

A clean, minimalist frontend for the `chat-gpt-project` built with **React**, **Redux Toolkit + Thunk**, **Tailwind CSS**, and **Socket.IO Client**.

## Features

- **Redux State Management with Thunk**:
  - `authSlice`: Handles user authentication (`registerUser`, `loginUser`, `checkAuth`, `logoutUser`).
  - `chatSlice`: Manages chat sessions, historical messages, and real-time streaming state (`fetchChats`, `createChat`, `fetchMessages`, `addMessage`, `setAiResponding`).
- **Real-Time AI Communication**:
  - Socket.IO connection sending `ai-message` and receiving `ai-response`.
  - Live "Thinking..." typing indicator when Gemini and Pinecone are processing.
- **Dual-Memory Architecture UI**:
  - Displays short-term active chat history and enables context-aware conversations.
- **Design & Palette**:
  - Single, unified neutral dark ChatGPT palette using CSS variables (`--bg-primary`, `--bg-secondary`, `--border-color`, etc.).
  - No flashy neon glow; clean, distraction-free typography.

## How to Run

### 1. Start the Backend
```bash
cd Backend-learning/chat-gpt-project/backend
npm run dev
# Running on http://localhost:3000
```

### 2. Start the Frontend
```bash
cd Backend-learning/chat-gpt-project/frontend
npm run dev
# Running on http://localhost:5173
```
Vite automatically proxies `/api` and `/socket.io` to `http://localhost:3000`.

