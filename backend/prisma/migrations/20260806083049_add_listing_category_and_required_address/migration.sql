/*
  Warnings:

  - You are about to alter the column `category` on the `listings` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - Made the column `address` on table `listings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `listings` MODIFY `category` ENUM('apartment', 'house', 'villa', 'homestay', 'hotel_room') NULL,
    MODIFY `address` VARCHAR(191) NOT NULL;
