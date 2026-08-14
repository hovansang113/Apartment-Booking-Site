const userService = require('../services/user.service');
const { ok } = require('../utils/response.util');

async function getMe(req, res) {
  const user = await userService.getMe(req.user.id);
  return ok(res, user);
}

async function updateProfile(req, res) {
  const { fullName, phone } = req.body;
  const user = await userService.updateProfile(req.user.id, { fullName, phone });
  return ok(res, user, 'Profile updated');
}

async function updateAvatar(req, res) {
  if (!req.file) {
    const { badRequest } = require('../utils/appError');
    throw new (require('../utils/appError'))(400, 'No image provided');
  }
  const user = await userService.updateAvatar(req.user.id, req.file);
  return ok(res, user, 'Avatar updated');
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.id, { currentPassword, newPassword });
  return ok(res, null, 'Password changed successfully');
}

module.exports = { getMe, updateProfile, updateAvatar, changePassword };
