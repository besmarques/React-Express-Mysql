import React from "react";
import CmsMenu from "../../public/CmsMenu";

const PageTemplate = ({ content }) => (
    <>
        <CmsMenu location="primary" />
        <article className="py-4">
            <header className="mb-4">
                <h1>{content.title}</h1>
                {content.excerpt && <p className="lead text-muted">{content.excerpt}</p>}
            </header>
            <div dangerouslySetInnerHTML={{ __html: content.contentHtml || "" }} />
        </article>
    </>
);

export default PageTemplate;
