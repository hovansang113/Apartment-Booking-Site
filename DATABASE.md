# Database — Booking Platform

MySQL, quản lý qua Prisma (`backend/prisma/schema.prisma`). Toàn bộ 8 bảng bên dưới đã được migrate thật (`npx prisma migrate dev`) vào database `booking_platform`.

## Enum dùng chung

| Enum | Giá trị | Dùng ở đâu |
|---|---|---|
| `UserRole` | `admin`, `host`, `user` | `users.role` — phân quyền qua `authorize()` middleware |
| `UserStatus` | `active`, `locked` | `users.status` — admin khoá tài khoản (REQ_04) |
| `ListingStatus` | `pending`, `approved`, `suspended` | `listings.status` — admin duyệt tin đăng (REQ_03) |
| `BookingStatus` | `pending`, `approved`, `rejected`, `canceled` | `bookings.status` — mặc định `approved` (đặt phòng không cần chờ duyệt), `rejected`/`canceled` dùng khi host/guest huỷ sau |
| `CalendarDayStatus` | `blocked`, `booked` | `listing_calendar.status` — 1 ngày trên lịch đang bị chặn thủ công hay đã có booking |
| `CalendarDaySource` | `manual`, `ical_sync`, `booking` | `listing_calendar.source` — ngày đó bị chiếm do host tự block, đồng bộ iCal ngoài, hay do có booking |
| `PaymentStatus` | `simulated_success` | `payments.status` — chỉ có 1 giá trị vì thanh toán là giả lập (REQ_10), không tích hợp cổng thanh toán thật |

---

## 1. `users`

**Làm gì:** lưu mọi loại tài khoản trong hệ thống — admin, host, user đăng ký thật, và cả guest tự động tạo khi đặt phòng không đăng nhập (REQ_14).

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | uuid, PK | |
| `email` | unique | dùng để đăng nhập, cũng là khoá để nhận diện guest cũ quay lại |
| `password_hash` | nullable | bcrypt hash; nullable về mặt schema nhưng guest vẫn có 1 password random ẩn để hệ thống nhất quán |
| `full_name` | | |
| `phone` | nullable | |
| `role` | enum, default `user` | `admin` không tự đăng ký được, chỉ seed tay |
| `status` | enum, default `active` | admin set `locked` để khoá tài khoản (REQ_04) |
| `is_guest` | boolean, default `false` | `true` = tài khoản được hệ thống tự tạo khi khách đặt phòng không đăng nhập, không phải user tự đăng ký |
| `created_at` / `updated_at` | | |

**Quan hệ:** 1 user có nhiều `listings` (nếu là host) và nhiều `bookings` (nếu là guest/user đặt phòng).

---

## 2. `listings`

**Làm gì:** tin đăng cho thuê do host tạo (REQ_02), phải được admin duyệt (REQ_03) mới hiển thị công khai.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | uuid, PK | |
| `host_id` | FK → `users.id` | chủ tin đăng |
| `title`, `description`, `category`, `address` | | |
| `latitude`, `longitude` | decimal | toạ độ để hiển thị bản đồ |
| `default_price` | decimal(12,2) | giá mặc định/đêm, có thể bị override theo ngày (xem `listing_price_overrides`) |
| `status` | enum, default `pending` | admin duyệt (`approved`) hoặc đình chỉ (`suspended`) |
| `suspend_reason` | nullable text | lý do admin đình chỉ tin, hiển thị cho host |
| `created_at` / `updated_at` | | |

**Quan hệ:** 1 listing có nhiều `listing_images`, nhiều `listing_price_overrides`, nhiều `listing_calendar` (ngày bị chặn/đã đặt), nhiều `listing_calendar_sync` (nguồn đồng bộ iCal), nhiều `bookings`.

**Index:** `host_id`, `status` — phục vụ query "tin của tôi" và "tin đang chờ duyệt".

---

## 3. `listing_images`

**Làm gì:** ảnh của tin đăng, upload qua Cloudinary (REQ_02).

| Cột | Ý nghĩa |
|---|---|
| `listing_id` | FK → `listings.id` |
| `image_url` | URL Cloudinary trả về |
| `sort_order` | thứ tự hiển thị ảnh (ảnh đại diện = 0) |

---

## 4. `listing_price_overrides`

