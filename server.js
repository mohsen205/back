// server.js
const mongoose = require("mongoose");
const express = require("express");

require("dotenv").config();

const app = require("./api");

// Connection to MongoDB with recommended options
mongoose
  .connect(
    "mongodb+srv://testing:v6Gy0b7j08XnOAD7@cluster0.k07yzcs.mongodb.net/CROWDFUNDING",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
