const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
app.use(cors);
app.use(express.json());

console.log("uri", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.once("open", () => {
  console.log("✅ Connected to MongoDB");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Basic Socket.IO setup
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("join-document", (docId) => {
    socket.join(docId);
    console.log(`Client ${socket.id} joined document ${docId}`);

    socket.on("send-changes", (delta) => {
      socket.to(docId).emit("receive-changes", delta);
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
