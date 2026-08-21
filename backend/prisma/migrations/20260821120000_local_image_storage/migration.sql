-- Anh listing chuyen tu Cloudinary sang luu local (21/8) - moi anh gio co
-- them 1 ban thumb rieng. Them cot voi default rong tam thoi de khong vo
-- migration tren cac dong da co san; script scripts/migrateCloudinaryImages.js
-- se backfill gia tri that ngay sau khi migration nay chay.
ALTER TABLE `listing_images` ADD COLUMN `thumb_url` VARCHAR(191) NOT NULL DEFAULT '';
