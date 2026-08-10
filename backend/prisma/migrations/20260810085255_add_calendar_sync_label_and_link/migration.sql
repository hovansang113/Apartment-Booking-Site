/*
  Warnings:

  - Added the required column `label` to the `listing_calendar_sync` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `listing_calendar` ADD COLUMN `calendar_sync_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `listing_calendar_sync` ADD COLUMN `label` VARCHAR(191) NOT NULL,
    MODIFY `ical_url` TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE `listing_calendar` ADD CONSTRAINT `listing_calendar_calendar_sync_id_fkey` FOREIGN KEY (`calendar_sync_id`) REFERENCES `listing_calendar_sync`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
