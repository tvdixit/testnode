"use strict";

// Importing required modules and dependencies.
const Jwt = require("jsonwebtoken");
const ProfileImage = require("../utils/upload");
const PhoneNumber = require("libphonenumber-js");
const { MongoClient } = require("mongodb");
const Twilio = require("twilio");
const {
  InternalErrorResponse,
} = require("../Services/commonFunctions");
// Twilio client initialization using API credentials from environment variables.
const Client = Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const dbName = "Foody";
//Login using otp.
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

const Login = async (req, res) => {
  const { country_code, phoneNumber } = req.body;
  try {
    // Connect to the database
    const db = await connectToDatabase();
    const collection = db.collection("users");
    const otpCollection = db.collection("otp");

    // Check if the user with the provided phone number exists
    const user = await collection.findOne({
      country_code: country_code,
      phone: phoneNumber,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Check if there is an existing OTP for the user
    const existingOtp = await otpCollection.findOne({
      country_code: country_code,
      phone: phoneNumber,
    });
    let otp;

    if (existingOtp) {
      otp = generateOTP();
      isNewOtp = true;

      // Update the existing OTP document with the new OTP and timestamp
      await otpCollection.updateOne(
        { country_code: country_code, phone: phoneNumber },
        { $set: { otp } },
        { upsert: true }
      );
    } else {
      // No existing OTP, generate a new one
      otp = generateOTP();

      // Store the new OTP in the MongoDB collection
      await otpCollection.insertOne({
        country_code: country_code,
        phone: phoneNumber,
        otp: otp,
        timestamp: Date.now(),
      });
    }

    // Send the OTP via Twilio SMS
    // await Client.messages.create({
    //   body: `Your OTP for sign-in: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER || "+18562820610",
    //   to: phoneNumber,
    // });

    res.json({
      message: `OTP sent successfully`,
      success: true,
      data: { country_code, phoneNumber, otp, name: user.username },
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

//verify otp api.
const VerifyOtp = async (req, res) => {
  const { country_code, phoneNumber, otp } = req.body;
  try {
    // Connect to the database
    const db = await connectToDatabase();
    const collection = db.collection("users");
    const otpCollection = db.collection("otp");

    // Check if the user with the provided phone number exists
    const user = await collection.findOne({
      country_code: country_code,
      phone: phoneNumber,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if there is an existing OTP for the user
    const existingOtp = await otpCollection.findOne({
      country_code: country_code,
      phone: phoneNumber,
    });

    if (!existingOtp) {
      return res
        .status(400)
        .json({ error: "OTP not found. Please generate a new OTP." });
    }

    // Validate the entered OTP
    if (otp == existingOtp.otp) {
      const token = Jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
        expiresIn: process.env.TOKEN_EXPIRATION,
      });

      // Optionally, you may want to delete the OTP record after successful verification
      await otpCollection.deleteOne({ phone: phoneNumber });

      res.json({
        message: "OTP verified successfully",
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            country_code: user.country_code,
            phone: user.phone,
          },
          token,
        },
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database Connected successfully!");
    return client.db(dbName);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

const CreateUser = async (req, res) => {
  if (!req.body.phone || !req.body.country_code) {
    return InternalErrorResponse(
      res,
      "Both country code and phone number are required"
    );
  }
  if (!req.body.country_code.startsWith("+")) {
    return InternalErrorResponse(
      res,
      "Country code must start with a '+' sign"
    );
  }
  const { username, email, country_code, phone, address, age } = req.body;
  let folder_name;
  try {
    if (req.files.profile_photo && req.files.profile_photo.length === 1) {
      // Update profile photo if provided
      const profilePhotoResult = await ProfileImage.profileImage(
        req.files.profile_photo[0],
        "profile_photo"
      );
      folder_name = profilePhotoResult.folder_name;
    }
    // Set a default profile photo if not provided
    const defaultProfilePhoto =
      "profile_photo/8009ad51-1ef9-47c1-a071-cd348aeaeb3f.jpg";

    // Create a new user
    const newUser = {
      username,
      email,
      country_code,
      phone,
      address,
      age,
    };

    const db = await connectToDatabase();
    const collection = db.collection("users");

    // Check if the username is already taken
    const existingUser = await collection.findOne({
      country_code,
      phone,
      email,
    });
    if (existingUser) {
      return res.status(400).json({ error: "phone or email already taken" });
    }

    // Insert the user into the collection
    const result = await collection.insertOne({
      ...newUser,
      profile_photo: folder_name || defaultProfilePhoto,
    });

    if (result && newUser) {
      const insertedUserId = result.insertedId.toString();
      // Append STORAGE_URL to the profile_photo if it exists
      if (folder_name) {
        newUser.profile_photo = process.env.STORAGE_URL + folder_name;
      }

      res.json({
        message: "User created successfully",
        user: { ...newUser }, // Include the user ID in the response
      });
    } else {
      console.error("Error creating user: Invalid result object", result);
      res.status(500).json({ error: "Failed to create user" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

//Get User Api.
const GetUser = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("users");
    const { ObjectId } = require("mongodb");
    // Find the user by user ID
    const user = await collection.findOne({
      _id: new ObjectId(req.user.user_id),
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const fullProfilePhotoPath = `${process.env.STORAGE_URL}${user.profile_photo}`;
    const modifiedUser = {
      ...user,
      _id: req.user.user_id,
    };
    const data = { ...modifiedUser, profile_photo: fullProfilePhotoPath };
    res.json({
      message: "User retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

//Get All Users.
const GetAllUsers = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("users");

    // Find all users
    const users = await collection.find().toArray();

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    // Modify each user to change _id field to a string
    const modifiedUsers = users.map((user) => {
      // Construct the full path for the profile photo
      const fullProfilePhotoPath = `${process.env.STORAGE_URL}${user.profile_photo}`;

      return {
        ...user,
        _id: user._id.toString(),
        profile_photo: fullProfilePhotoPath,
      };
    });

    res.json({
      message: "Users retrieved successfully",
      users: modifiedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

//Update User profile.
const UpdateUser = async(req, res)=>{
  try {
    const db = await connectToDatabase();
    const collection = db.collection("users");

    // Assuming req.params.phoneNumber contains the phone number to update
   const {country_code, phoneNumber}= req.query

    // Assuming req.body contains the updated user data
    const updatedUserData = req.body;

    // Update the user in the database based on the phone number
    const updatedUser = await updateOneDocument(User, { country_code:country_code,phone_number: phoneNumber }, updatedUserData);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found or could not be updated" });
    }

    // Optionally, you can fetch the updated user from the database to send in the response
    const fetchedUser = await collection.findOne({country_code:country_code, phone: phoneNumber });

    res.json({
      message: "User updated successfully",
      user: fetchedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
}

module.exports = {
  Login,
  VerifyOtp,
  CreateUser,
  GetUser,
  GetAllUsers,
  UpdateUser
};
