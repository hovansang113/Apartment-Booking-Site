-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `adults_count` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `children_count` INTEGER NOT NULL DEFAULT 0;
