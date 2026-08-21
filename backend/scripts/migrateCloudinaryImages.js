// Chay 1 lan sau khi migration 20260821120000_local_image_storage da ap dung
// (them cot thumb_url) - tai lai moi anh dang tro ve Cloudinary, resize +
// nen AVIF, luu local, cap nhat DB. Sau khi chay xong, khong con dong nao
// trong listing_images tro ve res.cloudinary.com nua.
//
// Chay: node scripts/migrateCloudinaryImages.js
require('dotenv').config();
const prisma = require('../src/config/prisma');
const { processAndSaveListingImage } = require('../src/utils/imageProcessing');

async function main() {
  const images = await prisma.listingImage.findMany({
    where: { imageUrl: { contains: 'res.cloudinary.com' } },
  });

  if (images.length === 0) {
    console.log('No Cloudinary-hosted images left to migrate.');
    return;
  }

  console.log(`Found ${images.length} Cloudinary image(s) to migrate...`);

  for (const img of images) {
    try {
      const res = await fetch(img.imageUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${img.imageUrl}`);
      const buffer = Buffer.from(await res.arrayBuffer());

      const { imageUrl, thumbUrl } = await processAndSaveListingImage(buffer, img.listingId);

      await prisma.listingImage.update({
        where: { id: img.id },
        data: { imageUrl, thumbUrl },
      });

      console.log(`OK  [${img.id}] ${img.imageUrl} -> ${imageUrl}`);
    } catch (err) {
      console.error(`FAIL [${img.id}] ${img.imageUrl}:`, err.message);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
