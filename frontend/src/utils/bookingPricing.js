// Dung chung cho BookingWidget (xem truoc gia luc chon ngay) va CheckoutPage
// (tom tat gia truoc khi tao booking that). Cuoi tuan = dem Thu 6 + Thu 7
// (khop dung logic backend, xem backend/src/utils/pricing.util.js).
// checkIn/checkOut la chuoi 'YYYY-MM-DD' nen new Date(ymd) da la UTC midnight
// theo spec ISO date-only - phai doc lai bang getUTCDay()/setUTCDate() de
// khong bi lech ngay theo timezone trinh duyet (cung class bug da gap voi
// node-ical o backend).
export function isWeekendDate(dateObj) {
  const dow = dateObj.getUTCDay();
  return dow === 5 || dow === 6;
}

// Tinh tong tien + so dem thuong/cuoi tuan cho khoang [checkIn, checkOut).
export function nightlyBreakdown(checkIn, checkOut, weekdayPrice, weekendPrice) {
  if (!checkIn || !checkOut) return { weekdayNights: 0, weekendNights: 0, nights: 0, total: 0 };
  let weekdayNights = 0;
  let weekendNights = 0;
  const cur = new Date(checkIn);
  const end = new Date(checkOut);
  while (cur < end) {
    if (isWeekendDate(cur)) weekendNights += 1;
    else weekdayNights += 1;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  const nights = weekdayNights + weekendNights;
  const total = nights > 0 ? weekdayNights * weekdayPrice + weekendNights * weekendPrice : 0;
  return { weekdayNights, weekendNights, nights, total };
}
