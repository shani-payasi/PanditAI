const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors")
/*Routes*/
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

/*CORS Support for frontend with credentials*/
app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

/*Using Middlewares*/
app.use(express.json());
app.use(cookieParser());
app.use(cors("*"))

/*using Routes*/
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
