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
  return ok(res, null, 'Đã chặn ngày đã chọn');
}

// REQ_12 - mo lai ngay da chan thu cong
async function unblockDates(req, res) {
  const { dates } = req.body;
  await calendarService.unblockDates({ listingId: req.params.listingId, hostId: req.user.id, dates });
  return ok(res, null, 'Đã mở lại ngày đã chọn');
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
  return ok(res, result, 'Đã cập nhật giá cho ngày này');
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
  return created(res, sync, 'Đã kết nối và đồng bộ lịch ngoài');
}

async function refreshSyncSource(req, res) {
  const sync = await calendarService.syncIcalSource({
    listingId: req.params.listingId,
    hostId: req.user.id,
    syncId: req.params.syncId,
  });
  return ok(res, sync, 'Đã làm mới đồng bộ lịch');
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
  return ok(res, sync, 'Đã cập nhật lịch ngoài');
}

async function removeSyncSource(req, res) {
  await calendarService.removeSyncSource({
    listingId: req.params.listingId,
    hostId: req.user.id,
    syncId: req.params.syncId,
  });
  return ok(res, null, 'Đã ngắt kết nối lịch ngoài');
}

module.exports = {
  getMonthView,
  blockDates,
  unblockDates,
  setPriceOverride,
  listSyncSources,
  connectSyncSource,
  refreshSyncSource,
  updateSyncSource,
  removeSyncSource,
};
