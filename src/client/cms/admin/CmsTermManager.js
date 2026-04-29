import React, { useEffect, useState } from "react";
import axios from "axios";
import { slugify } from "../../editor/markdown";
import getApiErrorMessage from "../../utils/apiErrors";

const emptyForm = {
    taxonomy: "category",
    name: "",
    slug: "",
    description: "",
};

const CmsTermManager = () => {
    const [error, setError] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [terms, setTerms] = useState([]);
    const [editingTermId, setEditingTermId] = useState(null);
    const [isSlugTouched, setIsSlugTouched] = useState(false);

    const loadTerms = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/cms/terms");
            setTerms(response.data);
            setError(null);
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to load categories and tags."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTerms();
    }, []);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingTermId(null);
        setIsSlugTouched(false);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        const updates = { [name]: value };

        if (name === "name" && !isSlugTouched) {
            updates.slug = slugify(value);
        }

        if (name === "slug") {
            setIsSlugTouched(true);
        }

        setForm({
            ...form,
            ...updates,
        });
    };

    const handleEdit = (term) => {
        setEditingTermId(term.id);
        setForm({
            taxonomy: term.taxonomy,
            name: term.name || "",
            slug: term.slug || "",
            description: term.description || "",
        });
        setIsSlugTouched(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            if (editingTermId) {
                await axios.put(`/api/cms/terms/${editingTermId}`, form);
            } else {
                await axios.post("/api/cms/terms", form);
            }

            resetForm();
            await loadTerms();
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to save term."));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (termId) => {
        try {
            await axios.delete(`/api/cms/terms/${termId}`);
            setTerms(terms.filter((term) => term.id !== termId));

            if (editingTermId === termId) {
                resetForm();
            }
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to delete term."));
        }
    };

    return (
        <>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h4 mb-0">Categories and tags</h2>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row g-4">
                <div className="col-lg-4">
                    <form className="border rounded p-3" onSubmit={handleSubmit}>
                        <h3 className="h5">{editingTermId ? "Edit term" : "New term"}</h3>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="taxonomy">Taxonomy</label>
                            <select id="taxonomy" name="taxonomy" className="form-select" value={form.taxonomy} onChange={handleChange}>
                                <option value="category">Category</option>
                                <option value="tag">Tag</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="name">Name</label>
                            <input id="name" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="slug">Slug</label>
                            <input id="slug" name="slug" className="form-control" value={form.slug} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="description">Description</label>
                            <textarea id="description" name="description" className="form-control" rows="3" value={form.description} onChange={handleChange} />
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                            {editingTermId && (
                                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
                <div className="col-lg-8">
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Slug</th>
                                        <th>Taxonomy</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {terms.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-muted">No categories or tags yet.</td>
                                        </tr>
                                    )}
                                    {terms.map((term) => (
                                        <tr key={term.id}>
                                            <td>{term.name}</td>
                                            <td>{term.slug}</td>
                                            <td>{term.taxonomy}</td>
                                            <td className="text-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => handleEdit(term)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(term.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CmsTermManager;
