const menuRepository = require("./menuRepository");

const allowedItemTypes = new Set(["custom", "page", "post", "category", "tag"]);

const createHttpError = (statusCode, responseBody, message) => {
    const error = new Error(message || responseBody.message || responseBody);
    error.statusCode = statusCode;
    error.responseBody = responseBody;
    return error;
};

const normalizeMenuInput = (payload, fallback = {}) => ({
    name: payload.name !== undefined ? payload.name : fallback.name,
    slug: payload.slug !== undefined ? payload.slug : fallback.slug,
    location: payload.location !== undefined ? payload.location : fallback.location,
});

const normalizeMenuItemInput = (payload, fallback = {}) => ({
    parentId: payload.parentId !== undefined ? payload.parentId : fallback.parentId,
    label: payload.label !== undefined ? payload.label : fallback.label,
    itemType: payload.itemType !== undefined ? payload.itemType : fallback.itemType || "custom",
    targetId: payload.targetId !== undefined ? payload.targetId : fallback.targetId,
    url: payload.url !== undefined ? payload.url : fallback.url,
    sortOrder: payload.sortOrder !== undefined ? payload.sortOrder : fallback.sortOrder || 0,
});

const assertAllowedItemType = (itemType) => {
    if (!allowedItemTypes.has(itemType)) {
        throw createHttpError(400, { message: "Invalid CMS menu item type." });
    }
};

const assertMenuItemTarget = (item) => {
    if (item.itemType === "custom" && !item.url) {
        throw createHttpError(400, { message: "Custom menu items require a URL." });
    }

    if (item.itemType !== "custom" && !item.targetId) {
        throw createHttpError(400, { message: "CMS menu item target is required." });
    }
};

const resolveMenuItemUrl = (item) => {
    if (item.itemType === "custom") {
        return item.url || "#";
    }

    if (item.itemType === "page" && item.postSlug) {
        return `/${item.postSlug}`;
    }

    if (item.itemType === "post" && item.postSlug) {
        return `/posts/${item.postSlug}`;
    }

    if (item.itemType === "category" && item.termSlug) {
        return `/category/${item.termSlug}`;
    }

    if (item.itemType === "tag" && item.termSlug) {
        return `/tag/${item.termSlug}`;
    }

    return "#";
};

const buildMenuTree = (items) => {
    const itemMap = new Map();
    const roots = [];

    items.forEach((item) => {
        itemMap.set(item.id, {
            id: item.id,
            label: item.label,
            itemType: item.itemType,
            targetId: item.targetId,
            url: resolveMenuItemUrl(item),
            sortOrder: item.sortOrder,
            children: [],
        });
    });

    items.forEach((item) => {
        const mappedItem = itemMap.get(item.id);
        const parent = item.parentId ? itemMap.get(item.parentId) : null;

        if (parent) {
            parent.children.push(mappedItem);
        } else {
            roots.push(mappedItem);
        }
    });

    return roots;
};

const getMenus = async () => menuRepository.listMenus();

const getMenuById = async (id) => {
    const menu = await menuRepository.findMenuById(id);

    if (!menu) {
        throw createHttpError(404, { message: "CMS menu not found." });
    }

    return menu;
};

const getMenuWithItems = async (id) => {
    const menu = await getMenuById(id);
    const items = await menuRepository.listMenuItems(id);

    return {
        ...menu,
        items,
    };
};

const createMenu = async (payload) => {
    const menu = normalizeMenuInput(payload);
    return menuRepository.createMenu(menu);
};

const updateMenu = async (id, payload) => {
    const existingMenu = await getMenuById(id);
    const menu = normalizeMenuInput(payload, existingMenu);
    const updatedMenu = await menuRepository.updateMenu(id, menu);

    if (!updatedMenu) {
        throw createHttpError(404, { message: "CMS menu not found." });
    }

    return updatedMenu;
};

const deleteMenu = async (id) => {
    const result = await menuRepository.deleteMenu(id);

    if (!result || result.affectedRows === 0) {
        throw createHttpError(404, { message: "CMS menu not found." });
    }
};

const getMenuItems = async (menuId) => {
    await getMenuById(menuId);
    return menuRepository.listMenuItems(menuId);
};

const createMenuItem = async (menuId, payload) => {
    await getMenuById(menuId);
    const item = normalizeMenuItemInput(payload);
    assertAllowedItemType(item.itemType);
    assertMenuItemTarget(item);

    return menuRepository.createMenuItem(menuId, item);
};

const updateMenuItem = async (menuId, itemId, payload) => {
    await getMenuById(menuId);
    const existingItem = await menuRepository.findMenuItemById(menuId, itemId);

    if (!existingItem) {
        throw createHttpError(404, { message: "CMS menu item not found." });
    }

    const item = normalizeMenuItemInput(payload, existingItem);
    assertAllowedItemType(item.itemType);
    assertMenuItemTarget(item);

    const updatedItem = await menuRepository.updateMenuItem(menuId, itemId, item);

    if (!updatedItem) {
        throw createHttpError(404, { message: "CMS menu item not found." });
    }

    return updatedItem;
};

const deleteMenuItem = async (menuId, itemId) => {
    await getMenuById(menuId);
    const result = await menuRepository.deleteMenuItem(menuId, itemId);

    if (!result || result.affectedRows === 0) {
        throw createHttpError(404, { message: "CMS menu item not found." });
    }
};

const getPublicMenuByLocation = async (location) => {
    const menu = await menuRepository.findMenuByLocation(location);

    if (!menu) {
        throw createHttpError(404, { message: "CMS menu not found." });
    }

    const items = await menuRepository.listPublicMenuItems(menu.id);

    return {
        ...menu,
        items: buildMenuTree(items),
    };
};

module.exports = {
    createMenu,
    createMenuItem,
    deleteMenu,
    deleteMenuItem,
    getMenuById,
    getMenuItems,
    getMenuWithItems,
    getMenus,
    getPublicMenuByLocation,
    updateMenu,
    updateMenuItem,
};
