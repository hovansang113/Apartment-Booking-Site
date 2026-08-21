const listingService = require('../services/listing.service');
const { created, ok } = require('../utils/response.util');

// Prereq cho REQ_12 (host calendar) - host xem danh sach bai dang cua minh
async function mine(req, res) {
  const listings = await listingService.getMyListings(req.user.id);
  return ok(res, listings);
}

// REQ_05 - guest xem danh sach listing cong khai (chi approved)
async function list(req, res) {
  const { category, page } = req.query;
  const result = await listingService.getPublicListings({ category, page });
  return ok(res, result);
}

// REQ_06 - guest xem chi tiet 1 listing cong khai (chi approved)
async function getOne(req, res) {
  const listing = await listingService.getPublicListingById(req.params.id);
  return ok(res, listing);
}

// REQ_02 - host creates a listing
async function create(req, res) {
  const {
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
  } = req.body;
  const listing = await listingService.createListing({
    hostId: req.user.id,
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
    files: req.files,
  });
  return created(res, listing, 'Listing created successfully, pending admin approval');
}

// REQ_02 - host updates its own listing
async function update(req, res) {
  const {
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
  } = req.body;
  const listing = await listingService.updateListing({
    listingId: req.params.id,
    hostId: req.user.id,
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
  });
  return ok(res, listing, 'Listing updated successfully');
}

// REQ_02 - host deletes its own listing
async function remove(req, res) {
  await listingService.deleteListing({ listingId: req.params.id, hostId: req.user.id });
  return ok(res, null, 'Listing deleted successfully');
}

// Host deletes a single image from a listing
async function removeImage(req, res) {
  const { id: listingId, imageId } = req.params;
  await listingService.deleteListingImage({ listingId, imageId, hostId: req.user.id });
  return ok(res, null, 'Image deleted successfully');
}

// Host adds more images to an existing listing
async function addImages(req, res) {
  const images = await listingService.addListingImages({
    listingId: req.params.id,
    hostId: req.user.id,
    files: req.files,
  });
  return ok(res, images, 'Images added successfully');
}

module.exports = { mine, list, getOne, create, update, remove, removeImage, addImages };
