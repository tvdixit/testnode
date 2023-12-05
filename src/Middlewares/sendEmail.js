"use strict";

const Nodemailer = require("nodemailer");

// For Sending Email.
const transporter = Nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "69e8658f43e3f2",
    pass: "a91378d3463dd6",
  },
});
const sendEmail = async (req, customEmailText) => {
  try {
    const mailOptions = {
      from: "test@yopmail.com",
      to: req.body.email,
      subject: "Your Inquiry Sent Successfully",
      text: customEmailText,
    };
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
