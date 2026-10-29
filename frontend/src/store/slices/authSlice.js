import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { disconnectSocket } from "../../services/socket";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ fullName, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", {
        fullName,
        email,
        password,
      });
      return response.data; // { user, token }
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Try again.";
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data; // { user, token }
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid credentials.";
      return rejectWithValue(message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      return response.data.user;
    } catch (error) {
      return rejectWithValue(null);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // ignore
    } finally {
      disconnectSocket();
      localStorage.removeItem("chat_user");
      localStorage.removeItem("chat_token");
    }
    return null;
  }
);

const savedUser = localStorage.getItem("chat_user");

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedUser,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem("chat_user", JSON.stringify(action.payload.user));
      if (action.payload.token) {
        localStorage.setItem("chat_token", action.payload.token);
      }
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem("chat_user", JSON.stringify(action.payload.user));
      if (action.payload.token) {
        localStorage.setItem("chat_token", action.payload.token);
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Check Auth
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem("chat_user", JSON.stringify(action.payload));
      }
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("chat_user");
      localStorage.removeItem("chat_token");
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
