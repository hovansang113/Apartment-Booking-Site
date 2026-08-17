#!/bin/bash
# Chay TREN SERVER (khong phai may local) khi da SSH vao lai duoc. Xem
# DEPLOY.md de biet lan dau setup can lam gi truoc khi chay script nay.
set -e

echo "==> Pull code moi nhat tu main"
git pull origin main

echo "==> Build lai image (chi rebuild phan da doi)"
docker compose build

echo "==> Khoi dong lai container (migrate DB tu dong chay trong backend CMD)"
docker compose up -d

echo "==> Xong. Kiem tra trang thai:"
docker compose ps
