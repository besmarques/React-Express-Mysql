CREATE TABLE IF NOT EXISTS `cms_revisions` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `post_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `template` VARCHAR(100) NULL DEFAULT NULL,
    `excerpt` TEXT NULL DEFAULT NULL,
    `content_json` LONGTEXT NULL,
    `content_html` MEDIUMTEXT NULL DEFAULT NULL,
    `status` VARCHAR(50) NOT NULL,
    `author_id` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_cms_revisions_post_created` (`post_id`, `created_at`),
    KEY `idx_cms_revisions_author` (`author_id`),
    CONSTRAINT `fk_cms_revisions_post`
        FOREIGN KEY (`post_id`) REFERENCES `cms_posts` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;
