CREATE TABLE IF NOT EXISTS `cms_menus` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `location` VARCHAR(100) NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_cms_menus_slug` (`slug`),
    KEY `idx_cms_menus_location` (`location`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `cms_menu_items` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `menu_id` INT NOT NULL,
    `parent_id` INT NULL DEFAULT NULL,
    `label` VARCHAR(255) NOT NULL,
    `item_type` VARCHAR(50) NOT NULL DEFAULT 'custom',
    `target_id` INT NULL DEFAULT NULL,
    `url` VARCHAR(1024) NULL DEFAULT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_cms_menu_items_menu_sort` (`menu_id`, `sort_order`),
    KEY `idx_cms_menu_items_parent` (`parent_id`),
    CONSTRAINT `fk_cms_menu_items_menu`
        FOREIGN KEY (`menu_id`) REFERENCES `cms_menus` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_cms_menu_items_parent`
        FOREIGN KEY (`parent_id`) REFERENCES `cms_menu_items` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;
