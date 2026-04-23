import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import CmsAdminLayout from "./CmsAdminLayout";
import MediaPicker from "../media/MediaPicker";
import { renderMarkdownToHtml, slugify } from "../editor/markdown";
import { pageTemplateOptions } from "../themes/themeRegistry";
import getApiErrorMessage from "../../utils/apiErrors";

const getBackPath = (type) => `/admin/cms/${type === "page" ? "pages" : "posts"}`;

const emptyForm = (type) => ({
    type,
    status: "draft",
    title: "",
    slug: "",
    template: "default",
    excerpt: "",
    contentMarkdown: "",
    menuOrder: 0,
    publishedAt: "",
});

const emptyTerms = {
    category: [],
    tag: [],
};

const taxonomyLabels = {
    category: "Categories",
    tag: "Tags",
};

const CmsPostEditor = ({ type }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [error, setError] = useState(null);
    const [form, setForm] = useState(emptyForm(type));
    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSaving, setIsSaving] = useState(false);
    const [isSlugTouched, setIsSlugTouched] = useState(isEditing);
    const [revisionError, setRevisionError] = useState(null);
    const [revisions, setRevisions] = useState([]);
    const [termError, setTermError] = useState(null);
    const [availableTerms, setAvailableTerms] = useState(emptyTerms);
    const [selectedTermIds, setSelectedTermIds] = useState([]);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

    const applyPostToForm = (post) => {
        const contentJson = post.contentJson || {};
        setForm({
            type: post.type,
            status: post.status,
            title: post.title || "",
            slug: post.slug || "",
            template: post.template || "default",
            excerpt: post.excerpt || "",
            contentMarkdown: contentJson.markdown || "",
            menuOrder: post.menuOrder || 0,
            publishedAt: post.publishedAt || "",
        });
        setIsSlugTouched(true);
    };

    const loadRevisions = async () => {
        if (!isEditing) {
            setRevisions([]);
            return;
        }

        try {
            const response = await axios.get(`/api/cms/posts/${id}/revisions`);
            setRevisions(response.data);
            setRevisionError(null);
        } catch (err) {
            setRevisionError(getApiErrorMessage(err, "Unable to load revisions."));
        }
    };

    const loadAvailableTerms = async () => {
        try {
            const [categoryResponse, tagResponse] = await Promise.all([
                axios.get("/api/cms/terms?taxonomy=category"),
                axios.get("/api/cms/terms?taxonomy=tag"),
            ]);

            setAvailableTerms({
                category: categoryResponse.data,
                tag: tagResponse.data,
            });
            setTermError(null);
        } catch (err) {
            setTermError(getApiErrorMessage(err, "Unable to load categories and tags."));
        }
    };

    const loadAssignedTerms = async () => {
        if (!isEditing) {
            setSelectedTermIds([]);
            return;
        }

        try {
            const response = await axios.get(`/api/cms/posts/${id}/terms`);
            setSelectedTermIds(response.data.map((term) => Number(term.id)));
            setTermError(null);
        } catch (err) {
            setTermError(getApiErrorMessage(err, "Unable to load assigned terms."));
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadPost = async () => {
            loadAvailableTerms();

            if (!isEditing) {
                setForm(emptyForm(type));
                setIsSlugTouched(false);
                setSelectedTermIds([]);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await axios.get(`/api/cms/posts/${id}`);

                if (isMounted) {
                    applyPostToForm(response.data);
                    loadAssignedTerms();
                    loadRevisions();
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(getApiErrorMessage(err, "Unable to load content."));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadPost();

        return () => {
            isMounted = false;
        };
    }, [id, isEditing, type]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        const updates = {
            [name]: name === "menuOrder" ? Number(value) : value,
        };

        if (name === "title" && !isSlugTouched) {
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

    const handleTermToggle = (termId) => {
        const normalizedTermId = Number(termId);

        setSelectedTermIds((currentTermIds) => {
            if (currentTermIds.includes(normalizedTermId)) {
                return currentTermIds.filter((currentTermId) => currentTermId !== normalizedTermId);
            }

            return [...currentTermIds, normalizedTermId];
        });
    };

    const savePostTerms = async (postId) => {
        await axios.put(`/api/cms/posts/${postId}/terms`, {
            termIds: selectedTermIds,
        });
    };

    const handleSelectMedia = (media) => {
        const markdown = media.mimeType && media.mimeType.startsWith("image/")
            ? `![${media.altText || media.originalName}](${media.url})`
            : `[${media.originalName}](${media.url})`;

        setForm({
            ...form,
            contentMarkdown: `${form.contentMarkdown}${form.contentMarkdown ? "\n\n" : ""}${markdown}`,
        });
        setIsMediaPickerOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);

        const payload = {
            ...form,
            contentJson: {
                format: "markdown",
                markdown: form.contentMarkdown,
            },
            contentHtml: renderMarkdownToHtml(form.contentMarkdown),
            publishedAt: form.publishedAt || null,
            template: form.type === "page" ? form.template : null,
        };
        delete payload.contentMarkdown;

        try {
            let savedPost;

            if (isEditing) {
                const response = await axios.put(`/api/cms/posts/${id}`, payload);
                savedPost = response.data;
            } else {
                const response = await axios.post("/api/cms/posts", payload);
                savedPost = response.data;
            }

            await savePostTerms(savedPost.id);
            navigate(getBackPath(form.type));
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to save content."));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = () => {
            setForm({
                ...form,
                status: "published",
                publishedAt: form.publishedAt || new Date().toISOString(),
            });
    };

    const handleDraft = () => {
        setForm({
            ...form,
            status: "draft",
        });
    };

    const handleRestoreRevision = async (revisionId) => {
        try {
            const response = await axios.post(`/api/cms/posts/${id}/revisions/${revisionId}/restore`);
            applyPostToForm(response.data);
            await loadRevisions();
            setRevisionError(null);
        } catch (err) {
            setRevisionError(getApiErrorMessage(err, "Unable to restore revision."));
        }
    };

    const title = `${isEditing ? "Edit" : "New"} ${type}`;

    return (
        <CmsAdminLayout>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h4 mb-0">{title}</h2>
                <Link to={getBackPath(type)} className="btn btn-outline-secondary">Back</Link>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-md-8">
                            <label className="form-label" htmlFor="title">Title</label>
                            <input id="title" name="title" className="form-control" value={form.title} onChange={handleChange} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label" htmlFor="slug">Slug</label>
                            <input id="slug" name="slug" className="form-control" value={form.slug} onChange={handleChange} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label" htmlFor="type">Type</label>
                            <select id="type" name="type" className="form-select" value={form.type} onChange={handleChange}>
                                <option value="page">Page</option>
                                <option value="post">Post</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label" htmlFor="status">Status</label>
                            <select id="status" name="status" className="form-select" value={form.status} onChange={handleChange}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="private">Private</option>
                                <option value="trash">Trash</option>
                            </select>
                        </div>
                        {form.type === "page" && (
                            <div className="col-md-4">
                                <label className="form-label" htmlFor="template">Template</label>
                                <select id="template" name="template" className="form-select" value={form.template} onChange={handleChange}>
                                    {pageTemplateOptions.map((option) => (
                                        <option value={option.value} key={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="col-md-4">
                            <label className="form-label" htmlFor="publishedAt">Published at</label>
                            <input id="publishedAt" name="publishedAt" className="form-control" value={form.publishedAt} onChange={handleChange} />
                        </div>
                        <div className="col-12">
                            <label className="form-label" htmlFor="excerpt">Excerpt</label>
                            <textarea id="excerpt" name="excerpt" className="form-control" rows="2" value={form.excerpt} onChange={handleChange} />
                        </div>
                        <div className="col-12">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <label className="form-label mb-0" htmlFor="contentMarkdown">Content</label>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => setIsMediaPickerOpen(!isMediaPickerOpen)}
                                >
                                    {isMediaPickerOpen ? "Close media" : "Insert media"}
                                </button>
                            </div>
                            <textarea
                                id="contentMarkdown"
                                name="contentMarkdown"
                                className="form-control font-monospace"
                                rows="12"
                                value={form.contentMarkdown}
                                onChange={handleChange}
                            />
                        </div>
                        {isMediaPickerOpen && (
                            <div className="col-12">
                                <MediaPicker onSelect={handleSelectMedia} />
                            </div>
                        )}
                        <div className="col-12">
                            <h3 className="h5">Preview</h3>
                            <div
                                className="border rounded p-3 bg-light"
                                dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(form.contentMarkdown) }}
                            />
                        </div>
                        <div className="col-12">
                            <section className="border rounded p-3">
                                <h3 className="h5">Organization</h3>
                                {termError && <div className="alert alert-warning">{termError}</div>}
                                <div className="row g-3">
                                    {Object.entries(taxonomyLabels).map(([taxonomy, label]) => (
                                        <div className="col-md-6" key={taxonomy}>
                                            <h4 className="h6">{label}</h4>
                                            {availableTerms[taxonomy].length === 0 ? (
                                                <p className="text-muted mb-0">No {label.toLowerCase()} yet.</p>
                                            ) : (
                                                <div className="d-flex flex-column gap-2">
                                                    {availableTerms[taxonomy].map((term) => (
                                                        <label className="form-check" key={term.id}>
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                checked={selectedTermIds.includes(Number(term.id))}
                                                                onChange={() => handleTermToggle(term.id)}
                                                            />
                                                            <span className="form-check-label">{term.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                        <div className="col-12 d-flex gap-2">
                            <button type="button" className="btn btn-outline-secondary" onClick={handleDraft}>Save as draft</button>
                            <button type="button" className="btn btn-outline-success" onClick={handlePublish}>Publish</button>
                            <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                        </div>
                        {isEditing && (
                            <div className="col-12">
                                <section className="border rounded p-3">
                                    <h3 className="h5">Revisions</h3>
                                    {revisionError && <div className="alert alert-danger">{revisionError}</div>}
                                    {revisions.length === 0 ? (
                                        <p className="text-muted mb-0">No revisions yet.</p>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table align-middle mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Saved</th>
                                                        <th>Title</th>
                                                        <th>Status</th>
                                                        <th className="text-end">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {revisions.map((revision) => (
                                                        <tr key={revision.id}>
                                                            <td>{revision.createdAt || "-"}</td>
                                                            <td>{revision.title}</td>
                                                            <td>{revision.status}</td>
                                                            <td className="text-end">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => handleRestoreRevision(revision.id)}
                                                                >
                                                                    Restore
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}
                    </div>
                </form>
            )}
        </CmsAdminLayout>
    );
};

export default CmsPostEditor;
