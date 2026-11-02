
```

### Chạy dự án trên máy mới (Local Development)

Phần này dành cho người nhận bàn giao dự án. Làm theo đúng thứ tự là có thể
chạy được cả backend và frontend ở máy local.

### Yêu cầu

- **Node.js 20 trở lên** (khuyến nghị 20 hoặc 22 LTS) và npm đi kèm
- **MySQL 8** hoặc **MariaDB 10.4+** (Docker, XAMPP hoặc cài trực tiếp)
- **Git** nếu lấy source từ repository

Kiểm tra phiên bản:

```bash
node -v
npm -v
git --version
```

> Không copy thư mục `node_modules`, `dist` hoặc file `.env` từ máy cũ sang.
> Chỉ cần source code; các thư mục/file này sẽ được tạo lại ở máy mới.

### 1. Lấy source code

Clone từ Git:

```bash
git clone <URL_REPOSITORY> booking-platform
cd booking-platform
```

Hoặc giải nén file nén rồi mở terminal tại thư mục gốc dự án (nơi có
`README.md`, `docker-compose.yml`, thư mục `backend/` và `frontend/`).

### 2. Chuẩn bị MySQL

Chọn **một** trong hai cách dưới đây.

#### Cách A — Dùng Docker (khuyến nghị nếu đã có Docker)

1. Tạo file `.env` ở thư mục gốc từ file mẫu:

   ```bash
   cp .env.example .env
   ```

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Mở `.env`, đặt mật khẩu MySQL:

   ```env
   MYSQL_ROOT_PASSWORD=mat_khau_mysql_cua_ban
   SITE_URL=http://localhost
   ```

3. Khởi động riêng MySQL:

   ```bash
   docker compose up -d mysql
   docker compose ps
   ```

   Cột `STATUS` phải là `Up` hoặc `healthy`. Database `booking_platform`
   được tạo tự động bởi Docker Compose.

> Nếu cổng `3306` đang bị chiếm bởi MySQL/XAMPP khác, hãy tắt MySQL đó trước
> hoặc đổi cổng trong `docker-compose.yml`.

#### Cách B — Dùng XAMPP / MySQL cài sẵn

1. Mở **XAMPP Control Panel** → bấm **Start** ở dòng MySQL.
2. Tạo database:

   ```sql
   CREATE DATABASE IF NOT EXISTS booking_platform
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   ```

   Bằng dòng lệnh (XAMPP trên Windows):

   ```powershell
   & "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS booking_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

3. Nếu MySQL root có mật khẩu, ghi nhớ mật khẩu để điền vào bước sau.
   Mặc định XAMPP thường là root **không có mật khẩu**.

### 3. Cấu hình và chạy Backend

```bash
cd backend
npm ci
cp .env.example .env
```

Windows PowerShell:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Mở `backend/.env` và sửa các giá trị sau:

```env
PORT=5000
NODE_ENV=development

# Nếu dùng Docker MySQL:
DATABASE_URL="mysql://root:mat_khau_mysql_cua_ban@localhost:3306/booking_platform"

# Nếu dùng XAMPP root không mật khẩu:
# DATABASE_URL="mysql://root@localhost:3306/booking_platform"

JWT_SECRET=thay_bang_chuoi_bi_mat_that_dai_va_ngau_nhien
JWT_EXPIRES_IN=1d

CLIENT_URL=http://localhost:5173

BRAINTREE_ENVIRONMENT=sandbox
BRAINTREE_MERCHANT_ID=your_sandbox_merchant_id
BRAINTREE_PUBLIC_KEY=your_sandbox_public_key
BRAINTREE_PRIVATE_KEY=your_sandbox_private_key

SMTP_HOST=localhost
SMTP_PORT=25
SMTP_FROM_EMAIL=bookings@example.com

SEO_ALLOW_INDEXING=false
```

Ghi chú:

- `DATABASE_URL` phải khớp mật khẩu MySQL ở bước 2.
- Tạo `JWT_SECRET` bằng:

  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

- Braintree: đăng ký tài khoản **Sandbox** riêng tại
  <https://sandbox.braintreegateway.com>, lấy 3 khóa trong
  **Settings → API Keys**. Không dùng khóa production khi chạy local.
- `SMTP_*`: nếu máy không có mail server, hệ thống vẫn chạy bình thường;
  chỉ phần gửi email xác nhận booking báo lỗi trong log.
- Không commit file `backend/.env` lên Git.

Sau khi điền `.env`, chạy:

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed:admin
npm run dev
```

Backend chạy tại <http://localhost:5000>.

### 4. Tạo tài khoản admin

Lệnh `npm run seed:admin` tạo tài khoản admin mặc định:

- Email: `admin@reservesmith.com`
- Mật khẩu: `Admin@123`

Có thể đổi thông tin ngay khi tạo bằng biến môi trường.

macOS/Linux:

```bash
ADMIN_EMAIL=admin@your-domain.com \
ADMIN_PASSWORD='MatKhauManh123!' \
ADMIN_NAME='Quản trị viên' \
npm run seed:admin
```

Windows PowerShell:

```powershell
$env:ADMIN_EMAIL="admin@your-domain.com"
$env:ADMIN_PASSWORD="MatKhauManh123!"
$env:ADMIN_NAME="Quản trị viên"
npm run seed:admin
Remove-Item Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD, Env:ADMIN_NAME
```

> Đổi mật khẩu admin mặc định trước khi đưa lên môi trường thật. Script có
> tính idempotent: nếu email đã tồn tại, script chỉ thông báo và không tạo trùng.

### 5. Cấu hình và chạy Frontend

Mở **terminal thứ hai** tại thư mục gốc dự án:

```bash
cd frontend
npm ci
cp .env.example .env
```

Windows PowerShell:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
```

