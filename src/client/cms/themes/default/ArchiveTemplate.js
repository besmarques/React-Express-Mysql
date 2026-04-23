import React from "react";
import { Link } from "react-router-dom";
import CmsMenu from "../../public/CmsMenu";

const labels = {
    category: "Category",
    tag: "Tag",
};

const ArchiveTemplate = ({ posts, slug, taxonomy }) => (
    <>
        <CmsMenu location="primary" />
        <section className="py-4">
            <header className="mb-4">
                <h1>{labels[taxonomy]}: {slug}</h1>
            </header>
            {posts.length === 0 ? (
                <p className="text-muted">No published posts found.</p>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {posts.map((post) => (
                        <article className="border-bottom pb-3" key={post.id}>
                            <h2 className="h4">
                                <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                            </h2>
                            {post.excerpt && <p className="text-muted mb-0">{post.excerpt}</p>}
                        </article>
                    ))}
                </div>
            )}
        </section>
    </>
);

export default ArchiveTemplate;
