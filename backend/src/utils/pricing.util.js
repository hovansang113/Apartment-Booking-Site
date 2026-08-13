// Cuoi tuan = dem Thu 6 + Thu 7 (chuan pho bien cua cac nen tang cho thue
// ngan han - khach thuong nhan phong Thu 6). Dung getUTCDay() tren chuoi
// 'YYYY-MM-DDT00:00:00Z' de tranh loi lech ngay do timezone server (cung
// class bug da gap voi node-ical, xem calendar.service.js).
function isWeekendDate(ymd) {
  const dow = new Date(`${ymd}T00:00:00Z`).getUTCDay(); // 0=CN,1=T2,...,5=T6,6=T7
  return dow === 5 || dow === 6;
}

// Gia goc cho 1 ngay cu the (TRUOC khi ap dung override rieng ngay do) -
// dung chung cho ca man hinh lich (calendar.service.js) va tinh gia booking
// that (pricing.service.js), dam bao 2 noi khong bao gio tinh lech nhau.
function getBasePrice(listing, ymd) {
  return isWeekendDate(ymd) ? Number(listing.weekendPrice) : Number(listing.weekdayPrice);
}

module.exports = { isWeekendDate, getBasePrice };
