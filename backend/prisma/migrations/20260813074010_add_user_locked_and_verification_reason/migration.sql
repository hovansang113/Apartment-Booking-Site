-- AlterTable
ALTER TABLE `users` ADD COLUMN `locked_reason` TEXT NULL,
    ADD COLUMN `verification_note` TEXT NULL;
