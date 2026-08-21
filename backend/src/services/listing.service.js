const prisma = require('../config/prisma');
const AppError = require('../utils/appError');
const { processAndSaveListingImage, deleteListingImageFiles } = require('../utils/imageProcessing');

// files: chi la array cac buffer tu multer.memoryStorage() (xem
// upload.middleware.js) - listingId phai co san TRUOC khi goi ham nay (anh
// duoc luu vao thu muc rieng theo listingId, xem imageProcessing.js), khac
// voi luc con Cloudinary (upload xong moi biet gan vao listing nao).
async function uploadImages(files, listingId) {
  const results = await Promise.all(files.map((file) => processAndSaveListingImage(file.buffer, listingId)));
  return results.map((r, index) => ({ ...r, sortOrder: index }));
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
// Gop cac ngay le trong listing_calendar (1 dong/ngay, bat ke booked/blocked/
// synced) thanh cac khoang lien tuc [start, end) - khop quy uoc dang dung o
// booking.service.js#datesBetween, de AvailabilityCalendar.jsx (FE) to mau do
// dung cac ngay khach khac da giu.
function buildBookedRanges(calendarDates) {
  const sorted = [...calendarDates].sort((a, b) => a - b);
  const ranges = [];
  for (const date of sorted) {
    const last = ranges[ranges.length - 1];
    if (last && last.end.getTime() === date.getTime()) {
      last.end = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    } else {
      ranges.push({ start: date, end: new Date(date.getTime() + 24 * 60 * 60 * 1000) });
    }
  }
  return ranges;
}

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

  const calendarRows = await prisma.listingCalendar.findMany({
    where: { listingId },
    select: { date: true },
  });

  return { ...listing, bookedRanges: buildBookedRanges(calendarRows.map((r) => r.date)) };
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
  cleaningFee,
  guestCapacity,
  bedrooms,
  beds,
  bathrooms,
  amenities,
  files,
}) {
  // Anh can biet listingId de luu dung thu muc (uploads/listings/{id}/...) -
  // khac voi luc con Cloudinary (upload doc lap, gan URL vao sau). Nen tao
  // listing TRUOC (chua co anh), roi moi xu ly + gan anh vao. Neu buoc xu ly
  // anh loi, xoa listing vua tao de khong de lai ban ghi rong mo coi.
  const listing = await prisma.listing.create({
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
      cleaningFee,
      guestCapacity,
      bedrooms,
      beds,
      bathrooms,
      amenities: amenities ? { create: toAmenityData(amenities) } : undefined,
    },
  });

  try {
    const imageData = await uploadImages(files, listing.id);
    return await prisma.listing.update({
      where: { id: listing.id },
      data: { images: { create: imageData } },
      include: { images: true, amenities: true },
    });
  } catch (err) {
    await prisma.listing.delete({ where: { id: listing.id } }).catch(() => {});
    throw err;
  }
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
    select: { imageUrl: true, thumbUrl: true },
  });

  // Xóa bài đăng trong DB
  await prisma.listing.delete({ where: { id: listingId } });

  // Tự động xóa các file ảnh tương ứng trên đĩa (chạy nền, không chặn response)
  Promise.all(existingImages.map(deleteListingImageFiles)).catch((err) => {
    console.error('Background image cleanup error on delete listing:', err);
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

  deleteListingImageFiles(image).catch((err) => {
    console.error('Background image cleanup error on delete image:', err);
  });

  return { success: true };
}

// Host them anh moi vao 1 bai dang da co san (19/8, cung dot voi EditListingPage
// - truoc gio chi co PUT /:id sua text/gia/tien nghi, khong dong cham anh).
// sortOrder noi tiep tu anh cuoi cung hien co, khong ghi de tu 0.
async function addListingImages({ listingId, hostId, files }) {
  await assertOwnedByHost(listingId, hostId);

  const lastImage = await prisma.listingImage.findFirst({
    where: { listingId },
    orderBy: { sortOrder: 'desc' },
  });
  const startOrder = lastImage ? lastImage.sortOrder + 1 : 0;

  const imageData = await uploadImages(files, listingId);
  await prisma.listingImage.createMany({
    data: imageData.map((img, index) => ({ listingId, ...img, sortOrder: startOrder + index })),
  });
  return prisma.listingImage.findMany({ where: { listingId }, orderBy: { sortOrder: 'asc' } });
}

module.exports = {
  getMyListings,
  getPublicListings,
  getPublicListingById,
  createListing,
  updateListing,
  deleteListing,
  deleteListingImage,
  addListingImages,
};
