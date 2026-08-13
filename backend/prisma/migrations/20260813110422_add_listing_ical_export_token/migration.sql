-- AlterTable: them cot ical_token dang NULL truoc, backfill UUID cho dong cu,
-- roi moi ep NOT NULL + UNIQUE (khong the them thang NOT NULL vi da co du lieu
-- cu trong bang listings).
ALTER TABLE `listings` ADD COLUMN `ical_token` VARCHAR(191) NULL;

UPDATE `listings` SET `ical_token` = UUID() WHERE `ical_token` IS NULL;

ALTER TABLE `listings` MODIFY COLUMN `ical_token` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `listings_ical_token_key` ON `listings`(`ical_token`);
