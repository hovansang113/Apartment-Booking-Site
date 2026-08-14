const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/appError');

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, phone: true, avatarUrl: true, role: true, createdAt: true },
  });
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

async function updateProfile(userId, { fullName, phone }) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(phone !== undefined && { phone }),
    },
    select: { id: true, email: true, fullName: true, phone: true, avatarUrl: true, role: true },
  });
}

async function updateAvatar(userId, file) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } });

  // Delete old avatar from Cloudinary if exists
  if (user?.avatarUrl) {
    const publicId = user.avatarUrl.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '');
    await cloudinary.uploader.destroy(publicId).catch(() => {});
  }

  const avatarUrl = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'booking-platform/avatars', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });

  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: { id: true, email: true, fullName: true, phone: true, avatarUrl: true, role: true },
  });
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) throw new AppError(400, 'Cannot change password for this account');

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw new AppError(400, 'Current password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

module.exports = { getMe, updateProfile, updateAvatar, changePassword };
