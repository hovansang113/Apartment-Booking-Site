const listingService = require('../services/listing.service');
const { created, ok } = require('../utils/response.util');

// REQ_02 - host creates a listing
async function create(req, res) {
  const {
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
  } = req.body;
  const listing = await listingService.createListing({
    hostId: req.user.id,
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
    files: req.files,
  });
  return created(res, listing, 'Listing created successfully, pending admin approval');
}

// REQ_02 - host updates its own listing
async function update(req, res) {
  const {
    title, description, category, address, latitude, longitude,
    defaultPrice, guestCapacity, bedrooms, beds, bathrooms,
    amenities, deleteImageIds,
  } = req.body;
  const listing = await listingService.updateListing({
    listingId: req.params.id,
    hostId: req.user.id,
    title, description, category, address, latitude, longitude,
    defaultPrice, guestCapacity, bedrooms, beds, bathrooms,
    amenities,
    deleteImageIds: deleteImageIds ? (Array.isArray(deleteImageIds) ? deleteImageIds : [deleteImageIds]) : [],
    files: req.files || [],
  });
  return ok(res, listing, 'Listing updated successfully');
}

// REQ_02 - host deletes its own listing
async function remove(req, res) {
  await listingService.deleteListing({ listingId: req.params.id, hostId: req.user.id });
  return ok(res, null, 'Listing deleted successfully');
}

// REQ_05 - public listing list
async function getPublicListings(req, res) {
  const { category, location, checkIn, checkOut, guests, page, limit } = req.query;
  const result = await listingService.getPublicListings({ category, location, checkIn, checkOut, guests, page, limit });
  return ok(res, result);
}

// REQ_06 - public single listing
async function getOne(req, res) {
  const listing = await listingService.getListing(req.params.id);
  return ok(res, listing);
}

// REQ_02 - host gets its own listings
async function getHostListings(req, res) {
  const listings = await listingService.getHostListings(req.user.id);
  return ok(res, listings);
}

module.exports = { create, update, remove, getPublicListings, getOne, getHostListings };
