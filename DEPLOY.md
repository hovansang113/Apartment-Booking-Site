# Deploy — Booking Platform

Chuẩn bị sẵn ngày 14/8 trong lúc chờ SSH vào lại server (`154.91.1.216` — ping được nhưng port 22/80/443/3000/5000 đều không kết nối được, nghi do firewall/fail2ban tự khoá sau khi bị dò mật khẩu, xem lịch sử chat). Khi vào lại được, làm theo hướng dẫn dưới đây.

## Kiến trúc

Docker Compose, 3 container:

| Service | Vai trò | Port public |
|---|---|---|
| `mysql` | MySQL 8, dữ liệu lưu vào volume `mysql_data` | không mở ra ngoài (chỉ `backend` gọi vào qua mạng nội bộ Docker) |
| `backend` | Node/Express API, tự chạy `prisma migrate deploy` mỗi lần khởi động | không mở ra ngoài (chỉ `frontend`/Nginx gọi vào) |
| `frontend` | Build tĩnh (Vite) + Nginx — vừa phục vụ SPA, vừa reverse-proxy `/api/*` sang `backend` | `80` |

Nhờ Nginx đứng trước cả 2, **frontend và backend cùng 1 origin** khi truy cập từ trình duyệt (gọi `/api/...` tương đối) — không cần lo CORS, không cần biết trước domain/IP lúc build.

## 1. Cài Docker trên server (nếu chưa có)

Không rõ server dùng distro nào — kiểm tra trước:

```bash
cat /etc/os-release
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com | sh
```

**CentOS/RHEL/AlmaLinux:**
```bash
dnf install -y docker docker-compose-plugin
systemctl enable --now docker
```

Kiểm tra: `docker compose version` phải chạy được (Compose v2, dùng `docker compose` không phải `docker-compose`).

## 2. Mở firewall (QUAN TRỌNG — đây là nguyên nhân đợt trước bị khoá port 22)

Trước khi làm gì khác, kiểm tra và đảm bảo:
- **Port 22 (SSH) vẫn mở** — đừng để lặp lại sự cố vừa rồi. Nếu có `fail2ban`, kiểm tra `fail2ban-client status sshd` xem IP của Sang có bị ban không (`fail2ban-client unban <IP>` nếu có).
- **Port 80** (và 443 sau này nếu có domain + HTTPS) phải mở cho web truy cập được.

```bash
# vi du voi ufw (Ubuntu)
ufw allow 22/tcp
ufw allow 80/tcp
ufw status

# hoac firewalld (CentOS/RHEL)
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --reload
```

Nếu nhà cung cấp VPS còn có **Security Group** riêng ở control panel (ngoài firewall trong máy), phải mở ở đó nữa.

## 3. Lần đầu deploy

```bash
git clone https://github.com/hovansang113/Apartment-Booking-Site.git booking-platform
cd booking-platform

# .env cho docker-compose (mat khau root MySQL + domain public)
cp .env.example .env
nano .env   # doi MYSQL_ROOT_PASSWORD + SITE_URL thanh gia tri that

# .env cho backend (xem chu thich tung dong trong file)
cp backend/.env.example backend/.env
nano backend/.env
```

Trong `backend/.env`, các giá trị **bắt buộc phải đổi** trước khi chạy thật:
- `DATABASE_URL` — host phải là `mysql` (tên service trong `docker-compose.yml`), khớp mật khẩu vừa đặt ở `.env` gốc: `mysql://root:<MYSQL_ROOT_PASSWORD>@mysql:3306/booking_platform`
- `JWT_SECRET` — đổi thành chuỗi bí mật thật, không giữ giá trị mẫu
- `CLIENT_URL` — domain/IP public thật (vd `http://154.91.1.216`), **không để `localhost`** — dùng cho CORS và để sinh `robots.txt`/`sitemap.xml` (`seo.controller.js`). **Phải khớp `SITE_URL` đặt ở `.env` gốc** (dùng để bake vào `index.html` lúc build frontend) — 2 giá trị lệch nhau thì canonical URL trong `index.html` sẽ sai
- `CLOUDINARY_*` — vẫn còn placeholder tính tới 14/8 (xem TODO.md), điền khi có thật; thiếu thì app vẫn chạy được, chỉ riêng upload ảnh sẽ báo lỗi
- `BRAINTREE_MERCHANT_ID` / `BRAINTREE_PUBLIC_KEY` / `BRAINTREE_PRIVATE_KEY` / `BRAINTREE_ENVIRONMENT` (18/8, thay VNPay) — key **production** thật do Jason cung cấp qua Slack, CHỈ điền trên server thật lúc deploy, không bao giờ commit vào repo hay dùng lúc dev local (dev dùng Sandbox key riêng, xem `backend/.env.example`). Sau khi deploy, phải vào **Braintree Control Panel → Webhooks** đăng ký URL `https://reservesmith.com/api/payments/braintree-webhook` (Braintree sẽ gọi GET xác minh trước, route đã có sẵn xử lý cả GET verify lẫn POST notification thật, xem `payment.controller.js`)

