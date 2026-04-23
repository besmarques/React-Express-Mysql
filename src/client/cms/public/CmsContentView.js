import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Context } from "../../store/appContext";
import { getPageTemplate, getPostTemplate } from "../themes/themeRegistry";
import CmsNotFound from "./CmsNotFound";

const endpoints = {
    page: "/api/cms/public/pages",
    post: "/api/cms/public/posts",
};

const CmsContentView = ({ type }) => {
    const { slug } = useParams();
    const { store } = useContext(Context);
    const [content, setContent] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadContent = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${endpoints[type]}/${slug}`);

                if (isMounted) {
                    setContent(response.data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setContent(null);
                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadContent();

        return () => {
            isMounted = false;
        };
    }, [slug, type]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error || !content) {
        return <CmsNotFound />;
    }

    const Template = type === "page"
        ? getPageTemplate(store.cmsTheme, content.template || "default")
        : getPostTemplate(store.cmsTheme);

    return <Template content={content} />;
};

export default CmsContentView;
