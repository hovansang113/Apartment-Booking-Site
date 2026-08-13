-- AlterTable: tach default_price thanh weekday_price/weekend_price. Them 2
-- cot dang NULL truoc, backfill = default_price cu cho moi dong (host giu
-- nguyen gia hien tai cho toi khi tu vao sua rieng ngay thuong/cuoi tuan),
-- roi moi ep NOT NULL, cuoi cung xoa cot default_price.
ALTER TABLE `listings` ADD COLUMN `weekday_price` DECIMAL(12, 2) NULL;
ALTER TABLE `listings` ADD COLUMN `weekend_price` DECIMAL(12, 2) NULL;

UPDATE `listings` SET `weekday_price` = `default_price`, `weekend_price` = `default_price`;

ALTER TABLE `listings` MODIFY COLUMN `weekday_price` DECIMAL(12, 2) NOT NULL;
ALTER TABLE `listings` MODIFY COLUMN `weekend_price` DECIMAL(12, 2) NOT NULL;

ALTER TABLE `listings` DROP COLUMN `default_price`;
