// Khop dung logic backend/src/utils/text.util.js - dung de xem truoc ten chu
// tai khoan se duoc chuan hoa the nao TRUOC khi luu (khong dau, VIET HOA,
// dung dinh dang lien ngan hang that).
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function stripVietnameseDiacritics(str) {
  return str
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function normalizeBankAccountHolder(str) {
  return stripVietnameseDiacritics(str.trim())
    .replace(/\s+/g, ' ')
    .toUpperCase();
}
