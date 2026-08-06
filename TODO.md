# TODO — Booking Platform

Cập nhật lần cuối: 2026-08-06. Tick `[x]` khi xong, đừng xoá dòng đã làm — để lịch sử.

## Hạ tầng / setup

- [x] MySQL chạy qua Docker (`booking-platform-mysql`), migrate 8 bảng thành công
- [x] `backend/.env`, `frontend/.env` được tạo (còn thiếu `CLOUDINARY_*` thật, xem README)
- [x] `npm install` backend (dùng `--legacy-peer-deps` vì xung đột peer-dep có sẵn giữa `cloudinary`/`multer-storage-cloudinary`)
- [x] ESLint + Prettier config (`backend/.eslintrc.json`, `.prettierrc.json`, script `lint`/`format`)
- [x] `constants/roles.js`, `constants/userStatus.js` — bỏ chuỗi thô role/status rải rác trong code
- [x] `config/env.js` — validate `DATABASE_URL`/`JWT_SECRET` lúc khởi động, thiếu thì báo lỗi rõ thay vì lỗi ngầm
- [ ] Điền `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` thật (cần cho REQ_02)
- [ ] Cài đặt seed data mẫu (`prisma/seed.js` — script đã khai trong `package.json` nhưng file chưa tồn tại)

## Quyết định thiết kế đã chốt

- [x] Booking **không cần host duyệt** — `status` mặc định `approved` ngay khi tạo, chỉ cần lịch còn trống (đổi trong `schema.prisma`)
- [x] Guest đặt phòng không cần đăng nhập — tự tạo tài khoản `isGuest: true` với password random nếu email chưa tồn tại; nếu email đã có tài khoản thật thì từ chối (chặn chiếm tài khoản)

## REQ theo sprint

- [x] **REQ_01** — Đăng ký / đăng nhập, cấp JWT (`user`/`host`/`admin`)
  → `services/auth.service.js`, `controllers/auth.controller.js`, `routes/auth.routes.js`
- [x] **REQ_14** — Guest quick login (đặt phòng không cần đăng ký trước)
  → cùng file với REQ_01, hàm `guestLogin`
- [ ] **REQ_02** — Host tạo / sửa / xoá listing, upload ảnh qua Cloudinary
  → stub: `services/listing.service.js`, `controllers/listing.controller.js`, `routes/listing.routes.js`, middleware `upload.middleware.js` đã có sẵn
- [ ] **REQ_03** — Admin duyệt / đình chỉ listing (`pending` → `approved`/`suspended`)
  → stub: `controllers/admin.controller.js`, `routes/admin.routes.js`
- [ ] **REQ_04** — Admin quản lý user (khoá / mở khoá tài khoản)
  → stub: `controllers/admin.controller.js`, `routes/admin.routes.js`
- [ ] **REQ_05 / REQ_06** — Xem danh sách listing + chi tiết listing kèm lịch
  → stub: `routes/listing.routes.js`, `routes/calendar.routes.js`
- [ ] **REQ_07** — Khách gửi yêu cầu đặt phòng (tạo `booking`, auto-approved nếu lịch trống)
  → stub: `services/booking.service.js`, `controllers/booking.controller.js`, `routes/booking.routes.js`
- [ ] **REQ_09** — Chống trùng lịch: check `listing_calendar` trong `prisma.$transaction` ngay lúc tạo booking (đi kèm REQ_07, không phải route riêng)
- [ ] **REQ_10** — Giả lập thanh toán thành công cho booking
  → stub: `controllers/payment.controller.js`, `routes/payment.routes.js`
- [ ] **REQ_08** — Host huỷ (reject) một booking đã approved
  → stub: `routes/booking.routes.js` (route `reject`)
- [ ] **REQ_11** — Guest tự huỷ booking của mình
  → stub: `routes/booking.routes.js` (route `cancel`)
- [ ] **REQ_12** — Host tự block lịch thủ công (không qua booking)
  → stub: `routes/calendar.routes.js`

## Frontend

- [ ] Chưa bắt đầu — toàn bộ `components/`, `pages/` còn rỗng (chỉ có `.gitkeep`), `AuthContext.jsx`/`ProtectedRoute.jsx`/`services/*.js` vẫn là stub, chưa nối với API backend đã code ở trên
