require("dotenv").config();
const mongoose = require("mongoose");
const app = require("../app");

let isConnected = false;

async function ensureDbConnected() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

module.exports = async (req, res) => {
  try {
    await ensureDbConnected();
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    res.status(500).json({ error: "Database connection failed." });
    return;
  }
  return app(req, res);
};