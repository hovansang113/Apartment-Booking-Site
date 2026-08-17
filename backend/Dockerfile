FROM node:20-slim

# node:20-slim (Debian 12/bookworm) khong con kem san libssl1.1 - Prisma
# engine mac dinh target openssl-1.1.x se khong chay duoc, loi "Schema engine
# error" mo ho luc "prisma migrate deploy" (phat hien qua smoke-test docker
# compose up that, khong phai doan truoc). Cai openssl la fix Prisma tu khuyen
# nghi trong chinh canh bao cua no.
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# --legacy-peer-deps: xung dot peer-dep co san giua cloudinary/multer-storage-cloudinary
# (cung ly do da phai dung co nay luc npm install o local, xem TODO.md)
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx prisma generate

EXPOSE 5000

# prisma migrate deploy: chi ap dung migration CHUA co trong DB, an toan de
# chay lai moi lan container khoi dong (khong nhu `migrate dev` dung o local).
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
