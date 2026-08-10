const prisma = require('../config/prisma');
const AppError = require('../utils/appError');

async function createNotification({ userId, title, body }) {
  return prisma.notification.create({
    data: { userId, title, body },
  });
}

async function getMyNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

async function markRead({ notificationId, userId }) {
  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notif) throw new AppError(404, 'Notification not found');
  if (notif.userId !== userId) throw new AppError(403, 'Not your notification');

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

async function markAllRead(userId) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

module.exports = { createNotification, getMyNotifications, markRead, markAllRead };
