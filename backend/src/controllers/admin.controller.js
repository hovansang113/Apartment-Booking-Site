const adminService = require('../services/admin.service');
const { ok } = require('../utils/response.util');

// REQ_03: GET /api/admin/listings?status=pending&page=1&limit=20
async function getListings(req, res) {
  const { status, page, limit } = req.query;
  const result = await adminService.getListings({ status, page, limit });
  return ok(res, result);
}

// REQ_03: PATCH /api/admin/listings/:id/status
async function updateListingStatus(req, res) {
  const { status, suspendReason } = req.body;
  const listing = await adminService.updateListingStatus({
    listingId: req.params.id,
    status,
    suspendReason,
  });
  return ok(res, listing, `Listing ${status} successfully`);
}

// REQ_04: GET /api/admin/users
async function getUsers(req, res) {
  const { role, status, page, limit } = req.query;
  const result = await adminService.getUsers({ role, status, page, limit });
  return ok(res, result);
}

// REQ_04: PATCH /api/admin/users/:id/status
async function updateUserStatus(req, res) {
  const { status } = req.body;
  const user = await adminService.updateUserStatus({ userId: req.params.id, status });
  return ok(res, user, `User ${status} successfully`);
}

module.exports = { getListings, updateListingStatus, getUsers, updateUserStatus };
