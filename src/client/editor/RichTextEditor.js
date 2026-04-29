import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import tinymce from "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/models/dom";
import "tinymce/skins/ui/oxide/skin";
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/code";
import "tinymce/plugins/image";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/preview";
import "tinymce/plugins/table";
import "tinymce/plugins/wordcount";
import "tinymce/skins/content/default/content";

const defaultToolbar = [
    "undo redo | blocks | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify",
    "bullist numlist outdent indent | link image media table | removeformat code preview",
];

const defaultPlugins = [
    "advlist", "autolink", "lists", "link", "image", "media",
    "table", "preview", "code", "wordcount",
];

const defaultContentStyle = `
    body {
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        padding: 16px;
    }

    img {
        max-width: 100%;
        height: auto;
    }
`;

const RichTextEditor = forwardRef(({
    value = "",
    onChange,
    minHeight = 380,
    menubar = "file edit view insert format table",
    toolbar = defaultToolbar,
    plugins = defaultPlugins,
    contentStyle = defaultContentStyle,
}, ref) => {
    const editorRef = useRef(null);

    useImperativeHandle(ref, () => ({
        getEditor() {
            return editorRef.current;
        },
        insertHtml(html) {
            editorRef.current?.insertContent(html);
        },
        insertMedia(media) {
            const editor = editorRef.current;

            if (!editor) {
                return;
            }

            const url = media.url;
            const label = media.altText || media.originalName || "Media";

            if (media.mimeType && media.mimeType.startsWith("image/")) {
                editor.insertContent(`<img src="${tinymce.dom.encode(url)}" alt="${tinymce.dom.encode(label)}" />`);
                return;
            }

            editor.insertContent(
                `<p><a href="${tinymce.dom.encode(url)}" target="_blank" rel="noopener noreferrer">${tinymce.dom.encode(label)}</a></p>`
            );
        },
    }), []);

    return (
        <div className="border rounded overflow-hidden bg-white">
            <style>{`
                .app-richtext-shell .tox-tinymce {
                    border: 0;
                }

                .app-richtext-shell .tox .tox-edit-area__iframe {
                    background: #fff;
                }
            `}</style>
            <div className="app-richtext-shell">
                <Editor
                    value={value}
                    onEditorChange={(nextValue) => onChange(nextValue)}
                    onInit={(_event, editor) => {
                        editorRef.current = editor;
                    }}
                    init={{
                        license_key: "gpl",
                        branding: false,
                        promotion: false,
                        browser_spellcheck: true,
                        contextmenu: "link image table",
                        menubar,
                        min_height: minHeight,
                        resize: "vertical",
                        plugins,
                        toolbar,
                        block_formats: "Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4; Blockquote=blockquote",
                        content_style: contentStyle,
                    }}
                />
            </div>
        </div>
    );
});

export default RichTextEditor;
