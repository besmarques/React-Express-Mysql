CREATE TABLE IF NOT EXISTS `cms_posts` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(50) NOT NULL DEFAULT 'post',
    `status` VARCHAR(50) NOT NULL DEFAULT 'draft',
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `template` VARCHAR(100) NULL DEFAULT NULL,
    `excerpt` TEXT NULL DEFAULT NULL,
    `content_json` LONGTEXT NULL,
    `content_html` MEDIUMTEXT NULL DEFAULT NULL,
    `author_id` INT NOT NULL,
    `parent_id` INT NULL DEFAULT NULL,
    `menu_order` INT NOT NULL DEFAULT 0,
    `published_at` DATETIME NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_cms_posts_type_slug` (`type`, `slug`),
    KEY `idx_cms_posts_status_type_published` (`status`, `type`, `published_at`),
    KEY `idx_cms_posts_author` (`author_id`),
    KEY `idx_cms_posts_parent` (`parent_id`),
    CONSTRAINT `fk_cms_posts_parent`
        FOREIGN KEY (`parent_id`) REFERENCES `cms_posts` (`id`)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;
