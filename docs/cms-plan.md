# Optional CMS Implementation Plan

This plan describes how to evolve the boilerplate into an optional WordPress-like CMS without making every future app a CMS by default.

## Guiding Principles

- Keep the base boilerplate usable without CMS features.
- Put CMS code under dedicated `cms` modules.
- Keep CMS database schema separate from the base user/session schema.
- Use feature flags so CMS routes, pages, and public rendering only load when enabled.
- Start with pages/posts, then add WordPress-like features in layers.

## Target Shape

```text
src/server/cms/
  cmsRoutes.js
  posts/
  media/
  taxonomies/
  menus/
  permissions/

src/server/modules/
  cmsModule.js
  moduleRegistry.js

src/client/cms/
  admin/
  public/
  themes/

src/client/editor/
  RichTextEditor.js
  GrapesPageEditor.js
  markdown.js

src/client/media/
  MediaPicker.js
  mediaFiles.js

src/client/modules/
  cmsModule.js
  coreModule.js
  moduleRegistry.js

db/schema/cms/
  README.md
  cms_posts.sql
  cms_revisions.sql
  cms_terms.sql
  cms_post_terms.sql
  cms_media.sql
  cms_options.sql
  cms_menus.sql
  cms_permissions.sql
```

## Phase 1: CMS Feature Flag

Status: implemented. The CMS module is controlled by `CMS_ENABLED` and exposes `GET /api/cms/health` only when enabled.

1. Add `CMS_ENABLED=false` to `env.example`.
2. Add a config helper that parses CMS feature flags.
3. Add a server module definition under `src/server/modules/cmsModule.js`.
4. Register CMS server routes only when `CMS_ENABLED=true`.
5. Add a lightweight `/api/cms/health` endpoint.
6. Add tests proving CMS routes are unavailable when disabled and available when enabled.
7. Add README documentation explaining how to enable the CMS module.

Expected result: the base app behaves exactly as it does today unless CMS is explicitly enabled.

## Phase 2: CMS Database Schema

Status: implemented. The optional CMS schema lives under `db/schema/cms/` and can be installed after the base schema.

1. Create `db/schema/cms/`.
2. Add `cms_posts.sql`.
3. Add `cms_revisions.sql`.
4. Add `cms_terms.sql`.
5. Add `cms_post_terms.sql`.
6. Add `cms_media.sql`.
7. Add `cms_options.sql`.
8. Add `cms_menus.sql`.
9. Add `cms_permissions.sql`.
10. Document that CMS schema is optional and only needed for CMS projects.

Recommended first `cms_posts` fields:

```text
id
type
status
title
slug
excerpt
content_json
content_html
author_id
parent_id
menu_order
published_at
created_at
updated_at
```

Expected result: CMS projects can install CMS tables without changing the base schema.

## Phase 3: Posts And Pages API

Status: implemented. CMS posts/pages have admin CRUD endpoints and public published-content endpoints under `/api/cms`.

1. Add `src/server/cms/posts/postRoutes.js`.
2. Add `postController.js`.
3. Add `postService.js`.
4. Add `postRepository.js`.
5. Add `postValidation.js`.
6. Implement admin CRUD endpoints:

```text
GET    /api/cms/posts
GET    /api/cms/posts/:id
POST   /api/cms/posts
PUT    /api/cms/posts/:id
DELETE /api/cms/posts/:id
```

7. Implement public read endpoints:

```text
GET /api/cms/public/pages/:slug
GET /api/cms/public/posts/:slug
```

8. Protect admin endpoints with authentication and permission authorization.
9. Keep public endpoints limited to published content.
10. Add tests for draft visibility, published visibility, validation, and authorization.

Expected result: CMS can create, update, list, and publish posts/pages through API.

## Phase 4: Admin CMS Shell

Status: implemented. CMS admin routes are available under `/admin/cms` when `CMS_ENABLED=true` and the user is authenticated with CMS access.

1. Reuse the shared post-login admin layout for CMS screens instead of introducing a nested CMS-only shell.
2. Add admin routes under `/admin/cms`.
3. Add pages:

```text
/admin/cms
/admin/cms/posts
/admin/cms/posts/new
/admin/cms/posts/:id
/admin/cms/pages
/admin/cms/pages/new
/admin/cms/pages/:id
```

4. Add a CMS navigation section to the existing admin UI only when CMS is enabled.
5. Add list views for posts and pages.
6. Add create/edit screens.
7. Add publish/draft controls.
8. Add delete/trash controls.

Expected result: authenticated CMS users can manage posts and pages from the same shared admin area as the rest of the platform.

## Phase 5: Content Editor

Status: implemented with shared TinyMCE for posts and non-builder pages, plus optional GrapesJS for page layouts. The CMS editor stores canonical editor data in `content_json` and submitted HTML in `content_html`.

1. Choose the first editor format:

```text
Option A: Shared rich text editor
Option B: Visual page builder for pages
Option C: Both, with per-page opt-in
```

2. Use the shared rich text editor for posts and standard pages.
3. Allow pages to opt into a visual builder without forcing the whole CMS into that mode.
4. Store canonical content in `content_json`.
5. Store rendered HTML in `content_html` for public rendering speed.
6. Add title, slug, excerpt, status, and publish date fields.
7. Add slug generation from title.
8. Add client-side validation.
9. Add server-side validation.
10. Keep media insertion wired into the shared editor path.

Expected result: editors can write and save real page/post content.

## Phase 6: Public CMS Rendering

Status: implemented. Public CMS pages render at `/:slug`, public CMS posts render at `/posts/:slug`, taxonomy archives render at `/category/:slug` and `/tag/:slug`, and CMS public routes sit after explicit app/admin routes.

