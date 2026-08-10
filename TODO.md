# TODO — Booking Platform

Cập nhật lần cuối: 2026-08-10. Tick `[x]` khi xong, đừng xoá dòng đã làm — để lịch sử.

## Hạ tầng / setup

- [x] MySQL chạy qua Docker (`booking-platform-mysql`), migrate 8 bảng thành công
- [x] `backend/.env`, `frontend/.env` được tạo (còn thiếu `CLOUDINARY_*` thật, xem README)
- [x] `npm install` backend (dùng `--legacy-peer-deps` vì xung đột peer-dep có sẵn giữa `cloudinary`/`multer-storage-cloudinary`)
- [x] ESLint + Prettier config (`backend/.eslintrc.json`, `.prettierrc.json`, script `lint`/`format`)
- [x] Bỏ chuỗi thô role/status rải rác trong code — dùng thẳng enum sinh sẵn từ `@prisma/client` (`UserRole`, `UserStatus`, `ListingCategory`...), không tạo file `constants/` riêng vì trùng lặp
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
- [x] **REQ_02** — Host tạo / sửa / xoá listing, upload ảnh qua Cloudinary
  → `services/listing.service.js`, `controllers/listing.controller.js`, `routes/listing.routes.js`, `validators/listing.validator.js`. Đã test 401/403/422/404/409 + chặn xoá listing đã có booking. Upload chỉ thật sự gọi Cloudinary **sau khi** validate xong (multer dùng memory storage, không dùng CloudinaryStorage trực tiếp — tránh tốn 1 lần gọi Cloudinary cho request sai). Listing giờ có thêm `guestCapacity/bedrooms/beds/bathrooms` (bắt buộc) + `amenities` (enum cố định, bảng `listing_amenities`). Upload ảnh thật cần `CLOUDINARY_*` thật trong `.env` (còn placeholder)
- [ ] **REQ_03** — Admin duyệt / đình chỉ listing (`pending` → `approved`/`suspended`)
  → stub: `controllers/admin.controller.js`, `routes/admin.routes.js`
- [ ] **REQ_04** — Admin quản lý user (khoá / mở khoá tài khoản)
  → stub: `controllers/admin.controller.js`, `routes/admin.routes.js`
- [ ] **REQ_05 / REQ_06** — Xem danh sách listing + chi tiết listing kèm lịch (backend)
  → stub: `routes/listing.routes.js`, `routes/calendar.routes.js`. **FE đã build UI trước** (trang chủ + trang detail) bằng mock data — xem mục Frontend bên dưới. Khi làm backend, nhớ nối `frontend/src/data/mockListings.js` → gọi `listingService` thật, và bỏ mock file đi
- [ ] **REQ_07** — Khách gửi yêu cầu đặt phòng (tạo `booking`, auto-approved nếu lịch trống)
  → stub: `services/booking.service.js`, `controllers/booking.controller.js`, `routes/booking.routes.js`
- [ ] **REQ_09** — Chống trùng lịch: check `listing_calendar` trong `prisma.$transaction` ngay lúc tạo booking (đi kèm REQ_07, không phải route riêng)
- [ ] **REQ_10** — Giả lập thanh toán thành công cho booking
  → stub: `controllers/payment.controller.js`, `routes/payment.routes.js`
- [ ] **REQ_08** — Host huỷ (reject) một booking đã approved
  → stub: `routes/booking.routes.js` (route `reject`)
- [ ] **REQ_11** — Guest tự huỷ booking của mình
  → stub: `routes/booking.routes.js` (route `cancel`)
- [x] **REQ_12** — Host tự block lịch thủ công + xem lịch tháng + **đồng bộ 2 chiều iCal** (Airbnb/VRBO, mở rộng ngoài REQ gốc theo yêu cầu Jason)
  → `services/calendar.service.js`, `controllers/calendar.controller.js`, `routes/calendar.routes.js`, `validators/calendar.validator.js`. Dùng `node-ical` để parse `.ics`. Đã test end-to-end (API script + Playwright qua UI thật) bằng file `.ics` thật của Airbnb: `GET /:listingId` (lịch tháng), `POST /:listingId/block`, `POST /:listingId/unblock`, `PUT /:listingId/price`, `GET/POST /:listingId/sync`, `POST /:listingId/sync/:syncId/refresh`, `DELETE /:listingId/sync/:syncId`. **Lưu ý xử lý ngày**: `node-ical` trả `Date` cho field `VALUE=DATE` theo giờ local (không phải UTC) — server chạy `Asia/Ho_Chi_Minh`, nếu convert bằng `toISOString()` sẽ bị lệch lùi 1 ngày; phải đọc lại bằng getter local (`getFullYear/getMonth/getDate`), xem comment trong `calendar.service.js`. **Xung đột nguồn**: 1 ngày chỉ 1 dòng `listing_calendar` (`unique(listingId,date)`) — sync bỏ qua ngày nào đã có block tay/booking thật, ưu tiên dữ liệu tại chỗ. Thêm 2 field vào schema (`ListingCalendarSync.label`, `ListingCalendar.calendarSyncId`) + migration `add_calendar_sync_label_and_link`. Thêm route phụ trợ `GET /api/listings/mine` (host xem bài đăng của mình, cần để chọn listing thật cho trang lịch — trước đó chưa có route GET nào cho listings)
  → **Không có tên khách khi sync từ Airbnb thật** (chỉ có `SUMMARY: Reserved` + link đặt phòng + 4 số điện thoại cuối, không có tên) — ngày sync hiển thị nhãn chung "Đã đặt qua {label}" thay vì tên khách, phân biệt màu (indigo) với booking thật (teal/brand, cần REQ_07 mới có dữ liệu thật)

