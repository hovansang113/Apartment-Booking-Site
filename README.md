# ReserveSmith

Nền tảng đặt phòng lưu trú theo phong cách Airbnb — khách có thể duyệt và đặt phòng mà không cần tạo tài khoản, chủ nhà (host) quản lý bài đăng/lịch/đơn đặt phòng từ bảng điều khiển (dashboard), và thanh toán qua cổng Braintree với xác thực 3D Secure bắt buộc.

Trang web đang chạy tại: [reservesmith.com](https://reservesmith.com).

## Công nghệ sử dụng (Tech Stack)

| Tầng (Layer) | Công nghệ |
|---|---|
| Backend | Node.js, Express, Prisma ORM + MySQL, xác thực JWT (qua httpOnly cookies) |
| Thanh toán | Braintree (Drop-in UI, bắt buộc xác thực 3D Secure) |
| Hình ảnh | Lưu trữ ổ đĩa cục bộ — tự động resize về thumbnail/large và nén chuẩn AVIF khi tải lên (`sharp`), Nginx phục vụ trực tiếp |
| Email | Máy chủ Postfix tự lưu trữ + OpenDKIM (cấu hình chuẩn SPF/DKIM/DMARC), mẫu HTML qua `nodemailer` |
| Frontend | React 18, Vite, React Router, TanStack Query, React Hook Form, Tailwind CSS, i18next |
| Hạ tầng (Infra) | Docker Compose (MySQL + backend + nginx/frontend), chứng chỉ Let's Encrypt qua Certbot |

## Các tính năng đã hoàn thiện

- Khách có thể tìm kiếm, duyệt và đặt phòng mà không cần tạo tài khoản (hệ thống tự động tạo bản ghi khách vãng lai `is_guest: true` từ thông tin liên hệ khi thanh toán).
- Lịch hiển thị tình trạng phòng thời gian thực, ngăn chặn đặt trùng phòng nguyên tử ở tầng cơ sở dữ liệu (`prisma.$transaction`).
- Quy trình thanh toán Braintree bảo mật cao với bước xác thực thẻ 3D Secure bắt buộc.
- Tự động gửi email xác nhận đặt phòng chuẩn HTML cho cả khách và chủ nhà ngay khi thanh toán thành công.
- Bảng điều khiển cho chủ nhà: xem khách đến hôm nay/đơn sắp tới, CRUD bài đăng (thêm/xóa ảnh trực tiếp), lịch theo tháng (chặn/bỏ chặn ngày thủ công, ghi đè giá theo ngày, quy tắc số đêm tối thiểu/tối đa).
- Đồng bộ lịch 2 chiều qua iCal — nhập lịch từ các nền tảng ngoài (liên kết `.ics` từ Airbnb/VRBO) và xuất liên kết lịch của hệ thống để chủ nhà dán sang nền tảng khác.
- Giới hạn tần suất gọi API (Rate limiting) trên các endpoint xác thực, kiểm tra trạng thái khóa tài khoản trên từng request, chặn tấn công SSRF trên URL iCal do chủ nhà nhập, và các lớp bảo mật toàn diện khác.

## Cấu trúc dự án

```
reservesmith/
├── backend/
│   ├── src/
│   │   ├── config/        # Cấu hình Prisma client, mailer, Braintree gateway
│   │   ├── controllers/   # Controller theo từng tài nguyên (auth, listing, booking, payment, calendar, admin)
│   │   ├── routes/        # Router Express theo từng tài nguyên
│   │   ├── middlewares/   # Xác thực (JWT), phân quyền theo vai trò, rate limiting, upload ảnh, xử lý lỗi
│   │   ├── services/      # Logic nghiệp vụ chính — hành vi hệ thống được xử lý tại đây
│   │   └── utils/         # jwt, định dạng phản hồi, xử lý ảnh, kiểm tra URL an toàn chống SSRF
│   ├── prisma/
│   │   ├── schema.prisma  # Schema cơ sở dữ liệu
│   │   └── migrations/    # Lịch sử migration Prisma
│   └── scripts/           # Script bảo trì (ví dụ: chuyển đổi ảnh từ Cloudinary sang lưu trữ cục bộ)
└── frontend/
    ├── src/
    │   ├── pages/          # Các trang giao diện (người dùng, chủ nhà, admin, xác thực, đặt phòng)
    │   ├── components/     # Component dùng chung (icons, header/footer, thẻ listing, lịch, biểu mẫu)
    │   ├── context/        # AuthContext quản lý trạng thái đăng nhập
    │   ├── services/       # Các module gọi API theo từng tài nguyên
    │   └── locales/        # Tệp ngôn ngữ i18next
    └── nginx.conf          # Phục vụ SPA build, reverse-proxy /api, phục vụ trực tiếp /uploads
```

## Chạy dự án cục bộ (Local Development)

Yêu cầu: Docker (cho MySQL) và Node.js phiên bản 20 trở lên.

```bash
# 1. Khởi động MySQL
docker compose up -d mysql

# 2. Cài đặt và khởi chạy Backend
cd backend
npm install
cp .env.example .env        # Điền DATABASE_URL, JWT_SECRET, khóa Braintree sandbox, v.v.
npx prisma migrate dev
npm run dev                 # Chạy tại http://localhost:5000

# 3. Cài đặt và khởi chạy Frontend (mở terminal riêng)
cd frontend
npm install
cp .env.example .env
npm run dev                 # Chạy tại http://localhost:5173
```

## Triển khai (Deploy)

Xem tệp [`DEPLOY.md`](DEPLOY.md) để đọc hướng dẫn triển khai môi trường production hoàn chỉnh (Docker Compose, cấu hình Nginx/TLS, biến môi trường, thiết lập email Postfix, đăng ký webhook Braintree).

## Tài liệu tham khảo thêm

- [`REPORT.md`](REPORT.md) — Báo cáo tổng thể dự án & Đặc tả yêu cầu phần mềm (SRS)
- [`usecase.md`](usecase.md) — Đặc tả Use Case & Sơ đồ Use Case chi tiết
- [`DEPLOY.md`](DEPLOY.md) — Hướng dẫn triển khai production
- [`DATABASE.md`](DATABASE.md) — Cấu trúc cơ sở dữ liệu chi tiết
- [`FEATURES.md`](FEATURES.md) — Danh mục tính năng chi tiết
