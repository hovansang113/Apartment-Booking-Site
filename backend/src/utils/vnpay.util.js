const crypto = require('crypto');

// Chuan ky VNPay (giong het cach hau het tich hop Node.js thuc te lam, xem
// tai lieu sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html):
// 1. Sap xep tham so tang dan theo TEN key (khong tinh vnp_SecureHash/
//    vnp_SecureHashType)
// 2. Voi moi value: encodeURIComponent roi thay `%20` bang `+` (dung chuan
//    application/x-www-form-urlencoded, KHONG phai encodeURIComponent thuan
//    - day la loi thuong gap nhat khi tich hop, sai encode khoang trang la
//    chu ky sai hoan toan)
// 3. Noi thanh chuoi `key1=value1&key2=value2...`
// 4. HMAC-SHA512 chuoi do bang vnp_HashSecret, xuat hex

// Sap xep + encode 1 lan, dung chung cho ca luc tao URL (query string) va
// luc ky (sign data) - VNPay dung CHINH XAC 1 cong thuc cho ca 2 viec nay.
function sortAndEncodeParams(params) {
  const sortedKeys = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort();
  const encoded = {};
  for (const key of sortedKeys) {
    encoded[key] = encodeURIComponent(String(params[key])).replace(/%20/g, '+');
  }
  return encoded;
}

function toQueryString(sortedEncodedParams) {
  return Object.entries(sortedEncodedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

// Ky 1 bo tham so (khong bao gom vnp_SecureHash) bang HMAC-SHA512.
function signVnpayParams(params, hashSecret) {
  const sorted = sortAndEncodeParams(params);
  const signData = toQueryString(sorted);
  return crypto.createHmac('sha512', hashSecret).update(Buffer.from(signData, 'utf-8')).digest('hex');
}

// yyyyMMddHHmmss theo gio VN (GMT+7) - dung cho vnp_CreateDate/vnp_ExpireDate.
// Server co the chay o timezone khac (VD may CI chay UTC), nen tinh tay bang
// offset thay vi dua vao timezone he thong.
function formatVnpayDate(date) {
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${vnTime.getUTCFullYear()}${pad(vnTime.getUTCMonth() + 1)}${pad(vnTime.getUTCDate())}` +
    `${pad(vnTime.getUTCHours())}${pad(vnTime.getUTCMinutes())}${pad(vnTime.getUTCSeconds())}`
  );
}

// Xac minh chu ky tren bo tham so VNPay tra ve (IPN hoac return URL). Bo
// vnp_SecureHash/vnp_SecureHashType ra truoc khi ky lai - dung CHINH XAC cong
// thuc voi luc tao URL (sortAndEncodeParams + HMAC-SHA512), roi so sanh voi
// vnp_SecureHash nhan duoc.
function verifySignature(params, hashSecret) {
  const { vnp_SecureHash: receivedHash } = params;
  if (!receivedHash) return false;
  const rest = { ...params };
  delete rest.vnp_SecureHash;
  delete rest.vnp_SecureHashType;
  const expectedHash = signVnpayParams(rest, hashSecret);
  return expectedHash.toLowerCase() === String(receivedHash).toLowerCase();
}

module.exports = { sortAndEncodeParams, toQueryString, signVnpayParams, formatVnpayDate, verifySignature };
