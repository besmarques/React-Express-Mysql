CREATE TABLE IF NOT EXISTS `cms_post_terms` (
    `post_id` INT NOT NULL,
    `term_id` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`post_id`, `term_id`),
    KEY `idx_cms_post_terms_term` (`term_id`),
    CONSTRAINT `fk_cms_post_terms_post`
        FOREIGN KEY (`post_id`) REFERENCES `cms_posts` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_cms_post_terms_term`
        FOREIGN KEY (`term_id`) REFERENCES `cms_terms` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;
