const notificationService = require('../services/notification.service');
const { ok } = require('../utils/response.util');

async function getMyNotifications(req, res) {
  const notifications = await notificationService.getMyNotifications(req.user.id);
  return ok(res, notifications);
}

async function markRead(req, res) {
  const notification = await notificationService.markRead({
    notificationId: req.params.id,
    userId: req.user.id,
  });
  return ok(res, notification, 'Marked as read');
}

async function markAllRead(req, res) {
  await notificationService.markAllRead(req.user.id);
  return ok(res, null, 'All notifications marked as read');
}

module.exports = { getMyNotifications, markRead, markAllRead };
