const express = require("express");
const cookieParser = require("cookie-parser");


/*Routes*/

const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");


const app = express();

/*Using Middlewares*/
app.use(express.json());
app.use(cookieParser());

/*using ROutes*/
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;