1. Add `src/client/cms/public/CmsPage.js`.
2. Add `src/client/cms/public/CmsPost.js`.
3. Add public routes only when CMS is enabled.
4. Render published pages by slug.
5. Render published posts by slug.
6. Add a not-found state for missing or unpublished content.
7. Make sure CMS catch-all routes do not break normal app routes.

Recommended route order:

```text
Specific app routes first
CMS public routes after normal app routes
Final not-found route last
```

Expected result: CMS content can power public pages while the base app routes remain intact.

## Phase 7: Revisions

Status: implemented. CMS updates create revisions, admins can list/detail/restore revisions, and the editor shows a revision history panel.

1. Save a revision every time a post/page is updated.
2. Store previous title, slug, status, and content.
3. Add revision list endpoint.
4. Add revision detail endpoint.
5. Add restore revision endpoint.
6. Add admin UI for viewing and restoring revisions.
7. Add tests for revision creation and restore behavior.

Expected result: editors can recover previous versions of content.

## Phase 8: Taxonomies

Status: implemented. CMS categories and tags use `cms_terms` with `cms_post_terms`, include admin CRUD endpoints, post assignment, an admin term manager, editor assignment controls, and public archive filtering.

1. Add categories and tags using a shared `cms_terms` table.
2. Use `taxonomy` values such as `category` and `tag`.
3. Add `cms_post_terms` join table.
4. Add endpoints to list, create, update, and delete terms.
5. Add assignment UI in the content editor.
6. Add public filtering by category/tag.

Expected result: posts can be organized like WordPress content.

## Phase 9: Media Library

Status: implemented. CMS media supports JSON/base64 uploads, configurable local storage, metadata records, mime/size validation, admin list/update/delete, and editor insertion into the shared rich text editor.

1. Add upload endpoint.
2. Store files under a configurable media directory.
3. Add `cms_media` metadata records.
4. Validate mime type and size.
5. Add media list endpoint.
6. Add media delete endpoint.
7. Add media selector in the content editor.
8. Add alt text and captions.

Expected result: editors can upload and reuse images/files from a CMS media library.

## Phase 10: Menus

Status: implemented. CMS menus support admin CRUD, menu item management, custom/page/post/category/tag item types, public lookup by location, and primary-menu rendering on CMS public templates.

1. Add `cms_menus` and menu item data.
2. Support links to pages, posts, custom URLs, and categories.
3. Add admin menu builder.
4. Add endpoint to fetch active menus.
5. Update public templates to render configured menus.

Expected result: navigation can be managed from the CMS instead of hardcoded React links.

## Phase 11: Theme And Template System

Status: implemented. The CMS has a client-side theme registry, a default theme with page/post/archive templates, `CMS_THEME=default`, and page-level template selection through the editor.

1. Add a default CMS theme:

```text
src/client/cms/themes/default/
  PageTemplate.js
  PostTemplate.js
  ArchiveTemplate.js
```

2. Add a theme registry.
3. Add `CMS_THEME=default` to env config.
4. Map content types to templates.
5. Add support for custom page templates.
6. Keep the normal app layout independent from CMS templates.

Expected result: CMS public rendering can be themed without changing core CMS logic.

## Phase 12: Roles And Permissions

Status: implemented. CMS access now supports role-based permissions via `cms_roles`, `cms_permissions`, `cms_user_roles`, and `cms_role_permissions`, while `is_admin` still works as a bootstrap shortcut.

1. Replace CMS admin checks with permission checks.
2. Add role tables:

```text
roles
permissions
user_roles
role_permissions
```

3. Add permissions:

```text
cms.posts.read
cms.posts.create
cms.posts.update
cms.posts.publish
cms.posts.delete
cms.media.manage
cms.menus.manage
cms.taxonomies.manage
cms.settings.manage
users.manage
```

4. Keep `is_admin` as a simple bootstrap shortcut only if needed.
5. Add tests for permission boundaries.

Expected result: CMS access can be delegated without giving every editor full admin power.

## Phase 13: Plugin-Like Module Registry

Status: implemented. CMS now registers through shared server/client module registries, and admin/module entry points are driven by module metadata instead of hardcoded CMS wiring.

1. Avoid a full plugin runtime at first.
2. Add a simple module registry:

```text
src/server/modules/
src/client/modules/
```

3. Let modules expose:

```text
name
enabled(config)
registerServer(app)
clientRoutes
navigationItems
sidebarItems
route order
```

4. Move CMS registration into this system.
5. Document how future app modules can follow the same pattern.

Expected result: CMS becomes one optional module among possible future modules.

## Phase 14: Documentation And Diagrams

Status: implemented. The architecture docs now include CMS module diagrams, a CMS database diagram, publish and editor-save sequence flows, README setup notes, a CMS enablement checklist, and schema notes.

1. Update `docs/architecture.md` with CMS module diagrams.
2. Add CMS database diagram.
3. Add CMS publish flow sequence diagram.
4. Add CMS editor save flow sequence diagram.
5. Add README setup instructions.
6. Add a CMS enablement checklist.

Expected result: future maintainers can understand the CMS without reverse-engineering the code.

## First Milestone

The first useful CMS milestone should be small:

1. `CMS_ENABLED=false` by default.
2. CMS module registration.
3. CMS schema folder.
4. `cms_posts` table.
5. Posts/pages CRUD API.
6. Admin list and editor.
7. Public rendering for published pages.
8. Tests for enabled/disabled behavior.

Do not start with media, themes, plugins, revisions, and roles all at once. Add them after the CMS module boundary is proven.
