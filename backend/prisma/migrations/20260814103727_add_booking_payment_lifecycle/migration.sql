-- AlterTable `bookings`: mo rong BookingStatus enum (them pending_payment,
-- confirmed, expired - giu nguyen cac gia tri cu vi da co du lieu that dung
-- 'approved'). Them cac cot kinh te (hoa hong) + ma tra cuu + han giu cho -
-- deu can gia tri cho 2 dong booking cu dang co san nen theo dung pattern
-- da dung nhieu lan: them NULL truoc, backfill, roi ep NOT NULL.
ALTER TABLE `bookings` MODIFY COLUMN `status`
  ENUM('pending', 'pending_payment', 'approved', 'confirmed', 'rejected', 'expired', 'canceled')
  NOT NULL DEFAULT 'approved';

ALTER TABLE `bookings` ADD COLUMN `booking_code` VARCHAR(191) NULL;
ALTER TABLE `bookings` ADD COLUMN `commission_rate` DECIMAL(5, 2) NULL;
ALTER TABLE `bookings` ADD COLUMN `commission_amount` DECIMAL(12, 2) NULL;
ALTER TABLE `bookings` ADD COLUMN `host_payout_amount` DECIMAL(12, 2) NULL;
ALTER TABLE `bookings` ADD COLUMN `payment_expires_at` DATETIME(3) NULL;

-- Backfill du lieu cho 2 dong booking test cu (tao truoc khi co luong thanh
-- toan that) - ma tra cuu tu 8 ky tu dau cua id, hoa hong 15% mac dinh.
UPDATE `bookings`
SET
  `booking_code` = UPPER(SUBSTRING(REPLACE(`id`, '-', ''), 1, 8)),
  `commission_rate` = 15.00,
  `commission_amount` = ROUND(`total_price` * 0.15, 2),
  `host_payout_amount` = `total_price` - ROUND(`total_price` * 0.15, 2)
WHERE `booking_code` IS NULL;

ALTER TABLE `bookings` MODIFY COLUMN `booking_code` VARCHAR(191) NOT NULL;
ALTER TABLE `bookings` MODIFY COLUMN `commission_rate` DECIMAL(5, 2) NOT NULL;
ALTER TABLE `bookings` MODIFY COLUMN `commission_amount` DECIMAL(12, 2) NOT NULL;
ALTER TABLE `bookings` MODIFY COLUMN `host_payout_amount` DECIMAL(12, 2) NOT NULL;

CREATE UNIQUE INDEX `bookings_booking_code_key` ON `bookings`(`booking_code`);

-- Payments: bang cu chua tung co dong nao (Payment khong duoc dung o dau
-- trong code truoc gio, chi la scaffold rong cho REQ_10) - xoa han va tao
-- lai theo dung thiet ke that cho VNPay thay vi ALTER tung cot.
DROP TABLE `payments`;

CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'vnpay',
    `amount` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    `vnp_txn_ref` VARCHAR(191) NOT NULL,
    `vnp_transaction_no` VARCHAR(191) NULL,
    `vnp_response_code` VARCHAR(191) NULL,
    `confirmed_at` DATETIME(3) NULL,
    `refunded_at` DATETIME(3) NULL,
    `refund_amount` DECIMAL(12, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payments_booking_id_key`(`booking_id`),
    UNIQUE INDEX `payments_vnp_txn_ref_key`(`vnp_txn_ref`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
