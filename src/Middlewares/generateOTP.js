"use strict";

// Twilio configuration.
const AccountSid = process.env.TWILIO_SID;
const AuthToken = process.env.TWILIO_AUTH_TOKEN;
const Client = require("twilio")(AccountSid, AuthToken);

// Send OTP For Verification.
const sendOtpViaSMS = async (phoneNo, otp) => {
  try {
    const message = await Client.messages
      .create({
        body: req.body.otp,
        from: "+16185981625",
        to: req.body.phone_no, // "+919664518167",
      })
      .then((message) => console.log(message.sid))
      .done();
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
};

// Usage
const phoneNo = "USER_PHONE_NUMBER";
const otp = otpGenerator.generate(6, { digits: true });
sendOtpViaSMS(phoneNo, otp);
