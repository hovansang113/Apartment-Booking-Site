const calendarService = require('../services/calendar.service');
const { ok } = require('../utils/response.util');

async function blockDates(req, res) {
  const { startDate, endDate, note } = req.body;
  const result = await calendarService.blockDates({
    listingId: req.params.listingId,
    hostId: req.user.id,
    startDate,
    endDate,
    note,
  });
  return ok(res, result, 'Dates blocked successfully');
}

async function unblockDates(req, res) {
  const { startDate, endDate } = req.body;
  const result = await calendarService.unblockDates({
    listingId: req.params.listingId,
    hostId: req.user.id,
    startDate,
    endDate,
  });
  return ok(res, result, 'Dates unblocked successfully');
}

async function getCalendar(req, res) {
  const { year, month } = req.query;
  if (!year || !month) {
    return res.status(400).json({ success: false, message: 'year and month are required' });
  }
  const days = await calendarService.getCalendar({
    listingId: req.params.listingId,
    year,
    month,
  });
  return ok(res, days);
}

module.exports = { blockDates, unblockDates, getCalendar };
