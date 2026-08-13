-- CreateTable
CREATE TABLE `listing_stay_rules` (
    `id` VARCHAR(191) NOT NULL,
    `listing_id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `min_nights` INTEGER NULL,
    `max_nights` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `listing_stay_rules_listing_id_date_key`(`listing_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `listing_stay_rules` ADD CONSTRAINT `listing_stay_rules_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
