const cloudinary = require("cloudinary").v2;
const config = require("../config");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

const sendImageToCloudinary = (imageName, path) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      { public_id: imageName },
      function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }

        // delete a file asynchronously
        fs.unlink(path, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("File is deleted.");
          }
        });
      }
    );
  });
};
const deleteFileFromCloudinary = async (fileUrl) => {
  try {
    // Parse URL and get the path after '/upload/'
    const urlPath = new URL(fileUrl).pathname;
    const uploadIndex = urlPath.indexOf("/upload/") + 8; // 8 = length of "/upload/"
    let publicIdWithVersion = urlPath.slice(uploadIndex); // v1755240558/Authentication%20(1).png

    // Remove version number (v1234567890/)
    const parts = publicIdWithVersion.split("/");
    if (parts[0].startsWith("v")) {
      parts.shift(); // remove version
    }

    // Decode URL-encoded characters and remove file extension
    const decodedPublicId = decodeURIComponent(parts.join("/"));
    const publicId = decodedPublicId.replace(path.extname(decodedPublicId), "");

    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted from Cloudinary: ${publicId}`, result);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + "/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + file.originalname;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

module.exports = {
  sendImageToCloudinary,
  upload,
  deleteFileFromCloudinary,
};
