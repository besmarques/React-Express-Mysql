import React, { useEffect, useRef, useState } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

const defaultValue = {
    css: "",
    html: "",
};

const GrapesPageEditor = ({ value = defaultValue, onChange }) => {
    const containerRef = useRef(null);
    const editorRef = useRef(null);
    const onChangeRef = useRef(onChange);
    const [activePanel, setActivePanel] = useState("blocks");
    const [isPreviewActive, setIsPreviewActive] = useState(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!containerRef.current || editorRef.current) {
            return undefined;
        }

        const canvasHost = containerRef.current.querySelector(".gjs-canvas-host");
        const editor = grapesjs.init({
            container: canvasHost,
            fromElement: false,
            height: "70vh",
            storageManager: false,
            selectorManager: {
                componentFirst: true,
            },
            panels: {
                defaults: [],
            },
            blockManager: {
                appendTo: ".gjs-blocks-panel",
            },
            layerManager: {
                appendTo: ".gjs-layers-panel",
            },
            styleManager: {
                appendTo: ".gjs-styles-panel",
                sectors: [
                    {
                        name: "Layout",
                        open: true,
                        buildProps: ["display", "position", "width", "min-height", "margin", "padding"],
                    },
                    {
                        name: "Typography",
                        open: true,
                        buildProps: ["font-size", "font-weight", "color", "line-height", "text-align"],
                    },
                    {
                        name: "Decorations",
                        open: true,
                        buildProps: ["background-color", "border-radius", "border", "box-shadow"],
                    },
                ],
            },
        });

        editor.Commands.add("show-blocks", {
            run() {
                const blocksPanel = containerRef.current?.querySelector(".gjs-blocks-panel");
                const layersPanel = containerRef.current?.querySelector(".gjs-layers-panel");
                const stylesPanel = containerRef.current?.querySelector(".gjs-styles-panel");

                if (blocksPanel) blocksPanel.style.display = "block";
                if (layersPanel) layersPanel.style.display = "none";
                if (stylesPanel) stylesPanel.style.display = "none";
            },
        });

        editor.Commands.add("show-layers", {
            run() {
                const blocksPanel = containerRef.current?.querySelector(".gjs-blocks-panel");
                const layersPanel = containerRef.current?.querySelector(".gjs-layers-panel");
                const stylesPanel = containerRef.current?.querySelector(".gjs-styles-panel");

                if (blocksPanel) blocksPanel.style.display = "none";
                if (layersPanel) layersPanel.style.display = "block";
                if (stylesPanel) stylesPanel.style.display = "none";
            },
        });

        editor.Commands.add("show-styles", {
            run() {
                const blocksPanel = containerRef.current?.querySelector(".gjs-blocks-panel");
                const layersPanel = containerRef.current?.querySelector(".gjs-layers-panel");
                const stylesPanel = containerRef.current?.querySelector(".gjs-styles-panel");

                if (blocksPanel) blocksPanel.style.display = "none";
                if (layersPanel) layersPanel.style.display = "none";
                if (stylesPanel) stylesPanel.style.display = "block";
            },
        });

        const blockManager = editor.BlockManager;
        blockManager.add("section", {
            label: "Section",
            category: "Layout",
            content: `
                <section class="py-5 px-4">
                    <div class="container">
                        <h2>Section title</h2>
                        <p>Add your content here.</p>
                    </div>
                </section>
            `,
        });
        blockManager.add("two-columns", {
            label: "2 Columns",
            category: "Layout",
            content: `
                <section class="py-4 px-4">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                        <div><h3>Column one</h3><p>Content</p></div>
                        <div><h3>Column two</h3><p>Content</p></div>
                    </div>
                </section>
            `,
        });
        blockManager.add("hero", {
            label: "Hero",
            category: "Sections",
            content: `
                <section style="padding:80px 24px;background:#111827;color:#fff;">
                    <div style="max-width:960px;margin:0 auto;">
                        <p style="text-transform:uppercase;letter-spacing:0;">Intro</p>
                        <h1 style="font-size:48px;line-height:1.1;margin:0 0 16px;">Hero headline</h1>
                        <p style="font-size:18px;max-width:720px;">Explain the page clearly.</p>
                    </div>
                </section>
            `,
        });
        blockManager.add("heading", {
            label: "Heading",
            category: "Basic",
            content: "<h2>Heading</h2>",
        });
        blockManager.add("text", {
            label: "Text",
            category: "Basic",
            content: "<p>Write your text here.</p>",
        });
        blockManager.add("image", {
            label: "Image",
            category: "Media",
            content: { type: "image" },
        });
        blockManager.add("button", {
            label: "Button",
            category: "Basic",
            content: `<a href="#" style="display:inline-block;padding:12px 18px;background:#0d6efd;color:#fff;text-decoration:none;border-radius:4px;">Button</a>`,
        });
        blockManager.add("divider", {
            label: "Divider",
            category: "Basic",
            content: '<hr style="margin:24px 0;" />',
        });
        blockManager.add("quote", {
            label: "Quote",
            category: "Basic",
            content: "<blockquote><p>Quote text.</p><cite>Author</cite></blockquote>",
        });

        editor.setComponents(value.html || "");
        editor.setStyle(value.css || "");

        const emitChange = () => {
            const html = editor.getHtml();
            const css = editor.getCss();

            onChangeRef.current({
                contentHtml: `${css ? `<style>${css}</style>` : ""}${html}`,
                contentJson: {
                    format: "grapesjs",
                    html,
                    css,
                },
            });
        };

        editor.on("update", emitChange);
        editorRef.current = editor;
        editor.runCommand("show-blocks");
        window.requestAnimationFrame(() => {
            editor.refresh();
            editor.Canvas.refresh();
        });
        emitChange();

        const refreshCanvas = () => {
            editor.refresh();
            editor.Canvas.refresh();
        };

        const scrollParent = containerRef.current.closest("main");
        window.addEventListener("resize", refreshCanvas);
        scrollParent?.addEventListener("scroll", refreshCanvas, { passive: true });

        return () => {
            editor.off("update", emitChange);
            window.removeEventListener("resize", refreshCanvas);
            scrollParent?.removeEventListener("scroll", refreshCanvas);
            editor.destroy();
            editorRef.current = null;
        };
    }, []);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }

        const nextHtml = value.html || "";
        const nextCss = value.css || "";

        if (editor.getHtml() !== nextHtml) {
            editor.setComponents(nextHtml);
        }

        if (editor.getCss() !== nextCss) {
            editor.setStyle(nextCss);
        }
    }, [value.css, value.html]);

    const runPanelCommand = (panel) => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }

        const commandMap = {
            blocks: "show-blocks",
            layers: "show-layers",
            styles: "show-styles",
        };

        editor.runCommand(commandMap[panel]);
        setActivePanel(panel);
    };

    const toggleBorders = () => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }

        editor.runCommand("sw-visibility");
    };

    const togglePreview = () => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }

        if (isPreviewActive) {
            editor.stopCommand("preview");
            setIsPreviewActive(false);
            return;
        }

        editor.runCommand("preview");
        setIsPreviewActive(true);
    };

    const toggleFullscreen = () => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }

        editor.runCommand("fullscreen");
    };

    return (
        <div
            ref={containerRef}
            className="border rounded overflow-hidden bg-white"
            style={{ minHeight: "70vh" }}
        >
            <style>{`
                .app-grapes-shell .gjs-one-bg,
                .app-grapes-shell .gjs-two-color,
                .app-grapes-shell .gjs-three-bg,
                .app-grapes-shell .gjs-four-color {
                    background: transparent;
                    color: inherit;
                }

                .app-grapes-shell .gjs-frame-wrapper {
                    background: #eef2f7;
                }

                .app-grapes-shell .gjs-cv-canvas,
                .app-grapes-shell .gjs-cv-canvas #gjs-tools,
                .app-grapes-shell .gjs-cv-canvas .gjs-highlighter,
                .app-grapes-shell .gjs-cv-canvas .gjs-ghost {
                    pointer-events: auto;
                }

                .app-grapes-shell .gjs-block-category {
                    border: 1px solid #d8dee7;
                    border-radius: 6px;
                    margin-bottom: 12px;
                    overflow: hidden;
                    background: #fff;
                }

                .app-grapes-shell .gjs-title {
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    color: #111827;
                    font-weight: 600;
                    padding: 10px 12px;
                }

                .app-grapes-shell .gjs-blocks-c {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 10px;
                    padding: 0;
                }

                .app-grapes-shell .gjs-block {
                    width: 100%;
                    min-height: 88px;
                    margin: 0;
                    border: 1px solid #d8dee7;
                    border-radius: 6px;
                    box-shadow: none;
                    color: #111827;
                    background: #fff;
                    padding: 10px;
                }

                .app-grapes-shell .gjs-block:hover {
                    border-color: #86b7fe;
                    background: #f8fbff;
                }

                .app-grapes-shell .app-gjs-toolbar-btn {
                    border: 1px solid #d0d7e2;
                    border-radius: 6px;
                    background: #fff;
                    color: #111827;
                    padding: 6px 10px;
                    margin: 0;
                    line-height: 1.2;
                }

                .app-grapes-shell .app-gjs-toolbar-btn.is-active {
                    background: #0d6efd;
                    border-color: #0d6efd;
                    color: #fff;
                }

                .app-grapes-shell .gjs-sm-sector {
                    border: 1px solid #d8dee7;
                    border-radius: 6px;
                    margin-bottom: 12px;
                    overflow: hidden;
                }

                .app-grapes-shell .gjs-sm-title {
                    background: #f8fafc;
                    color: #111827;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 10px 12px;
                }

                .app-grapes-shell .gjs-sm-properties {
                    padding: 12px;
                    background: #fff;
                }

                .app-grapes-shell .gjs-layer {
                    background: #fff;
                    border: 1px solid #d8dee7;
                    border-radius: 6px;
                    margin-bottom: 8px;
                    color: #111827;
                }

                .app-grapes-shell .gjs-editor-switcher,
                .app-grapes-shell .gjs-editor-toolbar {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
            `}</style>
            <div className="app-grapes-shell">
                <div className="d-flex border-bottom px-3 py-2 align-items-center justify-content-between bg-light">
                    <div className="gjs-editor-switcher">
                        <button type="button" className={`app-gjs-toolbar-btn ${activePanel === "blocks" ? "is-active" : ""}`} onClick={() => runPanelCommand("blocks")}>Blocks</button>
                        <button type="button" className={`app-gjs-toolbar-btn ${activePanel === "layers" ? "is-active" : ""}`} onClick={() => runPanelCommand("layers")}>Layers</button>
                        <button type="button" className={`app-gjs-toolbar-btn ${activePanel === "styles" ? "is-active" : ""}`} onClick={() => runPanelCommand("styles")}>Styles</button>
                    </div>
                    <div className="gjs-editor-toolbar">
                        <button type="button" className="app-gjs-toolbar-btn" onClick={toggleBorders}>Borders</button>
                        <button type="button" className={`app-gjs-toolbar-btn ${isPreviewActive ? "is-active" : ""}`} onClick={togglePreview}>Preview</button>
                        <button type="button" className="app-gjs-toolbar-btn" onClick={toggleFullscreen}>Fullscreen</button>
                    </div>
                </div>
                <div className="d-flex" style={{ minHeight: "calc(70vh - 49px)" }}>
                    <aside
                        className="border-end bg-white"
                        style={{ width: "280px", overflow: "auto", flexShrink: 0 }}
                    >
                        <div className="px-3 py-2 border-bottom bg-light">
                            <strong>Page Builder</strong>
                        </div>
                        <div className="gjs-blocks-panel p-2" />
                        <div className="gjs-layers-panel p-2" style={{ display: "none" }} />
                        <div className="gjs-styles-panel p-2" style={{ display: "none" }} />
                    </aside>
                    <div className="gjs-canvas-host" style={{ flex: 1, minWidth: 0, position: "relative" }} />
                </div>
            </div>
        </div>
    );
};

export default GrapesPageEditor;
