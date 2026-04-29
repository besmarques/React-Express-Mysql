const getCmsPublicPath = (type, slug) => {
    if (!slug) {
        return null;
    }

    return type === "page" ? `/${slug}` : `/posts/${slug}`;
};

export default getCmsPublicPath;
