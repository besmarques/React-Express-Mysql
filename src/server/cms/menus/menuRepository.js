const connections = require("../../config/dbpool");

const menuFields = `
    id,
    name,
    slug,
    location,
    created_at AS createdAt,
    updated_at AS updatedAt
`;

const menuItemFields = `
    cms_menu_items.id,
    cms_menu_items.menu_id AS menuId,
    cms_menu_items.parent_id AS parentId,
    cms_menu_items.label,
    cms_menu_items.item_type AS itemType,
    cms_menu_items.target_id AS targetId,
    cms_menu_items.url,
    cms_menu_items.sort_order AS sortOrder,
    cms_menu_items.created_at AS createdAt,
    cms_menu_items.updated_at AS updatedAt
`;

const publicMenuItemFields = `
    ${menuItemFields},
    cms_posts.type AS postType,
    cms_posts.slug AS postSlug,
    cms_terms.taxonomy AS termTaxonomy,
    cms_terms.slug AS termSlug
`;

const listMenus = async () => {
    const [menus] = await connections.execute(
        `SELECT ${menuFields} FROM cms_menus ORDER BY name ASC`
    );

    return menus;
};

const findMenuById = async (id) => {
    const [menus] = await connections.execute(
        `SELECT ${menuFields} FROM cms_menus WHERE id = ? LIMIT 1`,
        [id]
    );

    return menus[0];
};

const findMenuByLocation = async (location) => {
    const [menus] = await connections.execute(
        `SELECT ${menuFields} FROM cms_menus WHERE location = ? LIMIT 1`,
        [location]
    );

    return menus[0];
};

const createMenu = async (menu) => {
    const [result] = await connections.execute(
        `INSERT INTO cms_menus (
            name,
            slug,
            location,
            updated_at
        ) VALUES (?, ?, ?, UTC_TIMESTAMP())`,
        [
            menu.name,
            menu.slug,
            menu.location || null,
        ]
    );

    return findMenuById(result.insertId);
};

const updateMenu = async (id, menu) => {
    const [result] = await connections.execute(
        `UPDATE cms_menus
         SET name = ?,
             slug = ?,
             location = ?,
             updated_at = UTC_TIMESTAMP()
         WHERE id = ?`,
        [
            menu.name,
            menu.slug,
            menu.location || null,
            id,
        ]
    );

    if (result.affectedRows === 0) {
        return undefined;
    }

    return findMenuById(id);
};

const deleteMenu = async (id) => {
    const [result] = await connections.execute(
        "DELETE FROM cms_menus WHERE id = ?",
        [id]
    );

    return result;
};

const listMenuItems = async (menuId) => {
    const [items] = await connections.execute(
        `SELECT ${menuItemFields}
         FROM cms_menu_items
         WHERE menu_id = ?
         ORDER BY sort_order ASC, id ASC`,
        [menuId]
    );

    return items;
};

const listPublicMenuItems = async (menuId) => {
    const [items] = await connections.execute(
        `SELECT ${publicMenuItemFields}
         FROM cms_menu_items
         LEFT JOIN cms_posts
            ON cms_menu_items.target_id = cms_posts.id
            AND cms_menu_items.item_type IN ('page', 'post')
         LEFT JOIN cms_terms
            ON cms_menu_items.target_id = cms_terms.id
            AND cms_menu_items.item_type IN ('category', 'tag')
         WHERE cms_menu_items.menu_id = ?
         ORDER BY cms_menu_items.sort_order ASC, cms_menu_items.id ASC`,
        [menuId]
    );

    return items;
};

const findMenuItemById = async (menuId, itemId) => {
    const [items] = await connections.execute(
        `SELECT ${menuItemFields}
         FROM cms_menu_items
         WHERE menu_id = ? AND id = ?
         LIMIT 1`,
        [menuId, itemId]
    );

    return items[0];
};

const createMenuItem = async (menuId, item) => {
    const [result] = await connections.execute(
        `INSERT INTO cms_menu_items (
            menu_id,
            parent_id,
            label,
            item_type,
            target_id,
            url,
            sort_order,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
        [
            menuId,
            item.parentId || null,
            item.label,
            item.itemType,
            item.targetId || null,
            item.url || null,
            item.sortOrder || 0,
        ]
    );

    return findMenuItemById(menuId, result.insertId);
};

const updateMenuItem = async (menuId, itemId, item) => {
    const [result] = await connections.execute(
        `UPDATE cms_menu_items
         SET parent_id = ?,
             label = ?,
             item_type = ?,
             target_id = ?,
             url = ?,
             sort_order = ?,
             updated_at = UTC_TIMESTAMP()
         WHERE menu_id = ? AND id = ?`,
        [
            item.parentId || null,
            item.label,
            item.itemType,
            item.targetId || null,
            item.url || null,
            item.sortOrder || 0,
            menuId,
            itemId,
        ]
    );

    if (result.affectedRows === 0) {
        return undefined;
    }

    return findMenuItemById(menuId, itemId);
};

const deleteMenuItem = async (menuId, itemId) => {
    const [result] = await connections.execute(
        "DELETE FROM cms_menu_items WHERE menu_id = ? AND id = ?",
        [menuId, itemId]
    );

    return result;
};

module.exports = {
    createMenu,
    createMenuItem,
    deleteMenu,
    deleteMenuItem,
    findMenuById,
    findMenuByLocation,
    findMenuItemById,
    listMenuItems,
    listMenus,
    listPublicMenuItems,
    updateMenu,
    updateMenuItem,
};
