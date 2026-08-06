const prisma = require('../config/prisma');
const AppError = require('../utils/appError');

function toImageData(files) {
  return files.map((file, index) => ({
    imageUrl: file.path,
    sortOrder: index,
  }));
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
async function createListing({ hostId, title, description, category, address, latitude, longitude, defaultPrice, files }) {
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
      images: { create: toImageData(files) },
    },
    include: { images: true },
  });
}

// REQ_02: host updates its own listing
async function updateListing({ listingId, hostId, ...fields }) {
  await assertOwnedByHost(listingId, hostId);

  return prisma.listing.update({
    where: { id: listingId },
    data: fields,
    include: { images: true },
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

module.exports = { createListing, updateListing, deleteListing };
