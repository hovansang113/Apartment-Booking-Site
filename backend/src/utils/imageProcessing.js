const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

// Anh listing luu local (khong con Cloudinary, 21/8 - tranh phu thuoc 1 dich
// vu ngoai lam sap ca site neu no down). Thu muc goc co the doi qua env
// (UPLOADS_DIR) - mac dinh nam ngay trong container, luon phai mount volume
// ben ngoai vao day (xem docker-compose.yml) de khong mat anh moi lan deploy
// build lai image.
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
const LARGE_WIDTH = 1600; // trang chi tiet/gallery
const THUMB_WIDTH = 480; // card/danh sach/email
const AVIF_QUALITY = 60; // ~tuong duong JPEG 80 ve mat chat luong nhin, nhung nhe hon nhieu

// REQ_02: xu ly 1 anh listing vua upload - resize + nen AVIF thanh 2 kich co
// (Jason yeu cau 21/8: "downsized to different sizes for thumbnails, large
// images" + "use AVIF which is well supported"), luu ca 2 vao dia, tra ve
// duong dan tuong doi (nginx phuc vu thang o /uploads/..., xem nginx.conf).
async function processAndSaveListingImage(buffer, listingId) {
  const dir = path.join(UPLOADS_DIR, 'listings', listingId);
  await fs.mkdir(dir, { recursive: true });

  const fileId = crypto.randomBytes(8).toString('hex');
  const largeName = `${fileId}-large.avif`;
  const thumbName = `${fileId}-thumb.avif`;

  const image = sharp(buffer).rotate(); // rotate() doc EXIF orientation, tranh anh bi xoay sai huong

  await Promise.all([
    image
      .clone()
      .resize({ width: LARGE_WIDTH, withoutEnlargement: true })
      .avif({ quality: AVIF_QUALITY })
      .toFile(path.join(dir, largeName)),
    image
      .clone()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .avif({ quality: AVIF_QUALITY })
      .toFile(path.join(dir, thumbName)),
  ]);

  return {
    imageUrl: `/uploads/listings/${listingId}/${largeName}`,
    thumbUrl: `/uploads/listings/${listingId}/${thumbName}`,
  };
}

// Xoa ca 2 file (large + thumb) cua 1 anh khoi dia - imageUrl/thumbUrl la
// duong dan tuong doi bat dau bang "/uploads/", can bo tien to nay de ra
// duong dan that tren dia.
async function deleteListingImageFiles({ imageUrl, thumbUrl }) {
  const toDelete = [imageUrl, thumbUrl].filter(Boolean);
  await Promise.all(
    toDelete.map(async (relativeUrl) => {
      const filePath = path.join(UPLOADS_DIR, relativeUrl.replace(/^\/uploads\//, ''));
      try {
        await fs.unlink(filePath);
      } catch (err) {
        if (err.code !== 'ENOENT') console.error(`Failed to delete image file [${filePath}]:`, err);
      }
    }),
  );
}

module.exports = { processAndSaveListingImage, deleteListingImageFiles, UPLOADS_DIR };
