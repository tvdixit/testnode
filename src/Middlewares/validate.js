"use strict";

const Joi = require("joi");
const Pick = require("../utils/pick");
const { sendBadRequestResponse } = require("../Services/commonFunctions");
// Validate API For Validation.
const validate = (schema) => (req, res, next) => {
  const validSchema = Pick(schema, ["params", "query", "body", "form-data"]);
  const object = Pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);
  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(", ");
    return sendBadRequestResponse(res, errorMessage);
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
