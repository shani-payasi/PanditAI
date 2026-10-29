import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchChats = createAsyncThunk(
  "chat/fetchChats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/chat");
      return response.data.chats || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load chats"
      );
    }
  }
);

export const createChat = createAsyncThunk(
  "chat/createChat",
  async (title, { rejectWithValue }) => {
    try {
      const response = await api.post("/chat", {
        tittle: title || "New Conversation",
      });
      return response.data.chat;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create new chat"
      );
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/${chatId}/messages`);
      return response.data.messages || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load messages"
      );
    }
  }
);

const initialState = {
  chats: [],
  currentChat: null,
  messages: [],
  isAiResponding: false,
  loadingChats: false,
  loadingMessages: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setAiResponding: (state, action) => {
      state.isAiResponding = action.payload;
    },
    clearChatState: (state) => {
      state.chats = [];
      state.currentChat = null;
      state.messages = [];
      state.isAiResponding = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Chats
    builder.addCase(fetchChats.pending, (state) => {
      state.loadingChats = true;
      state.error = null;
    });
    builder.addCase(fetchChats.fulfilled, (state, action) => {
      state.loadingChats = false;
      state.chats = action.payload;
      if (!state.currentChat && action.payload.length > 0) {
        state.currentChat = action.payload[0];
      }
    });
    builder.addCase(fetchChats.rejected, (state, action) => {
      state.loadingChats = false;
      state.error = action.payload;
    });

    // Create Chat
    builder.addCase(createChat.fulfilled, (state, action) => {
      state.chats.unshift(action.payload);
      state.currentChat = action.payload;
      state.messages = [];
    });

    // Fetch Messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.loadingMessages = true;
      state.messages = [];
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.loadingMessages = false;
      state.messages = action.payload;
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.loadingMessages = false;
      state.error = action.payload;
    });
  },
});

export const {
  setCurrentChat,
  addMessage,
  setAiResponding,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer;

