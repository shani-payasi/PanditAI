const mongoose = require("mongoose");

async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB");
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}

module.exports = connectDb;