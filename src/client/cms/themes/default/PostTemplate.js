import React from "react";
import CmsMenu from "../../public/CmsMenu";

const PostTemplate = ({ content }) => (
    <>
        <CmsMenu location="primary" />
        <article className="py-4">
            <header className="mb-4">
                <p className="text-muted mb-2">{content.publishedAt || content.createdAt || ""}</p>
                <h1>{content.title}</h1>
                {content.excerpt && <p className="lead text-muted">{content.excerpt}</p>}
            </header>
            <div dangerouslySetInnerHTML={{ __html: content.contentHtml || "" }} />
        </article>
    </>
);

export default PostTemplate;
