CREATE TABLE IF NOT EXISTS `cms_media` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(255) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `size` INT UNSIGNED NOT NULL,
    `url` VARCHAR(1024) NOT NULL,
    `alt_text` VARCHAR(255) NULL DEFAULT NULL,
    `caption` TEXT NULL DEFAULT NULL,
    `uploaded_by` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_cms_media_uploaded_by` (`uploaded_by`),
    KEY `idx_cms_media_mime_type` (`mime_type`)
) ENGINE=InnoDB;
