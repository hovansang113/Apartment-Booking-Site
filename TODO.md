# TODO — Booking Platform

Cập nhật lần cuối: 2026-08-13. Tick `[x]` khi xong, đừng xoá dòng đã làm — để lịch sử.

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
  → `services/auth.service.js`, `controllers/auth.controller.js`, `routes/auth.routes.js`. **Đổi sang cookie httpOnly** (10/8): JWT giờ set qua `res.cookie(...)` (`config/cookie.js`), không trả `token` trong response body nữa, không lưu `localStorage` phía FE nữa. `auth.middleware.js` đọc token từ cookie trước, vẫn fallback header `Authorization: Bearer` để tiện test curl/Postman. Thêm 2 route mới: `POST /auth/logout` (xoá cookie — bắt buộc gọi API vì JS không tự xoá được cookie httpOnly), `GET /auth/me` (FE hỏi server "đang đăng nhập ai" lúc load trang, thay cho đọc `localStorage`). FE: `api.js` bật `withCredentials: true`, `AuthContext.jsx` bỏ hẳn state `token`, gọi `getMe()` lúc mount thay vì đọc `localStorage`
  → **Fix bug logout**: `AuthContext.logout()` trước đây set `user` về lại `MOCK_HOST_USER` (user giả) thay vì `null` — nên bấm "Đăng xuất" không có tác dụng gì thấy được, phát hiện lúc anh test thật. Giờ logout xong `user = null` đúng nghĩa
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
  → **Đã có bản tối giản tạm thời** (13/8) `POST /api/bookings` — chỉ đủ để chứng minh REQ_09 chống trùng lịch hoạt động thật (test bằng đúng dữ liệu sync Airbnb thật). **Còn thiếu so với REQ_07 đầy đủ**: chưa hỗ trợ khách đặt không cần tài khoản (chưa nối REQ_14 `guestLogin`/tự tạo `isGuest` user), chưa dùng `pricing.service.js` để tính giá theo từng đêm (đang lấy `default_price` phẳng nhân số đêm, chưa nhìn `listing_price_overrides`), chưa có `contactPhone` nhập tay, chưa có `GET /bookings/mine`
- [x] **REQ_09** — Chống trùng lịch: check `listing_calendar` trong `prisma.$transaction` ngay lúc tạo booking (nằm trong `booking.service.js` ở trên, dùng chung transaction với REQ_07 tạm thời) — **đã test thật**: đặt trùng ngày vừa đặt → 409, đặt ngày đã chặn tay → 409, đặt ngày đang bị chặn bởi sync Airbnb thật → 409
- [ ] **REQ_10** — Giả lập thanh toán thành công cho booking
  → stub: `controllers/payment.controller.js`, `routes/payment.routes.js`
- [ ] **REQ_08** — Host huỷ (reject) một booking đã approved
  → stub: `routes/booking.routes.js` (route `reject`)
- [ ] **REQ_11** — Guest tự huỷ booking của mình
  → stub: `routes/booking.routes.js` (route `cancel`)
