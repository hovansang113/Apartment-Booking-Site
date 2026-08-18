-- Chuyen payment gateway VNPay -> Braintree (18/8, theo yeu cau Jason: UK-only,
-- can credit card + 3D Secure). `payments` chi co du lieu test local (12 dong,
-- khong phai du lieu that tren server production) nen xoa han va tao lai theo
-- dung thiet ke moi, cung pattern da dung luc thiet ke Payment cho VNPay
-- truoc day (xem migration add_booking_payment_lifecycle).
DROP TABLE `payments`;

CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'braintree',
    `amount` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    `braintree_transaction_id` VARCHAR(191) NULL,
    `braintree_status` VARCHAR(191) NULL,
    `three_d_secure_verified` BOOLEAN NOT NULL DEFAULT false,
    `confirmed_at` DATETIME(3) NULL,
    `refunded_at` DATETIME(3) NULL,
    `refund_amount` DECIMAL(12, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payments_booking_id_key`(`booking_id`),
    UNIQUE INDEX `payments_braintree_transaction_id_key`(`braintree_transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
