const adminService = require('../services/admin.service');
const { ok } = require('../utils/response.util');

// REQ_03 - duyet/tam dung tin dang
async function listListings(req, res) {
  const listings = await adminService.listListings({ status: req.query.status });
  return ok(res, listings);
}

async function approveListing(req, res) {
  const listing = await adminService.approveListing(req.params.id);
  return ok(res, listing, 'Listing approved');
}

async function suspendListing(req, res) {
  const listing = await adminService.suspendListing(req.params.id, req.body.reason);
  return ok(res, listing, 'Listing suspended');
}

// REQ_04 - quan ly user (khoa/mo khoa)
async function listUsers(req, res) {
  const users = await adminService.listUsers({ role: req.query.role, status: req.query.status });
  return ok(res, users);
}

async function lockUser(req, res) {
  const user = await adminService.lockUser(req.params.id, req.body.reason);
  return ok(res, user, 'Account locked');
}

async function unlockUser(req, res) {
  const user = await adminService.unlockUser(req.params.id);
  return ok(res, user, 'Account unlocked');
}

// Duyet ho so thue/giay to host
async function listTaxVerifications(req, res) {
  const users = await adminService.listTaxVerifications({ status: req.query.status });
  return ok(res, users);
}

async function reviewTaxInfo(req, res) {
  const { status, note } = req.body;
  const user = await adminService.reviewTaxInfo(req.params.id, { status, note });
  return ok(res, user, status === 'verified' ? 'Profile verified' : 'Profile rejected');
}

module.exports = {
  listListings,
  approveListing,
  suspendListing,
  listUsers,
  lockUser,
  unlockUser,
  listTaxVerifications,
  reviewTaxInfo,
};
