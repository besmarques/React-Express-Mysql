INSERT INTO `user` (
    `name`,
    `email`,
    `password`,
    `is_admin`,
    `resetTokenExpiresAt`,
    `resetToken`
) VALUES (
    'Admin',
    'admin@example.com',
    '$2b$10$replaceWithARealBcryptHashBeforeRunning',
    1,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `password` = VALUES(`password`),
    `is_admin` = VALUES(`is_admin`);
