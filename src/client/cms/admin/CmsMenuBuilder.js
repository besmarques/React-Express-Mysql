import React, { useEffect, useState } from "react";
import axios from "axios";
import CmsAdminLayout from "./CmsAdminLayout";
import { slugify } from "../editor/markdown";
import getApiErrorMessage from "../../utils/apiErrors";

const emptyMenuForm = {
    name: "",
    slug: "",
    location: "primary",
};

const emptyItemForm = {
    label: "",
    itemType: "custom",
    targetId: "",
    url: "",
    parentId: "",
    sortOrder: 0,
};

const CmsMenuBuilder = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSlugTouched, setIsSlugTouched] = useState(false);
    const [menus, setMenus] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [menuForm, setMenuForm] = useState(emptyMenuForm);
    const [itemForm, setItemForm] = useState(emptyItemForm);
    const [editingItemId, setEditingItemId] = useState(null);

    const loadMenus = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/cms/menus");
            setMenus(response.data);
            setError(null);
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to load menus."));
        } finally {
            setIsLoading(false);
        }
    };

    const loadMenu = async (menuId) => {
        try {
            const response = await axios.get(`/api/cms/menus/${menuId}`);
            setSelectedMenu(response.data);
            setMenuForm({
                name: response.data.name || "",
                slug: response.data.slug || "",
                location: response.data.location || "",
            });
            setIsSlugTouched(true);
            setError(null);
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to load menu."));
        }
    };

    useEffect(() => {
        loadMenus();
    }, []);

    const handleMenuFormChange = (event) => {
        const { name, value } = event.target;
        const updates = { [name]: value };

        if (name === "name" && !isSlugTouched) {
            updates.slug = slugify(value);
        }

        if (name === "slug") {
            setIsSlugTouched(true);
        }

        setMenuForm({
            ...menuForm,
            ...updates,
        });
    };

    const handleItemFormChange = (event) => {
        const { name, value } = event.target;
        setItemForm({
            ...itemForm,
            [name]: name === "sortOrder" ? Number(value) : value,
        });
    };

    const resetMenuForm = () => {
        setSelectedMenu(null);
        setMenuForm(emptyMenuForm);
        setItemForm(emptyItemForm);
        setEditingItemId(null);
        setIsSlugTouched(false);
    };

    const resetItemForm = () => {
        setItemForm(emptyItemForm);
        setEditingItemId(null);
    };

    const handleSaveMenu = async (event) => {
        event.preventDefault();

        try {
            let response;

            if (selectedMenu) {
                response = await axios.put(`/api/cms/menus/${selectedMenu.id}`, menuForm);
            } else {
                response = await axios.post("/api/cms/menus", menuForm);
            }

            await loadMenus();
            await loadMenu(response.data.id);
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to save menu."));
        }
    };

    const handleDeleteMenu = async (menuId) => {
        try {
            await axios.delete(`/api/cms/menus/${menuId}`);
            await loadMenus();

            if (selectedMenu && selectedMenu.id === menuId) {
                resetMenuForm();
            }
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to delete menu."));
        }
    };

    const toApiItemPayload = () => ({
        ...itemForm,
        parentId: itemForm.parentId || null,
        targetId: itemForm.targetId || null,
        url: itemForm.url || null,
    });

    const handleSaveItem = async (event) => {
        event.preventDefault();

        if (!selectedMenu) {
            setError("Save or select a menu before adding items.");
            return;
        }

        try {
            if (editingItemId) {
                await axios.put(`/api/cms/menus/${selectedMenu.id}/items/${editingItemId}`, toApiItemPayload());
            } else {
                await axios.post(`/api/cms/menus/${selectedMenu.id}/items`, toApiItemPayload());
            }

            resetItemForm();
            await loadMenu(selectedMenu.id);
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to save menu item."));
        }
    };

    const handleEditItem = (item) => {
        setEditingItemId(item.id);
        setItemForm({
            label: item.label || "",
            itemType: item.itemType || "custom",
            targetId: item.targetId || "",
            url: item.url || "",
            parentId: item.parentId || "",
            sortOrder: item.sortOrder || 0,
        });
    };

    const handleDeleteItem = async (itemId) => {
        try {
            await axios.delete(`/api/cms/menus/${selectedMenu.id}/items/${itemId}`);
            await loadMenu(selectedMenu.id);
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to delete menu item."));
        }
    };

    return (
        <CmsAdminLayout>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h4 mb-0">Menus</h2>
                <button type="button" className="btn btn-outline-secondary" onClick={resetMenuForm}>New menu</button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row g-4">
                <div className="col-lg-3">
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="list-group">
                            {menus.length === 0 && <div className="text-muted">No menus yet.</div>}
                            {menus.map((menu) => (
                                <button
                                    type="button"
                                    className={`list-group-item list-group-item-action ${selectedMenu && selectedMenu.id === menu.id ? "active" : ""}`}
                                    key={menu.id}
                                    onClick={() => loadMenu(menu.id)}
                                >
                                    {menu.name}
                                    {menu.location && <span className="d-block small">{menu.location}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="col-lg-4">
                    <form className="border rounded p-3 mb-4" onSubmit={handleSaveMenu}>
                        <h3 className="h5">{selectedMenu ? "Edit menu" : "New menu"}</h3>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="menuName">Name</label>
                            <input id="menuName" name="name" className="form-control" value={menuForm.name} onChange={handleMenuFormChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="menuSlug">Slug</label>
                            <input id="menuSlug" name="slug" className="form-control" value={menuForm.slug} onChange={handleMenuFormChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="menuLocation">Location</label>
                            <input id="menuLocation" name="location" className="form-control" value={menuForm.location} onChange={handleMenuFormChange} />
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary">Save menu</button>
                            {selectedMenu && (
                                <button type="button" className="btn btn-outline-danger" onClick={() => handleDeleteMenu(selectedMenu.id)}>Delete</button>
                            )}
                        </div>
                    </form>
                    <form className="border rounded p-3" onSubmit={handleSaveItem}>
                        <h3 className="h5">{editingItemId ? "Edit item" : "New item"}</h3>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="itemLabel">Label</label>
                            <input id="itemLabel" name="label" className="form-control" value={itemForm.label} onChange={handleItemFormChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="itemType">Type</label>
                            <select id="itemType" name="itemType" className="form-select" value={itemForm.itemType} onChange={handleItemFormChange}>
                                <option value="custom">Custom URL</option>
                                <option value="page">Page</option>
                                <option value="post">Post</option>
                                <option value="category">Category</option>
                                <option value="tag">Tag</option>
                            </select>
                        </div>
                        {itemForm.itemType === "custom" ? (
                            <div className="mb-3">
                                <label className="form-label" htmlFor="itemUrl">URL</label>
                                <input id="itemUrl" name="url" className="form-control" value={itemForm.url} onChange={handleItemFormChange} />
                            </div>
                        ) : (
                            <div className="mb-3">
                                <label className="form-label" htmlFor="targetId">Target id</label>
                                <input id="targetId" name="targetId" className="form-control" value={itemForm.targetId} onChange={handleItemFormChange} />
                            </div>
                        )}
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="parentId">Parent id</label>
                                <input id="parentId" name="parentId" className="form-control" value={itemForm.parentId} onChange={handleItemFormChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="sortOrder">Sort</label>
                                <input id="sortOrder" name="sortOrder" className="form-control" type="number" value={itemForm.sortOrder} onChange={handleItemFormChange} />
                            </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            <button type="submit" className="btn btn-primary" disabled={!selectedMenu}>Save item</button>
                            {editingItemId && (
                                <button type="button" className="btn btn-outline-secondary" onClick={resetItemForm}>Cancel</button>
                            )}
                        </div>
                    </form>
                </div>
                <div className="col-lg-5">
                    <section className="border rounded p-3">
                        <h3 className="h5">Items</h3>
                        {!selectedMenu ? (
                            <p className="text-muted mb-0">Select a menu to manage items.</p>
                        ) : selectedMenu.items.length === 0 ? (
                            <p className="text-muted mb-0">No items yet.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Label</th>
                                            <th>Type</th>
                                            <th>Sort</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedMenu.items.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.label}</td>
                                                <td>{item.itemType}</td>
                                                <td>{item.sortOrder}</td>
                                                <td className="text-end">
                                                    <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditItem(item)}>Edit</button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </CmsAdminLayout>
    );
};

export default CmsMenuBuilder;
