import React, { useEffect, useState } from "react";
import axios from "axios";
import getApiErrorMessage from "../utils/apiErrors";

const isImage = (media) => media.mimeType && media.mimeType.startsWith("image/");

const MediaPicker = ({ onSelect }) => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [media, setMedia] = useState([]);

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

    if (isLoading) {
        return <div>Loading media...</div>;
    }

    return (
        <section className="border rounded p-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="h5 mb-0">Media library</h3>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={loadMedia}>Refresh</button>
            </div>
            {error && <div className="alert alert-warning">{error}</div>}
            {media.length === 0 ? (
                <p className="text-muted mb-0">No media uploaded yet.</p>
            ) : (
                <div className="row g-3">
                    {media.map((item) => (
                        <div className="col-sm-6 col-lg-4" key={item.id}>
                            <button
                                type="button"
                                className="btn btn-outline-secondary text-start w-100 h-100"
                                onClick={() => onSelect(item)}
                            >
                                {isImage(item) ? (
                                    <img src={item.url} alt={item.altText || item.originalName} className="img-fluid mb-2" />
                                ) : (
                                    <div className="border rounded p-3 mb-2 text-center">File</div>
                                )}
                                <span className="d-block text-truncate">{item.originalName}</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default MediaPicker;