- [x] **REQ_12** — Host tự block lịch thủ công + xem lịch tháng + **đồng bộ 2 chiều iCal** (Airbnb/VRBO, mở rộng ngoài REQ gốc theo yêu cầu Jason)
  → `services/calendar.service.js`, `controllers/calendar.controller.js`, `routes/calendar.routes.js`, `validators/calendar.validator.js`. Dùng `node-ical` để parse `.ics`. Đã test end-to-end (API script + Playwright qua UI thật) bằng file `.ics` thật của Airbnb: `GET /:listingId` (lịch tháng), `POST /:listingId/block`, `POST /:listingId/unblock`, `PUT /:listingId/price`, `GET/POST /:listingId/sync`, `POST /:listingId/sync/:syncId/refresh`, `DELETE /:listingId/sync/:syncId`. **Lưu ý xử lý ngày**: `node-ical` trả `Date` cho field `VALUE=DATE` theo giờ local (không phải UTC) — server chạy `Asia/Ho_Chi_Minh`, nếu convert bằng `toISOString()` sẽ bị lệch lùi 1 ngày; phải đọc lại bằng getter local (`getFullYear/getMonth/getDate`), xem comment trong `calendar.service.js`. **Xung đột nguồn**: 1 ngày chỉ 1 dòng `listing_calendar` (`unique(listingId,date)`) — sync bỏ qua ngày nào đã có block tay/booking thật, ưu tiên dữ liệu tại chỗ. Thêm 2 field vào schema (`ListingCalendarSync.label`, `ListingCalendar.calendarSyncId`) + migration `add_calendar_sync_label_and_link`. Thêm route phụ trợ `GET /api/listings/mine` (host xem bài đăng của mình, cần để chọn listing thật cho trang lịch — trước đó chưa có route GET nào cho listings)
  → **Không có tên khách khi sync từ Airbnb thật** (chỉ có `SUMMARY: Reserved` + link đặt phòng + 4 số điện thoại cuối, không có tên) — ngày sync hiển thị nhãn chung "Đã đặt qua {label}" thay vì tên khách, phân biệt màu (indigo) với booking thật (teal/brand, cần REQ_07 mới có dữ liệu thật)
  → **Bổ sung sau khi đối chiếu lại đúng text ticket của Jason** (13/8): thêm nút **"Sửa"** cho từng lịch đã kết nối (`PUT /:listingId/sync/:syncId` — sửa label/URL rồi tự sync lại theo dữ liệu mới) — trước đó chỉ có Làm mới/Ngắt kết nối, thiếu đúng nút Edit trong ticket. Thêm **ô ghi chú (Notes)** khi chặn ngày trong `DayEditModal.jsx` — backend đã có sẵn cột `note` từ đầu nhưng chưa từng có UI nhập, sót đúng chữ "Add Notes" trong tên task gốc của Jason ("Calendar Management + Calendar Sync + Block Dates off **and Add Notes**")
  → **Đã làm nốt chiều xuất lịch (13/8)** — hoàn thiện "two-way" đúng ticket: `GET /:listingId/export.ics?t=<icalToken>` (public, KHÔNG cần đăng nhập — dùng `Listing.icalToken` riêng từng listing để bảo mật thay vì JWT, giống hệt kiểu link `.ics?t=...` của Airbnb thật). Gộp các ngày liên tiếp (bất kể nguồn: booking/manual/ical_sync) thành từng khoảng `VEVENT` thay vì 1 dòng/ngày. Đã test round-trip: xuất ra rồi tự parse ngược lại bằng `node-ical`, khớp chính xác. Thêm field `Listing.icalToken` (migrate tay vì Prisma không tự backfill UUID cho dòng cũ — xem `migrations/20260813110422_add_listing_ical_export_token`). FE: `HostCalendarPage.jsx` hiện link + nút Copy ngay trong mục "Kết nối lịch ngoài" (đúng bố cục "Bước 1" trong ticket)
  → **"Custom settings +" đã làm (13/8)** — số đêm tối thiểu/tối đa NẾU khách check-in đúng ngày đó (khớp hành vi min/max nights thật của Airbnb, chỉ áp dụng cho ngày check-in). Bảng mới `listing_stay_rules` (`ListingStayRule`, pattern giống hệt `ListingPriceOverride`), API `PUT /:listingId/stay-rule`. **Có enforce thật trong `booking.service.js`** (không chỉ hiển thị) — đặt ít/nhiều đêm hơn quy định từ ngày check-in đó sẽ bị từ chối 422, đã test qua API thật (đặt 2 đêm khi tối thiểu 3 → 422; đặt đúng 3 đêm → 201)

## Frontend

