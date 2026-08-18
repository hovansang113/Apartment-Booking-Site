const calendarService = require('../services/calendar.service');
const { ok, created } = require('../utils/response.util');

// REQ_12 - xem lich 1 thang
async function getMonthView(req, res) {
  const { year, month } = req.query;
  const data = await calendarService.getMonthView({
    listingId: req.params.listingId,
    hostId: req.user.id,
    year,
    month,
  });
  return ok(res, data);
}

// REQ_12 - chan ngay thu cong
async function blockDates(req, res) {
  const { dates, note } = req.body;
  await calendarService.blockDates({ listingId: req.params.listingId, hostId: req.user.id, dates, note });
  return ok(res, null, 'Selected dates blocked');
}

// REQ_12 - mo lai ngay da chan thu cong
async function unblockDates(req, res) {
  const { dates } = req.body;
  await calendarService.unblockDates({ listingId: req.params.listingId, hostId: req.user.id, dates });
  return ok(res, null, 'Selected dates unblocked');
}

// Gia rieng theo ngay, dung chung man hinh lich REQ_12
async function setPriceOverride(req, res) {
  const { date, price } = req.body;
  const result = await calendarService.setPriceOverride({
    listingId: req.params.listingId,
    hostId: req.user.id,
    date,
    price,
  });
  return ok(res, result, 'Price updated for this date');
}

// "Custom settings" - so dem toi thieu/toi da neu check-in dung ngay nay
async function setStayRule(req, res) {
  const { date, minNights, maxNights } = req.body;
  const result = await calendarService.setStayRule({
    listingId: req.params.listingId,
    hostId: req.user.id,
    date,
    minNights: minNights ?? null,
    maxNights: maxNights ?? null,
  });
  return ok(res, result, 'Minimum/maximum nights updated for this date');
}

async function listSyncSources(req, res) {
  const sources = await calendarService.listSyncSources({
    listingId: req.params.listingId,
    hostId: req.user.id,
  });
  return ok(res, sources);
}

async function connectSyncSource(req, res) {
  const { icalUrl, label } = req.body;
  const sync = await calendarService.connectIcalSource({
    listingId: req.params.listingId,
    hostId: req.user.id,
    icalUrl,
    label,
  });
  return created(res, sync, 'External calendar connected and synced');
}

async function refreshSyncSource(req, res) {
  const sync = await calendarService.syncIcalSource({
    listingId: req.params.listingId,
    hostId: req.user.id,
    syncId: req.params.syncId,
  });
  return ok(res, sync, 'Calendar sync refreshed');
}

async function updateSyncSource(req, res) {
  const { icalUrl, label } = req.body;
  const sync = await calendarService.updateSyncSource({
    listingId: req.params.listingId,
    hostId: req.user.id,
    syncId: req.params.syncId,
    icalUrl,
    label,
  });
  return ok(res, sync, 'External calendar updated');
}

async function removeSyncSource(req, res) {
  await calendarService.removeSyncSource({
    listingId: req.params.listingId,
    hostId: req.user.id,
    syncId: req.params.syncId,
  });
  return ok(res, null, 'External calendar disconnected');
}

// Cong khai, khong can dang nhap - Airbnb/VRBO tu fetch link nay dinh ky.
async function exportIcal(req, res) {
  const ics = await calendarService.exportIcal({ listingId: req.params.listingId, token: req.query.t });
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  return res.send(ics);
}

module.exports = {
  exportIcal,
  getMonthView,
  blockDates,
  unblockDates,
  setPriceOverride,
  setStayRule,
  listSyncSources,
  connectSyncSource,
  refreshSyncSource,
  updateSyncSource,
  removeSyncSource,
};