## Frontend

- [x] **Trang chủ guest** (`pages/user/Home.jsx`) — layout kiểu Airbnb (search pill trong header, tab category theo đúng `ListingCategory`, lưới listing card), màu thương hiệu riêng (teal, không phải màu Airbnb). Dùng `data/mockListings.js` (mock), chưa nối API thật
- [x] **Search pill hoạt động** (`SearchBar.jsx` + dropdown `LocationDropdown`/`DateRangePicker`/`GuestsDropdown`) — Địa điểm gõ để lọc gợi ý từ địa chỉ mock, Thời gian là lịch 2 tháng (tab "Ngày" chọn khoảng ngày, tab "Linh hoạt" chưa làm — chỉ có placeholder), Khách là bộ đếm. Bấm Tìm kiếm điều hướng `/?location=...&guests=...`, `Home.jsx` đọc query param và lọc `mockListings` qua `utils/filterListings.js` (địa điểm khớp `address`, khách so `guestCapacity`). **Chưa lọc được theo ngày** — mock listing không có dữ liệu lịch trống theo ngày, cần chờ REQ_05/06/09 (calendar thật) mới lọc được
- [x] **Trang chi tiết listing** (`pages/user/ListingDetail.jsx`, route `/listings/:id`) — gallery ảnh, thông tin host + sức chứa, mô tả, tiện nghi, booking widget sticky (chọn ngày/khách, tính giá tạm). **Không có phần đánh giá/reviews** — không có REQ, không có bảng DB, cố tình không làm giả. Nút "Đặt phòng" chỉ hiện toast tạm vì REQ_07 (API tạo booking) chưa có
- [x] SEO cho SPA (Vite, không SSR) — `react-helmet-async` set title/meta/OG/canonical/JSON-LD riêng từng trang, `index.html` có meta mặc định tốt (cho bot không chạy JS), `public/robots.txt` + `public/sitemap.xml` (sitemap đang tĩnh, cần sinh động khi có API listing thật)
- [x] **Trang quản lý Hôm nay của Host** (`pages/host/HostTodayPage.jsx`, route `/host/today` hoặc `/host`) — Giao diện chính chủ nhà khớp theo mẫu (Header dạng tab `Hôm nay`/`Lịch`/`Bài đăng` — loại bỏ mục `Tin nhắn`, thẻ thông báo Thuế, bộ chọn tab `Hôm nay`/`Sắp tới`, hình minh hoạ cuốn sổ + Trạng thái chưa có lượt đặt + nút hành động `Hoàn tất bài đăng của bạn`).
- [x] **Trang Tạo bài đăng mới (Wizard 6 bước chuẩn Airbnb)** (`pages/host/CreateListingPage.jsx`, route `/host/listings/new`) — Khớp theo ảnh mẫu `create.png` (Top header tối giản với nút "Bạn có thắc mắc?", "Lưu và thoát", Bước 1 chọn loại chỗ ở & số lượng phòng/giường/khách, Bước 2 nhập địa chỉ, Bước 3 chọn tiện nghi chính & nổi bật khớp giao diện `create.png`, Bước 4 upload ảnh, Bước 5 nhập tiêu đề/mô tả, Bước 6 giá phòng & tóm tắt; Thanh progress bar chân trang cố định với nút "Quay lại" / "Tiếp theo").
- [x] **Trang Quản lý Bài đăng & Modal tạo mới có Nhân hóa** (`pages/host/HostListingsPage.jsx`, route `/host/listings`) — Khớp theo ảnh `postPage.png` & `Screenshot 2026-08-10 145303.png` (Chuyển chế độ xem Lưới/Danh sách, nút Dấu cộng `+` bật Modal chào mừng nhân hóa `"Chào mừng [Tên] quay trở lại 👋"`, nút "Hoàn thiện bài đăng dở dang", nút "Tạo bài đăng mới" & "Tạo từ bài đăng hiện có" với hiệu ứng viền mượt mà).
- [x] **Trang Lịch cho thuê của Host** (`pages/host/HostCalendarPage.jsx`, route `/host/calendar`) — Theo yêu cầu của Jason: chọn bài đăng (danh sách thật từ `GET /listings/mine`), lưới lịch tháng hiển thị khách đã đặt / đồng bộ ngoài / giá theo ngày (ưu tiên override), click 1 ngày để mở modal toggle Còn trống/Đã chặn + sửa giá riêng ngày đó. **Đã nối API thật** (`services/calendarService.js`, react-query) — không còn mock. Phần "Kết nối lịch ngoài" hoạt động thật: dán link `.ics`, làm mới, ngắt kết nối

- [x] **Fix bug**: `RegisterPage.jsx` ("Đăng ký tài khoản Chủ nhà") không gửi `role: 'host'` lên backend → tài khoản luôn bị tạo với role mặc định `user`, phát hiện lúc test REQ_12 qua UI thật (route `/listings/mine` yêu cầu role host nên lộ ra ngay). Đã thêm `role: 'host'` vào payload gọi `registerApi`

- [ ] `AuthContext.jsx`, `ProtectedRoute.jsx`, `services/api.js`, `services/listingService.js`, `services/bookingService.js` — phần lớn vẫn là stub/mock (`AuthContext` mặc định giả lập host đã đăng nhập khi chưa có token thật), `authService.js` đã dùng thật (login/register/guestLogin), `calendarService.js` đã dùng thật (REQ_12)

- [ ] Domain thật — `SITE_URL` trong `Seo.jsx` và `index.html`/`robots.txt`/`sitemap.xml` đang để `https://example.com`, cần đổi khi có domain deploy thật


