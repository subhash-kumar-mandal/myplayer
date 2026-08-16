
const multer = require('multer');

const {CloudinaryStorage}  = require("multer-storage-cloudinary");
const cloudinary  = require('../configs/cloudinary');


const storage = new CloudinaryStorage({
    cloudinary,

    params: {
        folder: "spotify-clone/albums",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
});

const upload = multer({
    storage,
});

module.exports = upload;