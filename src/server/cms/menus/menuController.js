const logger = require("../../config/logger");
const { sendControllerError } = require("../../config/errorResponses");
const menuService = require("./menuService");

const getMenus = async (req, res) => {
    try {
        const menus = await menuService.getMenus();
        return res.json(menus);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MENU_LIST_FAILED",
            message: "Unable to load menus right now.",
        });
    }
};

const getMenuItemTargets = async (req, res) => {
    try {
        const targets = await menuService.getMenuItemTargets(req.query.itemType);
        return res.json(targets);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MENU_TARGETS_LOAD_FAILED",
            message: "Unable to load menu targets right now.",
        });
    }
};

const getMenuById = async (req, res) => {
    try {
        const menu = await menuService.getMenuWithItems(req.params.id);
        return res.json(menu);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MENU_LOAD_FAILED",
            message: "Unable to load this menu.",
        });
    }
};

const createMenu = async (req, res) => {
    try {
        const menu = await menuService.createMenu(req.body);
        return res.status(201).json(menu);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MENU_CREATE_FAILED",
            message: "Unable to create this menu.",
        });
    }
};

const updateMenu = async (req, res) => {
    try {
        const menu = await menuService.updateMenu(req.params.id, req.body);
        return res.json(menu);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MENU_UPDATE_FAILED",
            message: "Unable to save this menu.",
        });
    }
};

const deleteMenu = async (req, res) => {
    try {
        await menuService.deleteMenu(req.params.id);
        return res.status(204).send();
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MENU_DELETE_FAILED",
            message: "Unable to delete this menu.",
        });
    }
};

const getMenuItems = async (req, res) => {
    try {
        const items = await menuService.getMenuItems(req.params.id);
        return res.json(items);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MENU_ITEMS_LOAD_FAILED",
            message: "Unable to load items for this menu.",
        });
    }
};

const createMenuItem = async (req, res) => {
    try {
        const item = await menuService.createMenuItem(req.params.id, req.body);
        return res.status(201).json(item);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MENU_ITEM_CREATE_FAILED",
            message: "Unable to add this menu item.",
        });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const item = await menuService.updateMenuItem(req.params.id, req.params.itemId, req.body);
        return res.json(item);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MENU_ITEM_UPDATE_FAILED",
            message: "Unable to save this menu item.",
        });
    }
};

const deleteMenuItem = async (req, res) => {
    try {
        await menuService.deleteMenuItem(req.params.id, req.params.itemId);
        return res.status(204).send();
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MENU_ITEM_DELETE_FAILED",
            message: "Unable to delete this menu item.",
        });
    }
};

const getPublicMenuByLocation = async (req, res) => {
    try {
        const menu = await menuService.getPublicMenuByLocation(req.params.location);
        return res.json(menu);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_PUBLIC_MENU_LOAD_FAILED",
            message: "Unable to load this menu right now.",
        });
    }
};

module.exports = {
    createMenu,
    createMenuItem,
    deleteMenu,
    deleteMenuItem,
    getMenuById,
    getMenuItemTargets,
    getMenuItems,
    getMenus,
    getPublicMenuByLocation,
    updateMenu,
    updateMenuItem,
};
