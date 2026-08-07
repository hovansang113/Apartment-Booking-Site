/*
  Warnings:

  - Added the required column `bathrooms` to the `listings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bedrooms` to the `listings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beds` to the `listings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guest_capacity` to the `listings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `listings` ADD COLUMN `bathrooms` INTEGER NOT NULL,
    ADD COLUMN `bedrooms` INTEGER NOT NULL,
    ADD COLUMN `beds` INTEGER NOT NULL,
    ADD COLUMN `guest_capacity` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `listing_amenities` (
    `id` VARCHAR(191) NOT NULL,
    `listing_id` VARCHAR(191) NOT NULL,
    `amenity` ENUM('wifi', 'kitchen', 'washer', 'air_conditioning', 'free_parking', 'pool', 'tv', 'workspace') NOT NULL,

    UNIQUE INDEX `listing_amenities_listing_id_amenity_key`(`listing_id`, `amenity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `listing_amenities` ADD CONSTRAINT `listing_amenities_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
