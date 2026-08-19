-- Doi he thong payout tu kieu Viet Nam (chon ngan hang tu danh sach co dinh
-- bang bank_code) sang kieu UK (sort code + account number - khong co khai
-- niem "chon ngan hang tu danh sach", sort code da tu xac dinh dung ngan
-- hang/chi nhanh). Doi ten cot, giu nguyen kieu du lieu (VARCHAR(191) NULL) -
-- gia tri cu (neu co) la ma ngan hang VN, khong con dung duoc nua nen khong
-- can backfill/convert, host tu nhap lai sort code that.
ALTER TABLE `users` RENAME COLUMN `bank_code` TO `bank_sort_code`;
