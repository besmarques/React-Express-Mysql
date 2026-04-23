import ArchiveTemplate from "./ArchiveTemplate";
import LandingPageTemplate from "./LandingPageTemplate";
import PageTemplate from "./PageTemplate";
import PostTemplate from "./PostTemplate";

const defaultTheme = {
    archiveTemplate: ArchiveTemplate,
    name: "default",
    pageTemplates: {
        default: PageTemplate,
        landing: LandingPageTemplate,
    },
    postTemplate: PostTemplate,
};

export default defaultTheme;