Chạy:

```bash
docker compose up -d --build
docker compose ps        # ca 3 container phai o trang thai "Up"/"healthy"
curl http://localhost/api/../health  # hoac curl http://localhost:5000/health tu trong container backend
```

## 4. Tạo tài khoản admin

Không có `prisma/seed.js` (chưa viết — xem TODO.md) — admin luôn được tạo tay, đúng pattern đã dùng lúc dev local:

```bash
docker compose exec backend npx prisma studio
# hoac viet 1 script node nho goi bcrypt.hash + prisma.user.create truc tiep,
# giong cach da tao tai khoan admin demo luc dev local
```

## 5. Deploy lại (sau lần đầu)

```bash
./deploy.sh
```

Script này: `git pull` → `docker compose build` (chỉ build lại phần đổi) → `docker compose up -d`. Migration DB tự chạy mỗi lần `backend` khởi động (`prisma migrate deploy` — an toàn, chỉ áp các migration chưa từng chạy).

## 6. Bật HTTPS (17/8, đã làm — dùng domain thật `reservesmith.com` do Jason trỏ DNS sẵn)

**Lý do bắt buộc phải làm, không phải "nice to have"**: `backend/src/config/cookie.js` set cookie xác thực với `secure: true` khi `NODE_ENV=production` — trình duyệt **chỉ gửi lại cookie này qua HTTPS**. Chạy HTTP thuần thì mọi request cần xác thực sau lúc đăng nhập (F5 lại trang, gọi API admin...) đều bị trình duyệt âm thầm không gửi cookie lên, backend báo "Thiếu token xác thực" — phát hiện lúc test khu admin thật, tưởng là bug map sai data nhưng thực ra là hệ quả tất yếu của việc thiếu HTTPS. **Không sửa bằng cách tắt `secure: true`** (giảm bảo mật, sai hướng) — phải bật HTTPS thật.

Jason đã trỏ DNS `reservesmith.com`/`www.reservesmith.com` → `154.91.1.216` qua Cloudflare (chế độ "DNS only", không proxy qua Cloudflare — request vào thẳng server, không phải lo thêm về xác thực ACME challenge qua Cloudflare).

**Bước 1 — lấy chứng chỉ lần đầu** (dùng chế độ `--standalone`, cần dừng tạm `frontend` để nhường port 80 cho certbot; đợi DNS lan truyền xong mới chạy được, kiểm tra bằng `nslookup reservesmith.com`):

```bash
cd ~/booking-platform
mkdir -p certbot/conf certbot/www
docker compose stop frontend
docker run --rm -p 80:80 \
  -v ~/booking-platform/certbot/conf:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d reservesmith.com -d www.reservesmith.com \
  --email sang.hv@hodfords.com --agree-tos --no-eff-email
docker compose start frontend
ls certbot/conf/live/reservesmith.com/   # phai thay fullchain.pem + privkey.pem
```

**Bước 2 — deploy bản có sẵn cấu hình SSL** (nginx.conf đã có sẵn block `listen 443 ssl` trỏ đúng đường dẫn chứng chỉ trên, `docker-compose.yml` đã mount `./certbot/conf`/`./certbot/www` + mở port 443):

```bash
./deploy.sh
```

**Bước 3 — đổi `SITE_URL`/`CLIENT_URL` sang domain thật + `https://`** (2 file `.env`), rồi deploy lại 1 lần nữa để bake lại `index.html`:

```bash
sed -i 's#http://154.91.1.216.nip.io#https://reservesmith.com#; s#http://154.91.1.216#https://reservesmith.com#' .env backend/.env
./deploy.sh
```

**Gia hạn chứng chỉ** (Let's Encrypt hết hạn sau 90 ngày) — dùng chế độ `webroot` (không cần dừng `frontend`, vì `nginx.conf` đã có sẵn `location /.well-known/acme-challenge/` trỏ vào `certbot/www`):

```bash
docker run --rm \
  -v ~/booking-platform/certbot/conf:/etc/letsencrypt \
  -v ~/booking-platform/certbot/www:/var/www/certbot \
  certbot/certbot renew --webroot -w /var/www/certbot
docker compose exec frontend nginx -s reload
```

Nên đặt lịch (`crontab -e`) chạy 2 lệnh trên mỗi tháng 1 lần để không quên gia hạn.

## Chưa làm (ngoài phạm vi lần chuẩn bị này)

- **CI/CD tự động** (vd GitHub Actions tự SSH deploy khi push `main`) — hiện đang deploy tay qua `deploy.sh`, có thể tự động hoá sau nếu cần.
- Backup tự động cho `mysql_data` volume.
- Tự động gia hạn chứng chỉ SSL (đã ghi cách làm tay ở trên, chưa đặt cron tự động).
