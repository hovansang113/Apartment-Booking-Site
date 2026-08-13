const adminService = require('../services/admin.service');
const { ok } = require('../utils/response.util');

// REQ_03 - duyet/tam dung tin dang
async function listListings(req, res) {
  const listings = await adminService.listListings({ status: req.query.status });
  return ok(res, listings);
}

async function approveListing(req, res) {
  const listing = await adminService.approveListing(req.params.id);
  return ok(res, listing, 'Đã duyệt tin đăng');
}

async function suspendListing(req, res) {
  const listing = await adminService.suspendListing(req.params.id, req.body.reason);
  return ok(res, listing, 'Đã đình chỉ tin đăng');
}

// REQ_04 - quan ly user (khoa/mo khoa)
async function listUsers(req, res) {
  const users = await adminService.listUsers({ role: req.query.role, status: req.query.status });
  return ok(res, users);
}

async function lockUser(req, res) {
  const user = await adminService.lockUser(req.params.id, req.body.reason);
  return ok(res, user, 'Đã khoá tài khoản');
}

async function unlockUser(req, res) {
  const user = await adminService.unlockUser(req.params.id);
  return ok(res, user, 'Đã mở khoá tài khoản');
}

// Duyet ho so thue/giay to host
async function listTaxVerifications(req, res) {
  const users = await adminService.listTaxVerifications({ status: req.query.status });
  return ok(res, users);
}

async function reviewTaxInfo(req, res) {
  const { status, note } = req.body;
  const user = await adminService.reviewTaxInfo(req.params.id, { status, note });
  return ok(res, user, status === 'verified' ? 'Đã xác minh hồ sơ' : 'Đã từ chối hồ sơ');
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
