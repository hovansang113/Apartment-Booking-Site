# Booking Platform — Setup

Đây là bộ khung (scaffold) đã setup sẵn cấu trúc thư mục + config + thư viện cho backend và frontend.
**Chưa có logic nghiệp vụ** — các file controller/service chỉ có comment TODO đánh dấu REQ tương ứng, để team tự code dần theo từng sprint.

## Cấu trúc

```
booking-platform/
├── backend/
│   ├── src/
│   │   ├── config/        # prisma client, cloudinary config
│   │   ├── controllers/   # stub - TODO theo từng REQ
│   │   ├── routes/        # stub - route đã comment sẵn path + REQ
│   │   ├── middlewares/   # auth (JWT), role, upload (Cloudinary), error - đã setup sẵn
│   │   ├── services/      # stub - TODO theo từng REQ
│   │   ├── utils/         # jwt.util, response.util - đã setup sẵn
│   │   ├── app.js         # đã wiring middleware + route, sẵn sàng chạy
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma  # đầy đủ 8 bảng theo DB đã thiết kế
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/    # common, listing, booking, calendar (rỗng, chờ code)
    │   ├── pages/         # auth, host, admin, user (rỗng, chờ code)
    │   ├── context/       # AuthContext stub
    │   ├── services/      # api.js, authService, listingService, bookingService (stub)
    │   ├── routes/        # ProtectedRoute stub
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## Cài đặt

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env      # Windows (hoặc: cp .env.example .env trên Mac/Linux)
```

Mở `.env`, điền:
- `DATABASE_URL` — connection string MySQL (vd: `mysql://root:password@localhost:3306/booking_platform`)
- `JWT_SECRET` — chuỗi bí mật bất kỳ
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — lấy từ dashboard Cloudinary

Tạo database và sinh bảng từ Prisma schema:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Chạy server:

```bash
npm run dev
```

Server chạy tại `http://localhost:5000`, kiểm tra bằng `GET /health`.

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Chạy tại `http://localhost:5173`.

## Thư viện đã cài sẵn

**Backend:** express, @prisma/client + prisma, jsonwebtoken, bcrypt, cloudinary, multer + multer-storage-cloudinary, cors, dotenv, morgan, express-validator, express-async-errors, cookie-parser, nodemon (dev)

**Frontend:** react, react-router-dom, axios, @tanstack/react-query, react-hook-form, react-datepicker, date-fns, react-hot-toast, tailwindcss

## Bước tiếp theo

1. Setup MySQL local (hoặc dùng Docker) → chạy `prisma migrate dev`
2. Code dần từng REQ theo sprint đã chia trong sheet — mỗi file stub đều có comment REQ tương ứng để dễ tra cứu
3. REQ_09 (chống trùng lịch) là phần logic quan trọng nhất — nên dùng Prisma transaction (`prisma.$transaction`) khi approve booking để tránh race condition
