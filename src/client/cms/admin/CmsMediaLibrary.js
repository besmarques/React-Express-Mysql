import React, { useEffect, useState } from "react";
import axios from "axios";
import readFileAsDataUrl from "../../media/mediaFiles";
import getApiErrorMessage from "../../utils/apiErrors";

const emptyUploadForm = {
    altText: "",
    caption: "",
};

const CmsMediaLibrary = () => {
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);
    const [form, setForm] = useState(emptyUploadForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [media, setMedia] = useState([]);
    const [editingMediaId, setEditingMediaId] = useState(null);
    const [editingForm, setEditingForm] = useState(emptyUploadForm);

    const loadMedia = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/cms/media");
            setMedia(response.data);
            setError(null);
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to load media."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMedia();
    }, []);

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleEditingFormChange = (event) => {
        const { name, value } = event.target;
        setEditingForm({
            ...editingForm,
            [name]: value,
        });
    };

    const handleUpload = async (event) => {
        event.preventDefault();

        if (!file) {
            setError("Choose a file to upload.");
            return;
        }

        setIsSaving(true);

        try {
            const data = await readFileAsDataUrl(file);
            await axios.post("/api/cms/media", {
                altText: form.altText,
                caption: form.caption,
                data,
                mimeType: file.type,
                originalName: file.name,
            });

            setFile(null);
            setForm(emptyUploadForm);
            await loadMedia();
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to upload media."));
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (item) => {
        setEditingMediaId(item.id);
        setEditingForm({
            altText: item.altText || "",
            caption: item.caption || "",
        });
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.put(`/api/cms/media/${editingMediaId}`, editingForm);
            setMedia(media.map((item) => (item.id === editingMediaId ? response.data : item)));
            setEditingMediaId(null);
            setEditingForm(emptyUploadForm);
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to update media."));
        }
    };

    const handleDelete = async (mediaId) => {
        try {
            await axios.delete(`/api/cms/media/${mediaId}`);
            setMedia(media.filter((item) => item.id !== mediaId));
        } catch (err) {
            setError(getApiErrorMessage(err, "Unable to delete media."));
        }
    };

    return (
        <>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h4 mb-0">Media</h2>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row g-4">
                <div className="col-lg-4">
                    <form className="border rounded p-3" onSubmit={handleUpload}>
                        <h3 className="h5">Upload media</h3>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="mediaFile">File</label>
                            <input
                                id="mediaFile"
                                className="form-control"
                                type="file"
                                onChange={(event) => setFile(event.target.files[0] || null)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="altText">Alt text</label>
                            <input id="altText" name="altText" className="form-control" value={form.altText} onChange={handleFormChange} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="caption">Caption</label>
                            <textarea id="caption" name="caption" className="form-control" rows="3" value={form.caption} onChange={handleFormChange} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? "Uploading..." : "Upload"}
                        </button>
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
                                        <th>File</th>
                                        <th>Type</th>
                                        <th>Size</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {media.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-muted">No media uploaded yet.</td>
                                        </tr>
                                    )}
                                    {media.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <a href={item.url} target="_blank" rel="noreferrer">{item.originalName}</a>
                                                {item.altText && <div className="text-muted small">{item.altText}</div>}
                                                {editingMediaId === item.id && (
                                                    <form className="mt-2" onSubmit={handleUpdate}>
                                                        <input
                                                            name="altText"
                                                            className="form-control form-control-sm mb-2"
                                                            value={editingForm.altText}
                                                            onChange={handleEditingFormChange}
                                                            placeholder="Alt text"
                                                        />
                                                        <textarea
                                                            name="caption"
                                                            className="form-control form-control-sm mb-2"
                                                            rows="2"
                                                            value={editingForm.caption}
                                                            onChange={handleEditingFormChange}
                                                            placeholder="Caption"
                                                        />
                                                        <button type="submit" className="btn btn-sm btn-primary me-2">Save</button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEditingMediaId(null)}>Cancel</button>
                                                    </form>
                                                )}
                                            </td>
                                            <td>{item.mimeType}</td>
                                            <td>{item.size}</td>
                                            <td className="text-end">
                                                <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(item)}>Edit</button>
                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>Delete</button>
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

export default CmsMediaLibrary;
