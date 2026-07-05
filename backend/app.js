const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const visitorRoutes = require("./routes/visitors");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Visitor CRM API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/visitors", visitorRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

module.exports = app;