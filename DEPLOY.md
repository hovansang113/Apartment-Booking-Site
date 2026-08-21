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
- ~~`CLOUDINARY_*`~~ — không còn dùng (21/8, chuyển sang lưu ảnh local để tránh phụ thuộc dịch vụ ngoài). Ảnh listing được resize + nén AVIF (2 cỡ: thumb/large) rồi lưu vào volume Docker `listing_images`, nginx phục vụ trực tiếp ở `/uploads/*` — xem `backend/src/utils/imageProcessing.js` + `docker-compose.yml`. Sau lần đầu deploy bản này, chạy `docker compose exec backend npm run migrate:images` 1 lần để chuyển nốt ảnh cũ còn trên Cloudinary sang local.
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

## Postfix (19/8, gửi email xác nhận booking — thay Resend theo yêu cầu Jason)

Backend gửi email qua SMTP (`backend/src/config/mailer.js`) tới Postfix cài **thẳng trên máy host** (không phải container — Postfix không hợp chạy trong Docker vì cần systemd + ghi log/queue bền). `docker-compose.yml` đã có sẵn `extra_hosts: host.docker.internal:host-gateway` cho service `backend`, nên container gọi được vào Postfix trên host qua `SMTP_HOST=host.docker.internal`.

**Lưu ý trước khi làm**: email tự gửi từ 1 VPS mới rất dễ rơi vào Spam/bị từ chối vì IP chưa có "danh tiếng" gửi mail — khác hẳn dịch vụ như Resend/SES đã có sẵn IP uy tín. Bắt buộc phải làm đủ SPF + DKIM + DMARC + PTR bên dưới, không chỉ cài Postfix xong là xong.

### 1. Cài Postfix + OpenDKIM

```bash
apt-get update
apt-get install -y postfix opendkim opendkim-tools
# Luc cai se hoi "General type of mail configuration" - chon "Internet Site",
# "System mail name" dien dung reservesmith.com
```

### 2. Cấu hình Postfix nhận request từ container (`/etc/postfix/main.cf`)

```bash
postconf -e "myhostname = reservesmith.com"
postconf -e "mydomain = reservesmith.com"
postconf -e "inet_interfaces = all"
# CHI cho phep localhost + dai IP noi bo cua Docker duoc goi relay qua day -
# thieu dong nay la thanh "open relay" cong khai, server se bi spam loi dung
# va list den rat nhanh.
postconf -e "mynetworks = 127.0.0.0/8, 172.16.0.0/12"
postconf -e "milter_default_action = accept"
postconf -e "milter_protocol = 6"
postconf -e "smtpd_milters = inet:localhost:12301"
postconf -e "non_smtpd_milters = inet:localhost:12301"
systemctl restart postfix
```

### 3. Sinh khoá DKIM

```bash
mkdir -p /etc/opendkim/keys/reservesmith.com
opendkim-genkey -b 2048 -d reservesmith.com -D /etc/opendkim/keys/reservesmith.com -s mail -v
chown -R opendkim:opendkim /etc/opendkim/keys
cat /etc/opendkim/keys/reservesmith.com/mail.txt   # noi dung ban ghi DNS DKIM can them, xem buoc 5
```

Cấu hình `/etc/opendkim.conf` (thêm/sửa các dòng):
```
Domain                  reservesmith.com
KeyFile                 /etc/opendkim/keys/reservesmith.com/mail.private
Selector                mail
Socket                  inet:12301@localhost
```

```bash
systemctl restart opendkim
```

### 4. Mở port 25 outbound

```bash
ufw allow out 25/tcp
```

Nhiều nhà cung cấp VPS **chặn sẵn port 25 ở tầng mạng** (ngoài firewall trong máy) để chống spam — nếu gửi thử vẫn không đi được dù đã mở `ufw`, cần liên hệ hỗ trợ nhà cung cấp VPS xin mở port 25 outbound cho IP server.

### 5. Bản ghi DNS (thêm trong Cloudflare, domain `reservesmith.com`)

| Loại | Tên | Giá trị |
|---|---|---|
| TXT | `@` | `v=spf1 ip4:154.91.1.216 ~all` |
| TXT | `mail._domainkey` | nội dung trong `mail.txt` ở bước 3 (Cloudflare tự nối chuỗi bị cắt, dán nguyên) |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:admin@reservesmith.com` |

**PTR (reverse DNS)** — không tự làm qua Cloudflare được vì đây là bản ghi phía nhà cung cấp VPS quản lý IP, phải vào control panel VPS (hoặc liên hệ hỗ trợ) đặt PTR của `154.91.1.216` trỏ về `reservesmith.com`. Thiếu bước này gần như chắc chắn bị Gmail/Outlook từ chối hoặc đưa vào Spam.

### 6. Điền `.env` + deploy

```bash
sed -i \
  -e 's/^SMTP_HOST=.*/SMTP_HOST=host.docker.internal/' \
  -e 's/^SMTP_PORT=.*/SMTP_PORT=25/' \
  backend/.env
./deploy.sh
```

### 7. Test gửi thử

```bash
echo "Test email tu Postfix" | mail -s "Test" your-real-email@gmail.com
# Kiem tra Postfix nhan dung request tu container:
tail -f /var/log/mail.log
```

Gửi thử tới Gmail/Outlook thật rồi kiểm tra có vào hộp thư chính hay bị rơi Spam — nếu vẫn vào Spam sau khi đã làm đủ SPF/DKIM/DMARC/PTR, cần thêm thời gian "warm up" IP (gửi ít, tăng dần) trước khi các nhà cung cấp lớn tin tưởng IP mới.

## Chưa làm (ngoài phạm vi lần chuẩn bị này)

- **CI/CD tự động** (vd GitHub Actions tự SSH deploy khi push `main`) — hiện đang deploy tay qua `deploy.sh`, có thể tự động hoá sau nếu cần.
- Backup tự động cho `mysql_data` volume.
- Tự động gia hạn chứng chỉ SSL (đã ghi cách làm tay ở trên, chưa đặt cron tự động).
