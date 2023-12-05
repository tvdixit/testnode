"use strict";

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { auth } = require("../Middlewares/auth");
const {
  Login,
  VerifyOtp,
  CreateUser,
  GetUser,
  GetAllUsers,
  UpdateUser
} = require("../Controllers/userController");

const upload = multer({ storage: multer.memoryStorage() });

router
  .post("/login", Login)
  .post("/verify-otp", VerifyOtp)
  .post("/create-user",  upload.fields([{ name: "profile_photo", maxCount: 1 }]),CreateUser)
  .get("/retrive-user",auth(), GetUser)
  .get("/retrive-all-user", GetAllUsers)
  .patch("/update-user", UpdateUser);

module.exports = {
  route: router,
};
