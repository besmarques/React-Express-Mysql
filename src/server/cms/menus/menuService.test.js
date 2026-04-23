jest.mock("./menuRepository", () => ({
    createMenu: jest.fn(),
    createMenuItem: jest.fn(),
    deleteMenu: jest.fn(),
    deleteMenuItem: jest.fn(),
    findMenuById: jest.fn(),
    findMenuByLocation: jest.fn(),
    findMenuItemById: jest.fn(),
    listMenuItems: jest.fn(),
    listMenus: jest.fn(),
    listPublicMenuItems: jest.fn(),
    updateMenu: jest.fn(),
    updateMenuItem: jest.fn(),
}));

const menuRepository = require("./menuRepository");
const menuService = require("./menuService");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("menuService menus", () => {
    it("lists menus", async () => {
        const menus = [{ id: 1, name: "Primary", slug: "primary", location: "primary" }];
        menuRepository.listMenus.mockResolvedValue(menus);

        await expect(menuService.getMenus()).resolves.toEqual(menus);

        expect(menuRepository.listMenus).toHaveBeenCalled();
    });

    it("returns a menu with its items", async () => {
        const menu = { id: 1, name: "Primary", slug: "primary" };
        const items = [{ id: 2, menuId: 1, label: "Home" }];
        menuRepository.findMenuById.mockResolvedValue(menu);
        menuRepository.listMenuItems.mockResolvedValue(items);

        await expect(menuService.getMenuWithItems(1)).resolves.toEqual({
            ...menu,
            items,
        });
    });

    it("updates existing menus and preserves omitted fields", async () => {
        const existingMenu = { id: 1, name: "Primary", slug: "primary", location: "primary" };
        const updatedMenu = { ...existingMenu, name: "Header" };
        menuRepository.findMenuById.mockResolvedValue(existingMenu);
        menuRepository.updateMenu.mockResolvedValue(updatedMenu);

        await expect(menuService.updateMenu(1, { name: "Header" })).resolves.toEqual(updatedMenu);

        expect(menuRepository.updateMenu).toHaveBeenCalledWith(1, {
            name: "Header",
            slug: "primary",
            location: "primary",
        });
    });

    it("returns 404 when deleting a missing menu", async () => {
        menuRepository.deleteMenu.mockResolvedValue({ affectedRows: 0 });

        await expect(menuService.deleteMenu(99))
            .rejects
            .toMatchObject({
                statusCode: 404,
                responseBody: { message: "CMS menu not found." },
            });
    });
});

describe("menuService items", () => {
    it("creates custom menu items", async () => {
        const menu = { id: 1, name: "Primary" };
        const item = { id: 2, menuId: 1, label: "External", itemType: "custom", url: "https://example.com" };
        menuRepository.findMenuById.mockResolvedValue(menu);
        menuRepository.createMenuItem.mockResolvedValue(item);

        await expect(menuService.createMenuItem(1, {
            label: "External",
            itemType: "custom",
            url: "https://example.com",
        })).resolves.toEqual(item);

        expect(menuRepository.createMenuItem).toHaveBeenCalledWith(1, expect.objectContaining({
            label: "External",
            itemType: "custom",
            sortOrder: 0,
            url: "https://example.com",
        }));
    });

    it("rejects custom menu items without URLs", async () => {
        menuRepository.findMenuById.mockResolvedValue({ id: 1, name: "Primary" });

        await expect(menuService.createMenuItem(1, { label: "Broken", itemType: "custom" }))
            .rejects
            .toMatchObject({
                statusCode: 400,
                responseBody: { message: "Custom menu items require a URL." },
            });

        expect(menuRepository.createMenuItem).not.toHaveBeenCalled();
    });

    it("rejects target menu items without target ids", async () => {
        menuRepository.findMenuById.mockResolvedValue({ id: 1, name: "Primary" });

        await expect(menuService.createMenuItem(1, { label: "Page", itemType: "page" }))
            .rejects
            .toMatchObject({
                statusCode: 400,
                responseBody: { message: "CMS menu item target is required." },
            });

        expect(menuRepository.createMenuItem).not.toHaveBeenCalled();
    });

    it("updates menu items and preserves omitted fields", async () => {
        const existingItem = {
            id: 2,
            menuId: 1,
            label: "Old",
            itemType: "custom",
            url: "/old",
            sortOrder: 0,
        };
        const updatedItem = { ...existingItem, label: "New" };
        menuRepository.findMenuById.mockResolvedValue({ id: 1, name: "Primary" });
        menuRepository.findMenuItemById.mockResolvedValue(existingItem);
        menuRepository.updateMenuItem.mockResolvedValue(updatedItem);

        await expect(menuService.updateMenuItem(1, 2, { label: "New" })).resolves.toEqual(updatedItem);

        expect(menuRepository.updateMenuItem).toHaveBeenCalledWith(1, 2, expect.objectContaining({
            label: "New",
            itemType: "custom",
            url: "/old",
        }));
    });
});

describe("menuService public menus", () => {
    it("returns a public menu tree with resolved URLs", async () => {
        const menu = { id: 1, name: "Primary", slug: "primary", location: "primary" };
        menuRepository.findMenuByLocation.mockResolvedValue(menu);
        menuRepository.listPublicMenuItems.mockResolvedValue([
            { id: 1, parentId: null, label: "Home", itemType: "page", targetId: 5, postSlug: "home", sortOrder: 0 },
            { id: 2, parentId: null, label: "Blog", itemType: "post", targetId: 6, postSlug: "hello", sortOrder: 1 },
            { id: 3, parentId: 1, label: "News", itemType: "category", targetId: 7, termSlug: "news", sortOrder: 0 },
        ]);

        await expect(menuService.getPublicMenuByLocation("primary")).resolves.toEqual({
            ...menu,
            items: [
                {
                    id: 1,
                    label: "Home",
                    itemType: "page",
                    targetId: 5,
                    url: "/home",
                    sortOrder: 0,
                    children: [
                        {
                            id: 3,
                            label: "News",
                            itemType: "category",
                            targetId: 7,
                            url: "/category/news",
                            sortOrder: 0,
                            children: [],
                        },
                    ],
                },
                {
                    id: 2,
                    label: "Blog",
                    itemType: "post",
                    targetId: 6,
                    url: "/posts/hello",
                    sortOrder: 1,
                    children: [],
                },
            ],
        });
    });

    it("returns 404 for missing public menus", async () => {
        menuRepository.findMenuByLocation.mockResolvedValue(undefined);

        await expect(menuService.getPublicMenuByLocation("missing"))
            .rejects
            .toMatchObject({
                statusCode: 404,
                responseBody: { message: "CMS menu not found." },
            });
    });
});
