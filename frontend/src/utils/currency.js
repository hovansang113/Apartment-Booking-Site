// Ty gia uoc luong CO DINH (khong goi API ty gia live - ngoai pham vi du an
// hoc tap nay) - chi de nguoi dung noi tieng Anh de hinh dung, KHONG thay the
// gia VND that (van la don vi giao dich that su). Can cap nhat tay dinh ky
// neu muon sat ty gia thuc te hon.
const VND_TO_GBP_RATE = 1 / 31000;

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

// Gia VND that luon hien du - khi xem ban EN, kem them uoc tinh GBP trong
// ngoac de de hinh dung (vd "1.800.000 ₫ (≈ £58)"). Khong dung khi xem ban VI.
export function formatPrice(amountVnd, language) {
  const vnd = vndFormatter.format(amountVnd);
  if (language !== 'en') return vnd;
  const gbp = gbpFormatter.format(Number(amountVnd) * VND_TO_GBP_RATE);
  return `${vnd} (≈ ${gbp})`;
}
