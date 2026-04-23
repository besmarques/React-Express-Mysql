CREATE TABLE IF NOT EXISTS `user` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
    `resetTokenExpiresAt` DATETIME NULL DEFAULT NULL,
    `resetToken` VARCHAR(64) NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_user_email` (`email`),
    KEY `idx_user_reset_token_expires` (`resetToken`, `resetTokenExpiresAt`)
);