**Làm gì:** override giá theo ngày cụ thể (vd cuối tuần, lễ Tết đắt hơn `default_price`).

| Cột | Ý nghĩa |
|---|---|
| `listing_id` + `date` | unique — mỗi ngày chỉ có 1 giá override |
| `price` | giá áp dụng riêng cho ngày đó |

**Dùng khi tính tổng tiền booking:** với mỗi ngày trong khoảng `check_in`–`check_out`, ưu tiên lấy giá ở đây, không có thì lấy `listings.default_price`.

---

## 5. `bookings`

**Làm gì:** yêu cầu đặt phòng (REQ_07). **Mặc định `status = approved` ngay khi tạo** — khách không cần chờ host duyệt, chỉ cần lịch còn trống.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | uuid, PK | |
| `listing_id` | FK → `listings.id` | |
| `guest_id` | FK → `users.id` | người đặt — có thể là user thật hoặc guest tự tạo (REQ_14) |
| `check_in` / `check_out` | date | khoảng ngày đặt |
| `total_price` | decimal | tính từ `default_price` + `listing_price_overrides` theo từng ngày |
| `status` | enum, default `approved` | `rejected` = host huỷ sau khi đã confirm (REQ_08); `canceled` = guest tự huỷ (REQ_11); `pending` gần như không còn dùng tới trong flow hiện tại, giữ lại trong enum phòng trường hợp cần mở rộng |
| `contact_name/email/phone` | | thông tin liên hệ tại thời điểm đặt — lưu riêng, không phải lúc nào cũng trùng với `users` nếu sau này user đổi thông tin |
| `rejected_reason` | nullable text | lý do host từ chối/huỷ |
| `approved_at` | nullable | set ngay lúc tạo vì auto-approve |
| `canceled_at` | nullable | set khi guest huỷ |

**Quan hệ:** có nhiều `listing_calendar` (mỗi ngày trong khoảng đặt tương ứng 1 dòng `status: booked`), có 1 `payments` (thanh toán giả lập, REQ_10).

**Business rule quan trọng (REQ_09 — chống trùng lịch):** vì booking auto-approve ngay lúc tạo, bước kiểm tra "còn trống hay không" phải nằm trong `prisma.$transaction` **tại thời điểm tạo booking**, không phải lúc duyệt như thiết kế cũ — tránh race condition khi 2 người đặt cùng lúc cùng 1 ngày.

---

## 6. `listing_calendar`

**Làm gì:** nguồn sự thật duy nhất cho "ngày nào của listing này còn trống hay không" — mỗi dòng là 1 (`listing_id`, `date`) unique.

| Cột | Ý nghĩa |
|---|---|
| `status` | `blocked` (host tự chặn tay) hoặc `booked` (đã có người đặt) |
| `source` | `manual` (REQ_12 — host block tay), `ical_sync` (đồng bộ từ lịch ngoài), `booking` (tự sinh ra khi có booking) |
| `booking_id` | nullable FK → `bookings.id` — chỉ có giá trị khi `source = booking`; xoá booking thì set `NULL` (`onDelete: SetNull`), không xoá luôn dòng lịch |
| `note` | ghi chú của host khi block tay |

**Cách check "còn trống":** với mỗi ngày trong khoảng `check_in`–`check_out` của booking mới, không được tồn tại dòng nào trong bảng này trùng `listing_id` + `date`.

---

## 7. `listing_calendar_sync`

**Làm gì:** cấu hình đồng bộ lịch 2 chiều với nguồn ngoài (Airbnb/Booking.com...) qua iCal URL.

| Cột | Ý nghĩa |
|---|---|
| `ical_url` | link `.ics` host nhập vào |
| `last_synced_at` | lần đồng bộ gần nhất, dùng để biết có cần fetch lại không |

---

## 8. `payments`

**Làm gì:** ghi nhận thanh toán cho 1 booking. Vì đồ án không tích hợp cổng thanh toán thật, mọi thanh toán tạo ra đều `status: simulated_success` (REQ_10 — giả lập thanh toán thành công ngay).

| Cột | Ý nghĩa |
|---|---|
| `booking_id` | unique FK → `bookings.id` — 1 booking chỉ có tối đa 1 payment |
| `amount` | số tiền, thường = `bookings.total_price` |
| `confirmed_at` | thời điểm "thanh toán" thành công |
