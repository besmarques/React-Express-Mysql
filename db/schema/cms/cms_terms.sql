CREATE TABLE IF NOT EXISTS `cms_terms` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `taxonomy` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `parent_id` INT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_cms_terms_taxonomy_slug` (`taxonomy`, `slug`),
    KEY `idx_cms_terms_parent` (`parent_id`),
    CONSTRAINT `fk_cms_terms_parent`
        FOREIGN KEY (`parent_id`) REFERENCES `cms_terms` (`id`)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;