Mở `frontend/.env` và giữ/đổi cho đúng:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SITE_URL=http://localhost:5173
```

Sau đó chạy:

```bash
npm run dev
```

Frontend chạy tại <http://localhost:5173>. Backend và frontend phải chạy
**cùng lúc** ở hai terminal riêng.

### 6. Kiểm tra dự án đã chạy đúng

Backend:

```bash
curl http://localhost:5000/health
```

Kết quả mong đợi:

```json
{"status":"ok"}
```

Mở <http://localhost:5173>, trang chủ phải hiển thị bình thường. Đăng nhập
admin tại <http://localhost:5173/auth/login>; vào được khu vực `/admin` là đạt.

Kiểm tra build production:

```bash
cd frontend
npm run build
```

Nếu thành công, thư mục `frontend/dist/` sẽ được tạo lại.

### 7. Lỗi thường gặp

| Lỗi | Nguyên nhân / cách xử lý |
|---|---|
| `P1001: Can't reach database server` | MySQL chưa chạy, sai cổng, sai `DATABASE_URL` hoặc sai mật khẩu |
| `P3018` khi migrate | Database cũ/migration lỗi. Với MariaDB 10.4, dùng source mới nhất (migration đã sửa sang `CHANGE COLUMN`), hoặc dùng MySQL 8 |
| `Prisma Client did not initialize` | Chưa chạy `npx prisma generate` |
| `EADDRINUSE: 5000` | Cổng 5000 đang bị chiếm. Tắt process cũ hoặc đổi `PORT` trong `backend/.env` |
| `EADDRINUSE: 5173` | Cổng 5173 đang bị chiếm. Đổi cổng Vite hoặc tắt process cũ |
| Frontend báo lỗi CORS | `CLIENT_URL` trong `backend/.env` phải đúng bằng địa chỉ frontend, ví dụ `http://localhost:5173` |
| Upload ảnh lỗi | Kiểm tra thư mục `backend/uploads/` và quyền ghi; chạy lại `npm ci` nếu `sharp` cài lỗi |
| Không gửi được email | Bình thường nếu máy local không có SMTP; booking vẫn được xử lý |
| Đăng nhập xong bị mất phiên | Ở production bắt buộc dùng HTTPS vì cookie có `secure: true`; local dùng HTTP vẫn được |

Reset database local (xóa toàn bộ dữ liệu dev):

```bash
cd backend
npx prisma migrate reset
npm run seed:admin
```

### 8. Bàn giao kèm dữ liệu (nếu cần)

Export database ở máy cũ:

```bash
mysqldump -u root -p booking_platform > booking_platform.sql
```

Copy thêm thư mục `backend/uploads/` nếu muốn giữ ảnh listing.

Ở máy mới, sau khi đã tạo database và chạy `npx prisma migrate deploy`:

```bash
mysql -u root -p booking_platform < booking_platform.sql
```

Sau đó copy thư mục `backend/uploads/` vào đúng vị trí trong dự án mới.

> Không gửi kèm `backend/.env`. Gửi thông tin tài khoản (mật khẩu MySQL,
> Braintree, `JWT_SECRET`) qua kênh riêng, không qua Git.

### 9. Checklist bàn giao

- [ ] Đã commit và push toàn bộ thay đổi cần thiết
- [ ] Không có file `.env`, `node_modules`, `dist` trong source gửi đi
- [ ] `git status` không còn file quan trọng bị untracked
- [ ] Đã gửi thông tin secrets qua kênh riêng (nếu cần)
- [ ] Đã nói rõ dùng MySQL 8 hay MariaDB 10.4+
- [ ] Nếu bàn giao kèm dữ liệu: đã export database + copy `backend/uploads/`
- [ ] Máy mới chạy được `GET /health`, mở được frontend và đăng nhập admin

## Triển khai (Deploy)

Xem tệp [`DEPLOY.md`](DEPLOY.md) để đọc hướng dẫn triển khai môi trường production hoàn chỉnh (Docker Compose, cấu hình Nginx/TLS, biến môi trường, thiết lập email Postfix, đăng ký webhook Braintree).

## Tài liệu tham khảo thêm

- [`REPORT.md`](REPORT.md) — Báo cáo tổng thể dự án & Đặc tả yêu cầu phần mềm (SRS)
- [`usecase.md`](usecase.md) — Đặc tả Use Case & Sơ đồ Use Case chi tiết
- [`DEPLOY.md`](DEPLOY.md) — Hướng dẫn triển khai production
- [`DATABASE.md`](DATABASE.md) — Cấu trúc cơ sở dữ liệu chi tiết
- [`FEATURES.md`](FEATURES.md) — Danh mục tính năng chi tiết
