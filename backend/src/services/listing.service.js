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

// REQ_02: host creates a listing
async function createListing({
  hostId,
  title,
  description,
  category,
  address,
  latitude,
  longitude,
  defaultPrice,
  guestCapacity,
  bedrooms,
  beds,
  bathrooms,
  amenities,
  files,
}) {
  console.log('=== createListing ===');
  console.log('files:', files?.length, 'amenities:', amenities, 'category:', category);
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
  const imageData = await uploadImages(files);
  console.log('imageData:', imageData);

  return prisma.listing.create({
    data: {
      hostId,
      title,
      description,
      category,
      address,
      latitude,
      longitude,
      defaultPrice,
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

  await prisma.listing.delete({ where: { id: listingId } });
}

// REQ_05: public listing search - chỉ approved
async function getPublicListings({ category, page = 1, limit = 20 } = {}) {
  const where = { status: 'approved', ...(category ? { category } : {}) };
  const skip = (Number(page) - 1) * Number(limit);
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.listing.count({ where }),
  ]);
  return { listings, total };
}

// REQ_02: host gets its own listings
async function getHostListings(hostId) {
  return prisma.listing.findMany({
    where: { hostId },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      amenities: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// REQ_02: get single listing (public)
async function getListing(listingId) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      amenities: true,
      host: { select: { id: true, fullName: true } },
    },
  });
  if (!listing) throw new AppError(404, 'Listing not found');
  return listing;
}

module.exports = { createListing, updateListing, deleteListing, getPublicListings, getHostListings, getListing };
