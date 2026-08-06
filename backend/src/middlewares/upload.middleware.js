const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// REQ_02: upload anh tin dang qua Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'booking-platform/listings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

module.exports = { upload };
