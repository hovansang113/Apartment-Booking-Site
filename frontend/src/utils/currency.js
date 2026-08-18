// GBP la don vi tien te DUY NHAT (yeu cau Jason 18/8: web chi phuc vu UK, bo
// han VND). Gia luu trong DB (Listing.weekdayPrice/weekendPrice,
// Booking.totalPrice...) gio duoc HIEU la GBP that su, khong con la VND nua -
// khong can doi kieu du lieu (van la Decimal), chi doi don vi.
const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 2,
});

export function formatPrice(amount) {
  return gbpFormatter.format(Number(amount));
}
