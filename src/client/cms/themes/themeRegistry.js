import defaultTheme from "./default";

const themes = {
    default: defaultTheme,
};

const getTheme = (themeName) => themes[themeName] || defaultTheme;

export const getArchiveTemplate = (themeName) => getTheme(themeName).archiveTemplate;

export const getPageTemplate = (themeName, templateName) => {
    const theme = getTheme(themeName);
    return theme.pageTemplates[templateName] || theme.pageTemplates.default;
};

export const getPostTemplate = (themeName) => getTheme(themeName).postTemplate;

export const pageTemplateOptions = [
    { label: "Default", value: "default" },
    { label: "Landing", value: "landing" },
];

export default themes;
