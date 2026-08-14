-- AlterTable: them thong tin nhan tien (payout) cho host - cot moi hoan toan,
-- khong co du lieu cu can backfill nen them thang NULL la du, khong can
-- 2 buoc nhu khi tach weekday/weekend price truoc do.
ALTER TABLE `users` ADD COLUMN `bank_code` VARCHAR(191) NULL;
ALTER TABLE `users` ADD COLUMN `bank_account_number` VARCHAR(191) NULL;
ALTER TABLE `users` ADD COLUMN `bank_account_holder` VARCHAR(191) NULL;
