-- REQ moi (19/8, theo yeu cau Jason): phi don dep co dinh, tuy host tu dat
-- theo tung tin dang (khop cach weekday_price/weekend_price da lam - moi cho
-- o co muc phi don khac nhau tuy dien tich). Cong 1 lan/booking, khong nhan
-- theo so dem - xem thay doi trong booking.service.js#createBooking. Cot moi
-- hoan toan, khong co du lieu cu can backfill nen mac dinh 0 la du.
ALTER TABLE `listings` ADD COLUMN `cleaning_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- Luu snapshot phi don dep TAI THOI DIEM dat phong (giong cach commission_rate
-- da luu san tren Booking thay vi tinh lai tu Listing) - de neu host doi phi
-- sau nay, booking cu van hien dung so tien thuc te da tinh luc dat.
ALTER TABLE `bookings` ADD COLUMN `cleaning_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0;
