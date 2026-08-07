const multer = require('multer');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// REQ_02: giu file trong memory, validate xong (validators/listing.validator.js)
// moi that su upload len Cloudinary trong listing.service.js. Khong dung
// CloudinaryStorage truc tiep vi no upload ngay luc parse request, truoc ca
// buoc validate - request sai van ton 1 lan goi Cloudinary that.
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
