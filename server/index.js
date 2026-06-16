const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Set Body Limit to 10mb to support base64 image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Enable CORS
app.use(cors({
  origin: "*", // Allow all origins for Vercel deploy
  credentials: true
}));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vitconnect";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB Database connected successfully"))
  .catch((err) => console.error("Database connection failed:", err.message));

// Root Message
app.get("/", (req, res) => {
  res.send("VITConnect API Server is online and running!");
});

// Basic Status Route
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Mount Routers
app.use("/api/auth", require("./routes/auth"));
app.use("/api/listings", require("./routes/listings"));
app.use("/api/requests", require("./routes/requests"));
app.use("/api/lostfound", require("./routes/lostfound"));
app.use("/api/messages", require("./routes/messages"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Express API Server running on port ${PORT}`);
});
