const multer = require('multer');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// REQ_02: giu file trong memory (buffer), validate xong
// (validators/listing.validator.js) moi that su resize + luu xuong dia trong
// listing.service.js (utils/imageProcessing.js) - request sai (thieu title,
// gia am...) se khong ton cong xu ly anh vo ich.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only jpg, png, webp images are allowed'));
    }
    cb(null, true);
  },
});

module.exports = { upload };
