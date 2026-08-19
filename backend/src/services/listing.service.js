const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/appError');

function uploadImageToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'booking-platform/listings' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });
}

/**
 * Trích xuất public_id từ Cloudinary URL để xóa ảnh trên Cloudinary
 * Ví dụ URL: https://res.cloudinary.com/demo/image/upload/v1234567/booking-platform/listings/sample.jpg
 * => public_id: booking-platform/listings/sample
 */
function extractPublicId(imageUrl) {
  if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) {
    return null;
  }
  try {
    const parts = imageUrl.split('/upload/');
    if (parts.length < 2) return null;
    let pathAfterUpload = parts[1];
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
    const lastDotIndex = pathAfterUpload.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      return pathAfterUpload.substring(0, lastDotIndex);
    }
    return pathAfterUpload;
  } catch (error) {
    console.error('Error extracting Cloudinary public_id:', error);
    return null;
  }
}

/**
 * Xóa 1 ảnh trên Cloudinary
 */
async function deleteImageFromCloudinary(imageUrl) {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary destroy [${publicId}]:`, result);
    return result;
  } catch (error) {
    console.error(`Failed to delete Cloudinary image [${publicId}]:`, error);
  }
}

/**
 * Xóa nhiều ảnh trên Cloudinary
 */
async function deleteMultipleImagesFromCloudinary(imageUrls) {
  if (!imageUrls || !imageUrls.length) return;
  await Promise.all(imageUrls.map((url) => deleteImageFromCloudinary(url)));
}

async function uploadImages(files) {
  const urls = await Promise.all(files.map(uploadImageToCloudinary));
  return urls.map((imageUrl, index) => ({ imageUrl, sortOrder: index }));
}

function toAmenityData(amenities) {
  return amenities.map((amenity) => ({ amenity }));
}

async function assertOwnedByHost(listingId, hostId) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }
  if (listing.hostId !== hostId) {
    throw new AppError(403, 'You do not own this listing');
  }
  return listing;
}

// REQ_02 (prereq cho REQ_12): host xem danh sach bai dang cua chinh minh -
// bao gom moi status (pending/approved/suspended), khac voi REQ_05 (danh sach
// cong khai chi hien approved).
async function getMyListings(hostId) {
  return prisma.listing.findMany({
    where: { hostId },
    include: { images: true, amenities: true },
    orderBy: { createdAt: 'desc' },
  });
}

const PUBLIC_PAGE_SIZE = 20;

// REQ_05: guest xem danh sach listing cong khai - chi hien status approved,
// khong lo thong tin host ngoai ten hien thi. Loc theo category neu co, phan
// trang bang page/pageSize co dinh.
async function getPublicListings({ category, page }) {
  const pageNum = Number(page) > 0 ? Number(page) : 1;
  const where = { status: 'approved', ...(category ? { category } : {}) };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        host: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * PUBLIC_PAGE_SIZE,
      take: PUBLIC_PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
  ]);

  return { listings, total };
}

// REQ_06: guest xem chi tiet 1 listing cong khai - chi hien status approved
// (listing dang pending/suspended tra ve 404 nhu khong ton tai, khong lo
// trang thai noi bo cho guest).
async function getPublicListingById(listingId) {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, status: 'approved' },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      amenities: true,
      host: { select: { fullName: true } },
    },
  });
  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }
  return listing;
}

// REQ_02: host creates a listing
async function createListing({
  hostId,
  title,
  description,
  category,
  address,
  latitude,
  longitude,
  weekdayPrice,
  weekendPrice,
  guestCapacity,
  bedrooms,
  beds,
  bathrooms,
  amenities,
  files,
}) {
  const imageData = await uploadImages(files);

  return prisma.listing.create({
    data: {
      hostId,
      title,
      description,
      category,
      address,
      latitude,
      longitude,
      weekdayPrice,
      weekendPrice,
      guestCapacity,
      bedrooms,
      beds,
      bathrooms,
      images: { create: imageData },
      amenities: amenities ? { create: toAmenityData(amenities) } : undefined,
    },
    include: { images: true, amenities: true },
  });
}

// REQ_02: host updates its own listing
async function updateListing({ listingId, hostId, amenities, ...fields }) {
  await assertOwnedByHost(listingId, hostId);

  return prisma.listing.update({
    where: { id: listingId },
    data: {
      ...fields,
      ...(amenities ? { amenities: { deleteMany: {}, create: toAmenityData(amenities) } } : {}),
    },
    include: { images: true, amenities: true },
  });
}

// REQ_02: host deletes its own listing
async function deleteListing({ listingId, hostId }) {
  await assertOwnedByHost(listingId, hostId);

  const bookingCount = await prisma.booking.count({ where: { listingId } });
  if (bookingCount > 0) {
    throw new AppError(409, 'Cannot delete a listing that already has bookings');
  }

  // Lấy tất cả ảnh thuộc về listing này trước khi xóa
  const existingImages = await prisma.listingImage.findMany({
    where: { listingId },
    select: { imageUrl: true },
  });

  // Xóa bài đăng trong DB
  await prisma.listing.delete({ where: { id: listingId } });

  // Tự động xóa các ảnh tương ứng trên Cloudinary
  const imageUrls = existingImages.map((img) => img.imageUrl);
  deleteMultipleImagesFromCloudinary(imageUrls).catch((err) => {
    console.error('Background Cloudinary cleanup error on delete listing:', err);
  });
}

// Host xóa 1 ảnh riêng lẻ thuộc về bài đăng
async function deleteListingImage({ listingId, imageId, hostId }) {
  await assertOwnedByHost(listingId, hostId);

  const image = await prisma.listingImage.findFirst({
    where: { id: imageId, listingId },
  });

  if (!image) {
    throw new AppError(404, 'Image not found');
  }

  await prisma.listingImage.delete({ where: { id: imageId } });

  deleteImageFromCloudinary(image.imageUrl).catch((err) => {
    console.error('Background Cloudinary cleanup error on delete image:', err);
  });

  return { success: true };
}

module.exports = {
  getMyListings,
  getPublicListings,
  getPublicListingById,
  createListing,
  updateListing,
  deleteListing,
  deleteListingImage,
  deleteImageFromCloudinary,
};
