"use strict";

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// Database connection.
const dbConnect = async () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((res) => {
      console.log("Database Connected successfully!");
    });
};
module.exports = dbConnect;