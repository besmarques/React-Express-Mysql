const logger = require("../../config/logger");
const menuService = require("./menuService");

const logServerError = (err) => {
    if (err.errno || err.code || err.sqlMessage) {
        logger.error(`${err.errno} - ${err.code} - ${err.sqlMessage}`);
        return;
    }

    logger.error(err);
};

const sendError = (res, err) => {
    if (err.statusCode) {
        return res.status(err.statusCode).json(err.responseBody);
    }

    logServerError(err);
    return res.status(500).json({ message: "Server error" });
};

const getMenus = async (req, res) => {
    try {
        const menus = await menuService.getMenus();
        return res.json(menus);
    } catch (err) {
        return sendError(res, err);
    }
};

const getMenuById = async (req, res) => {
    try {
        const menu = await menuService.getMenuWithItems(req.params.id);
        return res.json(menu);
    } catch (err) {
        return sendError(res, err);
    }
};

const createMenu = async (req, res) => {
    try {
        const menu = await menuService.createMenu(req.body);
        return res.status(201).json(menu);
    } catch (err) {
        return sendError(res, err);
    }
};

const updateMenu = async (req, res) => {
    try {
        const menu = await menuService.updateMenu(req.params.id, req.body);
        return res.json(menu);
    } catch (err) {
        return sendError(res, err);
    }
};

const deleteMenu = async (req, res) => {
    try {
        await menuService.deleteMenu(req.params.id);
        return res.status(204).send();
    } catch (err) {
        return sendError(res, err);
    }
};

const getMenuItems = async (req, res) => {
    try {
        const items = await menuService.getMenuItems(req.params.id);
        return res.json(items);
    } catch (err) {
        return sendError(res, err);
    }
};

const createMenuItem = async (req, res) => {
    try {
        const item = await menuService.createMenuItem(req.params.id, req.body);
        return res.status(201).json(item);
    } catch (err) {
        return sendError(res, err);
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const item = await menuService.updateMenuItem(req.params.id, req.params.itemId, req.body);
        return res.json(item);
    } catch (err) {
        return sendError(res, err);
    }
};

const deleteMenuItem = async (req, res) => {
    try {
        await menuService.deleteMenuItem(req.params.id, req.params.itemId);
        return res.status(204).send();
    } catch (err) {
        return sendError(res, err);
    }
};

const getPublicMenuByLocation = async (req, res) => {
    try {
        const menu = await menuService.getPublicMenuByLocation(req.params.location);
        return res.json(menu);
    } catch (err) {
        return sendError(res, err);
    }
};

module.exports = {
    createMenu,
    createMenuItem,
    deleteMenu,
    deleteMenuItem,
    getMenuById,
    getMenuItems,
    getMenus,
    getPublicMenuByLocation,
    updateMenu,
    updateMenuItem,
};
