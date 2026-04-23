const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderInlineMarkdown = (value) => escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

const renderMarkdownBlock = (block) => {
    if (block.startsWith("### ")) {
        return `<h3>${renderInlineMarkdown(block.slice(4))}</h3>`;
    }

    if (block.startsWith("## ")) {
        return `<h2>${renderInlineMarkdown(block.slice(3))}</h2>`;
    }

    if (block.startsWith("# ")) {
        return `<h1>${renderInlineMarkdown(block.slice(2))}</h1>`;
    }

    return `<p>${renderInlineMarkdown(block).replace(/\n/g, "<br>")}</p>`;
};

export const renderMarkdownToHtml = (markdown = "") => markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(renderMarkdownBlock)
    .join("");

export const slugify = (value = "") => value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

