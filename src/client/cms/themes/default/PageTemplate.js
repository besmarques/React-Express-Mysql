import React from "react";
import CmsMenu from "../../public/CmsMenu";

const isBuilderPage = (content) => content?.contentJson?.format === "grapesjs";

const PageTemplate = ({ content }) => {
    if (isBuilderPage(content)) {
        return (
            <>
                <CmsMenu location="primary" />
                <div dangerouslySetInnerHTML={{ __html: content.contentHtml || "" }} />
            </>
        );
    }

    return (
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
};

export default PageTemplate;
