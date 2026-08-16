-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `contact_address` VARCHAR(191) NULL,
    ADD COLUMN `contact_city` VARCHAR(191) NULL,
    ADD COLUMN `contact_postcode` VARCHAR(191) NULL;
