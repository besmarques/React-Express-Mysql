import React from "react";
import CmsMenu from "../../public/CmsMenu";

const isBuilderPage = (content) => content?.contentJson?.format === "grapesjs";

const LandingPageTemplate = ({ content }) => {
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
                <header className="py-5 mb-4 border-bottom">
                    <h1 className="display-5">{content.title}</h1>
                    {content.excerpt && <p className="lead text-muted mb-0">{content.excerpt}</p>}
                </header>
                <div dangerouslySetInnerHTML={{ __html: content.contentHtml || "" }} />
            </article>
        </>
    );
};

export default LandingPageTemplate;
