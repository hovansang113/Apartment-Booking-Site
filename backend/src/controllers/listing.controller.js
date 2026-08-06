const listingService = require('../services/listing.service');
const { created, ok } = require('../utils/response.util');

// REQ_02 - host creates a listing
async function create(req, res) {
  const { title, description, category, address, latitude, longitude, defaultPrice } = req.body;
  const listing = await listingService.createListing({
    hostId: req.user.id,
    title,
    description,
    category,
    address,
    latitude,
    longitude,
    defaultPrice,
    files: req.files,
  });
  return created(res, listing, 'Listing created successfully, pending admin approval');
}

// REQ_02 - host updates its own listing
async function update(req, res) {
  const { title, description, category, address, latitude, longitude, defaultPrice } = req.body;
  const listing = await listingService.updateListing({
    listingId: req.params.id,
    hostId: req.user.id,
    title,
    description,
    category,
    address,
    latitude,
    longitude,
    defaultPrice,
  });
  return ok(res, listing, 'Listing updated successfully');
}

// REQ_02 - host deletes its own listing
async function remove(req, res) {
  await listingService.deleteListing({ listingId: req.params.id, hostId: req.user.id });
  return ok(res, null, 'Listing deleted successfully');
}

module.exports = { create, update, remove };
