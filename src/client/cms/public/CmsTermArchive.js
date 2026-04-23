import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Context } from "../../store/appContext";
import { getArchiveTemplate } from "../themes/themeRegistry";
import CmsNotFound from "./CmsNotFound";

const CmsTermArchive = ({ taxonomy }) => {
    const { slug } = useParams();
    const { store } = useContext(Context);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadPosts = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`/api/cms/public/terms/${taxonomy}/${slug}/posts`);

                if (isMounted) {
                    setPosts(response.data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setPosts([]);
                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadPosts();

        return () => {
            isMounted = false;
        };
    }, [slug, taxonomy]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <CmsNotFound />;
    }

    const Template = getArchiveTemplate(store.cmsTheme);

    return <Template posts={posts} slug={slug} taxonomy={taxonomy} />;
};

export default CmsTermArchive;
