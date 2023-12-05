"use strict";

const { v4: uuidv4 } = require("uuid");
const path = require("path");
const Resize = require("./fileResize");

// for upload file with unique filename.
module.exports.profileImage = async (imageData, folder_name) => {
  if (imageData) {
    const profileImage = `${uuidv4()}.${
      imageData?.originalname?.split(".")[1]
    }`;

    const imagePath = path.join(__dirname, `../uploads/${folder_name}`);
    const imageThumbsPath = path.join(
      __dirname,
      `../uploads/${folder_name}/thumb`
    );
    // save thumb image
    const f1 = new Resize(imageThumbsPath);
    f1.saveThumbs(imageData.buffer, profileImage);
    // save image
    const f2 = new Resize(imagePath);
    f2.save(imageData.buffer, profileImage);
    const fullImagePath = `${process.env.STORAGE_URL}/${folder_name}/${profileImage}`;
    return {
      folder_name: `${folder_name}/${profileImage}`,
      fullImagePath: fullImagePath,
    };
  }
};
