"use strict";

const Joi = require("joi");
// SignIn User Validation.
const signInValidation = {
  body: Joi.object().keys({
    country_code: Joi.string().required(),
    phone_no: Joi.string().required().label("Phone number"),
  }),
};

// Verify Otp Validation.
const verifyOtpValidation = {
  body: Joi.object().keys({
    country_code: Joi.string().required(),
    phone_no: Joi.string().required().label("Phone number"),
    otp: Joi.string().required().label("OTP"),
  }),
};

// Create User Validation.
const createUserValidation = {
  body: Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().required(),
    address: Joi.string().required(),
    country_code: Joi.string().required(),
    phone_no: Joi.string().required(),
    gender: Joi.string().valid("Male", "Female", "Other"),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }),
};

// UserProfile Validation.
const updateUserValidation = Joi.object().keys({
  files: Joi.object().keys({
    profile_photo: Joi.string(),
  }),
  body: Joi.object().keys({
    first_name: Joi.string(),
    last_name: Joi.string(),
    email: Joi.string(),
    birth_date: Joi.date(),
    gender: Joi.string().valid("Male", "Female", "Other"),
    address: Joi.string(),
  }),
});

// User location validation.
const userLocationValidation = {
  body: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    location_address: Joi.string().required(),
  }),
};

// Update User location validation.
const updateUserLocationValidation = {
  query: Joi.object({
    location_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    location_address: Joi.string().required(),
  }),
};

// DeleteUser Location Validation.
const deleteUserLocationValidation = {
  query: Joi.object().keys({
    location_id: Joi.string().required(),
  }),
};

module.exports = {
  createUserValidation,
  verifyOtpValidation,
  signInValidation,
  updateUserValidation,
  userLocationValidation,
  updateUserLocationValidation,
  deleteUserLocationValidation,
};
