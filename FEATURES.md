# FEATURES.md — ReserveSmith

Danh sách toàn bộ chức năng từ nhỏ đến lớn.

---

## 1. Utilities & Helpers

- Format giá tiền GBP (`formatPrice`)
- Format khoảng ngày check-in/out (`formatDateRange`)
- Tính giá theo ngày thường/cuối tuần (`getBasePrice`, `isWeekendDate`)
- Tính breakdown đêm ở (`nightlyBreakdown` — weekday nights, weekend nights, tổng)
- Sinh mã đặt phòng 8 ký tự hex (`generateBookingCode`)
- Escape HTML trong email (`escapeHtml`)
- Kiểm tra SSRF cho URL iCal do host nhập (`assertPublicHttpUrl`)
- Xử lý ảnh upload: resize → thumbnail 480px + large 1600px, encode AVIF (`processAndSaveListingImage`)
- Ký/xác minh JWT (`signToken`, `verifyToken`)
- Gộp ngày liên tiếp thành ranges (`buildBookedRanges`, `groupConsecutiveDates`)

---

## 2. Xác Thực & Phân Quyền

- Đăng ký tài khoản host
- Đăng nhập (host/admin) — JWT qua httpOnly cookie
- Đăng xuất — server xóa cookie
- Kiểm tra phiên đăng nhập (`GET /auth/me`)
- Tạo tài khoản guest tự động khi đặt phòng (`findOrCreateGuestUser`)
- Guest login nhanh (không cần mật khẩu)
- Middleware xác thực JWT + kiểm tra trạng thái tài khoản mỗi request
- Middleware phân quyền theo role (admin/host/user)
- Rate limiting trên endpoint đăng nhập & đăng ký

---

## 3. Chức Năng Khách (Không Cần Đăng Nhập)

- Xem danh sách listing đã duyệt (phân trang, lọc theo category)
- Tìm kiếm & lọc listing (category, số khách, khoảng giá, ngày trống)
- Xem chi tiết listing: ảnh gallery, tiện nghi, mô tả, sức chứa
- Lịch xem ngày trống tương tác (2 tháng song song, highlight check-in/out, disable ngày đã đặt)
- Validate min/max nights trực tiếp trên lịch (disable ngày vi phạm, hiện tooltip)
- Chọn số lượng khách (người lớn + trẻ em, giới hạn theo sức chứa)
- Xem trước giá (breakdown ngày thường/cuối tuần + phí dọn dẹp)
- Trang checkout: nhập thông tin liên hệ (tên, email, phone, địa chỉ, thành phố, postcode)
- Tạo booking `pending_payment` + chặn lịch ngay (atomic transaction, chống đặt trùng)
- Trang thanh toán: Braintree Drop-in UI nhúng trực tiếp
- Xác thực 3D Secure bắt buộc
- Thanh toán thật qua `gateway.transaction.sale()`
- Đếm ngược 15 phút giữ chỗ
- Hiển thị kết quả thanh toán thành công/thất bại ngay trên trang
- Thử lại khi thanh toán thất bại (teardown + tạo lại Drop-in, nonce mới)

---

## 4. Email Tự Động

- Email xác nhận đặt phòng gửi khách (HTML, ảnh listing, mã code, breakdown giá)
- Email thông báo booking mới gửi host (thông tin khách, breakdown payout)
- Gửi fire-and-forget, không block response thanh toán

---

## 5. Chức Năng Host (Dashboard Đăng Nhập)

### 5.1 Quản Lý Listing

- Tạo listing mới — wizard 6 bước (loại phòng → địa chỉ → tiện nghi → ảnh → tiêu đề/mô tả → giá)
- Đặt giá ngày thường/cuối tuần, phí dọn dẹp, min/max nights mặc định
- Chỉnh sửa listing (form đơn: text, giá, tiện nghi, sức chứa, category)
- Thêm ảnh vào listing đã có
- Xóa ảnh riêng lẻ
- Xóa listing (chặn nếu đã có booking)
- Xem danh sách listing của mình (grid view / list view, badge trạng thái)

### 5.2 Quản Lý Lịch

- Xem lịch tháng: từng ngày hiển thị giá + trạng thái + tên khách
- Thanh màu kéo dài qua nhiều ngày cho booking/block liên tiếp
- Chặn ngày thủ công (1 ngày hoặc nhiều ngày cùng lúc)
- Bỏ chặn ngày thủ công
- Ghi đè giá cho ngày cụ thể
- Đặt min/max nights cho ngày check-in cụ thể (per-day stay rule)
- Chọn nhiều ngày cùng lúc (multi-select mode) để block/unblock hàng loạt
- Xem chi tiết booking khi click vào thanh booking trên lịch

### 5.3 Đồng Bộ iCal

- Kết nối lịch ngoài (Airbnb/VRBO) qua URL `.ics` — sync lần đầu ngay khi kết nối
- Refresh sync thủ công
- Sửa tên hiển thị / URL của nguồn sync
- Ngắt kết nối nguồn sync
- Xuất lịch `.ics` của listing (link riêng bảo mật bằng `icalToken`)

### 5.4 Dashboard Booking

- Xem khách đang ở hôm nay (tab Today)
- Xem đặt phòng sắp tới (tab Upcoming)
- Xem chi tiết booking: ngày, số khách, tổng tiền, mã code, nút email khách

### 5.5 Hồ Sơ & Payout

- Nộp thông tin thuế/pháp lý (tên pháp lý, mã số thuế, loại đối tượng, CCCD)
- Khai báo tài khoản ngân hàng UK (sort code + số tài khoản + tên chủ tài khoản)

---

## 6. Chức Năng Admin (Dashboard Đăng Nhập)

- Xem danh sách listing theo trạng thái (pending/approved/suspended)
- Duyệt listing
- Đình chỉ listing (kèm lý do)
- Xem danh sách tất cả người dùng
- Khóa tài khoản (kèm lý do)
- Mở khóa tài khoản
- Xem hồ sơ thuế/giấy tờ host chờ xác minh
- Xác minh hồ sơ host
- Từ chối hồ sơ host (kèm ghi chú)

---

## 7. Hệ Thống & Hạ Tầng

- Webhook Braintree: xử lý `transaction_settled` / `transaction_settlement_declined`
- Xác minh URL webhook Braintree (GET challenge)
- Serve ảnh tĩnh qua nginx (`/uploads/...`)
- SEO: `robots.txt`, `sitemap.xml`, JSON-LD schema cho listing
- Docker Compose: MySQL + backend + nginx/frontend
- TLS tự động qua certbot/Let's Encrypt
- i18n (hiện chỉ có `en.json`)
