CREATE TABLE IF NOT EXISTS `cms_roles` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_cms_roles_slug` (`slug`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `cms_permissions` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(255) NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_cms_permissions_name` (`name`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `cms_user_roles` (
    `user_id` INT NOT NULL,
    `role_id` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `role_id`),
    KEY `idx_cms_user_roles_role` (`role_id`),
    CONSTRAINT `fk_cms_user_roles_role`
        FOREIGN KEY (`role_id`) REFERENCES `cms_roles` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `cms_role_permissions` (
    `role_id` INT NOT NULL,
    `permission_id` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`role_id`, `permission_id`),
    KEY `idx_cms_role_permissions_permission` (`permission_id`),
    CONSTRAINT `fk_cms_role_permissions_role`
        FOREIGN KEY (`role_id`) REFERENCES `cms_roles` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_cms_role_permissions_permission`
        FOREIGN KEY (`permission_id`) REFERENCES `cms_permissions` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT IGNORE INTO `cms_permissions` (`name`, `description`) VALUES
    ('cms.posts.read', 'Read CMS posts and pages'),
    ('cms.posts.create', 'Create CMS posts and pages'),
    ('cms.posts.update', 'Update CMS posts and pages'),
    ('cms.posts.publish', 'Publish CMS posts and pages'),
    ('cms.posts.delete', 'Delete CMS posts and pages'),
    ('cms.media.manage', 'Manage CMS media'),
    ('cms.menus.manage', 'Manage CMS menus'),
    ('cms.taxonomies.manage', 'Manage CMS taxonomies'),
    ('cms.settings.manage', 'Manage CMS settings'),
    ('users.manage', 'Manage users');

INSERT IGNORE INTO `cms_roles` (`name`, `slug`) VALUES
    ('Administrator', 'administrator'),
    ('Editor', 'editor'),
    ('Author', 'author');

INSERT IGNORE INTO `cms_role_permissions` (`role_id`, `permission_id`)
SELECT `cms_roles`.`id`, `cms_permissions`.`id`
FROM `cms_roles`
INNER JOIN `cms_permissions`
WHERE `cms_roles`.`slug` = 'administrator';

INSERT IGNORE INTO `cms_role_permissions` (`role_id`, `permission_id`)
SELECT `cms_roles`.`id`, `cms_permissions`.`id`
FROM `cms_roles`
INNER JOIN `cms_permissions`
WHERE `cms_roles`.`slug` = 'editor'
  AND `cms_permissions`.`name` IN (
      'cms.posts.read',
      'cms.posts.create',
      'cms.posts.update',
      'cms.posts.publish',
      'cms.posts.delete',
      'cms.media.manage',
      'cms.menus.manage',
      'cms.taxonomies.manage',
      'cms.settings.manage'
  );

INSERT IGNORE INTO `cms_role_permissions` (`role_id`, `permission_id`)
SELECT `cms_roles`.`id`, `cms_permissions`.`id`
FROM `cms_roles`
INNER JOIN `cms_permissions`
WHERE `cms_roles`.`slug` = 'author'
  AND `cms_permissions`.`name` IN (
      'cms.posts.read',
      'cms.posts.create',
      'cms.posts.update'
  );
