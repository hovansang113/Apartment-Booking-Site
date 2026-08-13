-- AlterTable
ALTER TABLE `users` ADD COLUMN `id_number` VARCHAR(191) NULL,
    ADD COLUMN `legal_name` VARCHAR(191) NULL,
    ADD COLUMN `tax_id` VARCHAR(191) NULL,
    ADD COLUMN `taxpayer_type` ENUM('individual', 'household_business', 'company') NULL,
    ADD COLUMN `verification_status` ENUM('unverified', 'pending', 'verified', 'rejected') NOT NULL DEFAULT 'unverified';
