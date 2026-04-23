import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CmsAdminLayout from "./CmsAdminLayout";
import getApiErrorMessage from "../../utils/apiErrors";

const labels = {
    page: {
        plural: "Pages",
        singular: "Page",
        newPath: "/admin/cms/pages/new",
    },
    post: {
        plural: "Posts",
        singular: "Post",
        newPath: "/admin/cms/posts/new",
    },
};

const CmsPostList = ({ type }) => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const copy = labels[type];

    const loadPosts = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/cms/posts?type=${type}`);
            setPosts(response.data);
            setError(null);
        } catch (err) {
            setError(getApiErrorMessage(err, `Unable to load ${copy.plural.toLowerCase()}.`));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [type]);

    const handleDelete = async (postId) => {
        try {
            await axios.delete(`/api/cms/posts/${postId}`);
            setPosts(posts.filter((post) => post.id !== postId));
        } catch (err) {
            setError(getApiErrorMessage(err, `Unable to delete ${copy.singular.toLowerCase()}.`));
        }
    };

    const handleMoveToTrash = async (post) => {
        try {
            const response = await axios.put(`/api/cms/posts/${post.id}`, { status: "trash" });
            setPosts(posts.map((item) => (item.id === post.id ? response.data : item)));
        } catch (err) {
            setError(getApiErrorMessage(err, `Unable to move ${copy.singular.toLowerCase()} to trash.`));
        }
    };

    return (
        <CmsAdminLayout>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h4 mb-0">{copy.plural}</h2>
                <Link to={copy.newPath} className="btn btn-primary">New {copy.singular.toLowerCase()}</Link>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th>Published</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-muted">No {copy.plural.toLowerCase()} yet.</td>
                                </tr>
                            )}
                            {posts.map((post) => (
                                <tr key={post.id}>
                                    <td>{post.title}</td>
                                    <td>{post.slug}</td>
                                    <td>{post.status}</td>
                                    <td>{post.publishedAt || "-"}</td>
                                    <td className="text-end">
                                        <Link
                                            to={`/admin/cms/${type === "page" ? "pages" : "posts"}/${post.id}`}
                                            className="btn btn-sm btn-outline-primary me-2"
                                        >
                                            Edit
                                        </Link>
                                        {post.status !== "trash" && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-warning me-2"
                                                onClick={() => handleMoveToTrash(post)}
                                            >
                                                Trash
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(post.id)}
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
        </CmsAdminLayout>
    );
};

export default CmsPostList;
