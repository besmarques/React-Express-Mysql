CREATE TABLE IF NOT EXISTS `cms_options` (
    `name` VARCHAR(191) NOT NULL,
    `value_json` LONGTEXT NULL,
    `autoload` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`name`),
    KEY `idx_cms_options_autoload` (`autoload`)
) ENGINE=InnoDB;