- [x] **Trang chủ guest** (`pages/user/Home.jsx`) — layout kiểu Airbnb (search pill trong header, tab category theo đúng `ListingCategory`, lưới listing card), màu thương hiệu riêng (teal, không phải màu Airbnb). Dùng `data/mockListings.js` (mock), chưa nối API thật
- [x] **Search pill hoạt động** (`SearchBar.jsx` + dropdown `LocationDropdown`/`DateRangePicker`/`GuestsDropdown`) — Địa điểm gõ để lọc gợi ý từ địa chỉ mock, Thời gian là lịch 2 tháng (tab "Ngày" chọn khoảng ngày, tab "Linh hoạt" chưa làm — chỉ có placeholder), Khách là bộ đếm. Bấm Tìm kiếm điều hướng `/?location=...&guests=...`, `Home.jsx` đọc query param và lọc `mockListings` qua `utils/filterListings.js` (địa điểm khớp `address`, khách so `guestCapacity`). **Chưa lọc được theo ngày** — mock listing không có dữ liệu lịch trống theo ngày, cần chờ REQ_05/06/09 (calendar thật) mới lọc được
- [x] **Trang chi tiết listing** (`pages/user/ListingDetail.jsx`, route `/listings/:id`) — gallery ảnh, thông tin host + sức chứa, mô tả, tiện nghi, booking widget sticky (chọn ngày/khách, tính giá tạm). **Không có phần đánh giá/reviews** — không có REQ, không có bảng DB, cố tình không làm giả. Nút "Đặt phòng" chỉ hiện toast tạm vì REQ_07 (API tạo booking) chưa có
- [x] SEO cho SPA (Vite, không SSR) — `react-helmet-async` set title/meta/OG/canonical/JSON-LD riêng từng trang, `index.html` có meta mặc định tốt (cho bot không chạy JS), `public/robots.txt` + `public/sitemap.xml` (sitemap đang tĩnh, cần sinh động khi có API listing thật)
- [x] **Trang quản lý Hôm nay của Host** (`pages/host/HostTodayPage.jsx`, route `/host/today` hoặc `/host`) — Giao diện chính chủ nhà khớp theo mẫu (Header dạng tab `Hôm nay`/`Lịch`/`Bài đăng` — loại bỏ mục `Tin nhắn`, thẻ thông báo Thuế, bộ chọn tab `Hôm nay`/`Sắp tới`, hình minh hoạ cuốn sổ + Trạng thái chưa có lượt đặt + nút hành động `Hoàn tất bài đăng của bạn`).
- [x] **Trang Tạo bài đăng mới (Wizard 6 bước chuẩn Airbnb)** (`pages/host/CreateListingPage.jsx`, route `/host/listings/new`) — Khớp theo ảnh mẫu `create.png` (Top header tối giản với nút "Bạn có thắc mắc?", "Lưu và thoát", Bước 1 chọn loại chỗ ở & số lượng phòng/giường/khách, Bước 2 nhập địa chỉ, Bước 3 chọn tiện nghi chính & nổi bật khớp giao diện `create.png`, Bước 4 upload ảnh, Bước 5 nhập tiêu đề/mô tả, Bước 6 giá phòng & tóm tắt; Thanh progress bar chân trang cố định với nút "Quay lại" / "Tiếp theo").
- [x] **Trang Quản lý Bài đăng & Modal tạo mới có Nhân hóa** (`pages/host/HostListingsPage.jsx`, route `/host/listings`) — Khớp theo ảnh `postPage.png` & `Screenshot 2026-08-10 145303.png` (Chuyển chế độ xem Lưới/Danh sách, nút Dấu cộng `+` bật Modal chào mừng nhân hóa `"Chào mừng [Tên] quay trở lại 👋"`, nút "Hoàn thiện bài đăng dở dang", nút "Tạo bài đăng mới" & "Tạo từ bài đăng hiện có" với hiệu ứng viền mượt mà).
- [x] **Trang Lịch cho thuê của Host** (`pages/host/HostCalendarPage.jsx`, route `/host/calendar`) — Theo yêu cầu của Jason: chọn bài đăng (danh sách thật từ `GET /listings/mine`), lưới lịch tháng hiển thị khách đã đặt / đồng bộ ngoài / giá theo ngày (ưu tiên override), click 1 ngày để mở modal toggle Còn trống/Đã chặn + sửa giá riêng ngày đó. **Đã nối API thật** (`services/calendarService.js`, react-query) — không còn mock. Phần "Kết nối lịch ngoài" hoạt động thật: dán link `.ics`, làm mới, ngắt kết nối
  → **Đổi UI ngày đã đặt/chặn thành THANH kéo dài (bar) qua nhiều ô** (13/8) — khớp đúng kiểu hiển thị trong ảnh ticket gốc của Jason ("Bianca + 2" kéo dài qua nhiều ngày), thay vì lặp lại chữ trong từng ô riêng lẻ như trước. `HostMonthGrid.jsx` viết lại: mỗi tuần là 1 cặp grid độc lập (grid ô ngày + grid overlay thanh bar cùng cấu trúc cột để tự khớp) — tránh được lỗi CSS Grid khi trộn item auto-place với item đặt vị trí tuyệt đối trong cùng 1 grid (đã gặp và sửa lúc build). Test bằng dữ liệu thật: block gộp nhiều ngày liên tiếp thành 1 thanh, booking 3 đêm gộp thành 1 thanh — khớp đúng dữ liệu DB

- [x] **Fix bug**: `RegisterPage.jsx` ("Đăng ký tài khoản Chủ nhà") không gửi `role: 'host'` lên backend → tài khoản luôn bị tạo với role mặc định `user`, phát hiện lúc test REQ_12 qua UI thật (route `/listings/mine` yêu cầu role host nên lộ ra ngay). Đã thêm `role: 'host'` vào payload gọi `registerApi`

- [ ] `ProtectedRoute.jsx`, `services/listingService.js` — vẫn là stub/mock (`AuthContext.jsx` vẫn giữ hành vi giả lập host đã đăng nhập khi chưa có session thật — quyết định cũ, chưa đổi). `authService.js`, `calendarService.js`, `bookingService.js` (bản tối giản REQ_07 tạm thời) đã dùng API thật

- [ ] Domain thật — `SITE_URL` trong `Seo.jsx` và `index.html`/`robots.txt`/`sitemap.xml` đang để `https://example.com`, cần đổi khi có domain deploy thật


