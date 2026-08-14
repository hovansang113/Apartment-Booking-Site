// Chuan hoa ten chu tai khoan ngan hang theo dung chuan lien ngan hang VN:
// KHONG dau, VIET HOA, khong khoang trang thua. He thong chuyen khoan lien
// ngan hang (Napas) va hau het ngan hang thuong mai chi chap nhan ten dang
// nay - nhap co dau se bi tu choi luc chuyen khoan that.
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

function stripVietnameseDiacritics(str) {
  return str
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/đ/g, 'd') // đ
    .replace(/Đ/g, 'D'); // Đ
}

function normalizeBankAccountHolder(str) {
  return stripVietnameseDiacritics(str.trim())
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

module.exports = { stripVietnameseDiacritics, normalizeBankAccountHolder };
