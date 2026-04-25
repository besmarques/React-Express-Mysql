# React-Express-Mysql

## Description

This project is a full-stack JavaScript application built with React for the front-end and Express.js for the back-end. It uses MySQL for database management and Axios for handling HTTP requests. The application is bundled and transpiled using Webpack and Babel, respectively. Jest is used for testing, and dotenv is used for managing environment variables. The project also utilizes several other packages to enhance development and production workflows.

## Visual Architecture

Architecture diagrams, module maps, and key sequence flows are documented with Mermaid in [docs/architecture.md](docs/architecture.md).

## Optional CMS Plan

A step-by-step plan for evolving this boilerplate into an optional WordPress-like CMS is documented in [docs/cms-plan.md](docs/cms-plan.md).

## Optional CMS Module

CMS support is disabled by default. Set `CMS_ENABLED=true` to register CMS API routes.

## CMS Enablement Checklist

1. Set `CMS_ENABLED=true` in `.env`.
2. Keep `CMS_THEME=default` unless you have added another theme under `src/client/cms/themes/`.
3. Run the base schema files in `db/schema/` first.
4. Run the optional CMS schema files in `db/schema/cms/`.
5. Ensure `APP_PUBLIC_URL` matches the public app URL used in reset links and CMS-generated URLs.
6. If you plan to use uploads, set `CMS_MEDIA_DIR`, `CMS_MEDIA_PUBLIC_PATH`, `CMS_MEDIA_MAX_BYTES`, and `CMS_MEDIA_ALLOWED_TYPES`.
7. If you plan to use forgot-password emails, configure SMTP values.
8. Start the app and verify `GET /api/cms/health` returns `200` when CMS is enabled.
9. Log in with an admin or a user that has CMS permissions.
10. Validate the basic CMS flow in order: create page, publish page, open public page, upload media, assign terms, configure menu.

Phase 1 adds the CMS module boundary and a health endpoint:

```bash
GET /api/cms/health
```

When `CMS_ENABLED=false`, CMS routes are not mounted and `/api/cms/*` returns the standard API 404 response.

The CMS posts/pages API is available when `CMS_ENABLED=true`:

```bash
GET    /api/cms/posts
GET    /api/cms/posts/:id
POST   /api/cms/posts
PUT    /api/cms/posts/:id
DELETE /api/cms/posts/:id
GET    /api/cms/public/pages/:slug
GET    /api/cms/public/posts/:slug
GET    /api/cms/posts/:id/revisions
GET    /api/cms/posts/:id/revisions/:revisionId
POST   /api/cms/posts/:id/revisions/:revisionId/restore
GET    /api/cms/media
GET    /api/cms/media/:id
POST   /api/cms/media
PUT    /api/cms/media/:id
DELETE /api/cms/media/:id
GET    /api/cms/menus
GET    /api/cms/menus/:id
POST   /api/cms/menus
PUT    /api/cms/menus/:id
DELETE /api/cms/menus/:id
GET    /api/cms/menus/:id/items
POST   /api/cms/menus/:id/items
PUT    /api/cms/menus/:id/items/:itemId
DELETE /api/cms/menus/:id/items/:itemId
GET    /api/cms/public/menus/:location
GET    /api/cms/terms
GET    /api/cms/terms/:id
POST   /api/cms/terms
PUT    /api/cms/terms/:id
DELETE /api/cms/terms/:id
GET    /api/cms/posts/:id/terms
PUT    /api/cms/posts/:id/terms
GET    /api/cms/public/terms
GET    /api/cms/public/terms/:taxonomy/:slug/posts
```

Admin CMS routes require authentication and admin access. Public CMS routes only return published content.

The CMS admin shell is available when `CMS_ENABLED=true` and the current user is an admin:

```bash
/admin/cms
/admin/cms/pages
/admin/cms/pages/new
/admin/cms/pages/:id
/admin/cms/posts
/admin/cms/posts/new
/admin/cms/posts/:id
/admin/cms/media
/admin/cms/terms
/admin/cms/menus
```

The first CMS content editor uses Markdown. Markdown source is stored in `content_json` with `format: "markdown"`, and preview/rendered HTML is submitted through `content_html`.

CMS updates create revisions before changes are saved. The CMS editor includes a revision panel for existing pages/posts and supports restoring earlier revisions.

CMS categories and tags use the optional `cms_terms` and `cms_post_terms` tables. Admins can manage terms from `/admin/cms/terms`, assign them in the content editor, and expose public filtered post archives.

CMS media uses local file storage controlled by `CMS_MEDIA_DIR` and `CMS_MEDIA_PUBLIC_PATH`. Admins can upload, edit metadata, delete files, and insert uploaded media into Markdown content from the editor.

CMS menus use `cms_menus` and `cms_menu_items`. Admins can create menus, assign a location such as `primary`, add custom/page/post/category/tag links, and public CMS templates render the `primary` menu when configured.

CMS themes are selected with `CMS_THEME`. The default theme lives in `src/client/cms/themes/default/` and provides page, post, archive, and landing page templates. Page templates can be selected from the CMS editor.

CMS permissions use `cms_roles`, `cms_permissions`, `cms_user_roles`, and `cms_role_permissions`. CMS and `/api/users` access are permission-based, while `is_admin` still acts as a bootstrap shortcut with full access.

CMS now registers through shared module registries under `src/server/modules/` and `src/client/modules/`. The current contract is intentionally small so future app modules can follow the same pattern without a full plugin runtime:

```text
name
enabled(configOrStore)
registerServer(app)   // server only
clientRoutes          // client only
navigationItems       // client only
```

CMS public rendering is available when `CMS_ENABLED=true`:

```bash
/:slug
/posts/:slug
/category/:slug
/tag/:slug
```

Explicit app and admin routes are matched first. CMS public routes run before the final not-found route and only render published content returned by the public CMS API.

## Project Dependencies

This project utilizes several packages to enhance development and production workflows.

## DevDependencies

- [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) `^14.0.0`: Copies public assets into the Webpack build output.
- [html-webpack-plugin](https://webpack.js.org/plugins/html-webpack-plugin/) `^5.6.7`: Generates the HTML file that loads the client bundle.
- [jest](https://jestjs.io/docs/getting-started) `^30.3.0`: JavaScript test runner.
- [nodemon](https://www.npmjs.com/package/nodemon) `^3.1.14`: Restarts the development server when files change.
- [supertest](https://www.npmjs.com/package/supertest) `^7.2.2`: Tests Express routes through an in-memory HTTP interface.
- [terser-webpack-plugin](https://webpack.js.org/plugins/terser-webpack-plugin/) `^5.4.0`: Minifies production JavaScript bundles.
- [webpack](https://webpack.js.org/concepts/) `^5.106.2`: Bundles the client and server builds.
- [webpack-cli](https://webpack.js.org/api/cli/) `^7.0.2`: Command-line interface for Webpack.
- [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) `^5.2.3`: Development server tooling for Webpack.
- [webpack-merge](https://webpack.js.org/loaders/merge/) `^6.0.1`: Merges common, development, and production Webpack configuration.
- [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals) `^3.0.0`: Excludes `node_modules` from the server bundle.

## Dependencies

- [@babel/core](https://babeljs.io/docs/en/babel-core) `^7.29.0`: Babel compiler core.
- [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env) `^7.29.2`: Babel preset for JavaScript target environments.
- [@babel/preset-react](https://babeljs.io/docs/en/babel-preset-react) `^7.28.5`: Babel preset for React JSX.
- [@emotion/react](https://emotion.sh/docs/@emotion/react) `^11.14.0`: CSS-in-JS support used by MUI.
- [@emotion/styled](https://emotion.sh/docs/styled) `^11.14.1`: Styled component support used by MUI.
- [@mui/material](https://mui.com/) `^9.0.0`: React UI framework implementing Material Design.
- [axios](https://www.npmjs.com/package/axios) `^1.15.2`: Promise-based HTTP client for browser and Node.js.
- [babel-loader](https://webpack.js.org/loaders/babel-loader/) `^10.1.1`: Webpack loader for Babel.
- [bcrypt](https://www.npmjs.com/package/bcrypt) `^6.0.0`: Password hashing library.
- [cookie-parser](https://www.npmjs.com/package/cookie-parser) `^1.4.7`: Express middleware for parsing cookies.
- [dotenv](https://www.npmjs.com/package/dotenv) `^17.4.2`: Loads environment variables from `.env`.
- [express](https://expressjs.com/) `^5.2.1`: Web framework for Node.js.
- [express-mysql-session](https://www.npmjs.com/package/express-mysql-session) `^3.0.3`: MySQL-backed session store for Express.
- [express-session](https://www.npmjs.com/package/express-session) `^1.19.0`: Session middleware for Express.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) `^9.0.3`: JSON Web Token implementation.
- [mysql2](https://www.npmjs.com/package/mysql2) `^3.22.2`: MySQL client for Node.js.
- [newrelic](https://www.npmjs.com/package/newrelic) `^13.19.2`: New Relic Node.js agent.
- [nodemailer](https://nodemailer.com/) `^8.0.5`: Email sending library for Node.js.
- [react](https://reactjs.org/) `^19.2.5`: JavaScript library for building user interfaces.
- [react-dom](https://reactjs.org/docs/react-dom.html) `^19.2.5`: React DOM renderer.
- [react-router-dom](https://reactrouter.com/) `^7.14.2`: DOM bindings for React Router.
- [winston](https://www.npmjs.com/package/winston) `^3.19.0`: Logging library.
- [winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file) `^5.0.0`: File rotation transport for Winston.

## Installation

To install the necessary dependencies, run:

```bash
npm install
```

## Scripts

```bash
npm test
```

Runs tests with Jest.

```bash
npm run build
```

Creates a production build with Webpack and writes the deployable `dist/package.json`.

```bash
npm run dev
```

Creates a development build with Webpack and runs the server through Nodemon.

## Generated Output Policy

The `dist/` directory is generated by Webpack when you run `npm run build`. It contains the deployable server bundle, client assets, copied public files, lazy-loaded chunks, and the generated production `package.json`.

Do not commit `dist/` to source control. It is already ignored in `.gitignore`, and deployments should create or upload it from a fresh `npm run build`.

## Database Schema

The `db/schema/` directory contains the SQL files for creating the application tables in a fresh database.

Optional seed examples live in `db/seed/`. Review and replace placeholder values before running them.

Optional CMS schema files live in `db/schema/cms/`. These files are only required when `CMS_ENABLED=true` and should be run after the base `user` and `sessions` schema files.

## Environment

Startup requires `APP_PUBLIC_URL`, `JWT_SECRET`, `SESSION_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_NAME`. `DB_PASSWORD` and email settings are optional at startup; missing optional values are logged as warnings and related features may be unavailable until configured. `CMS_ENABLED` controls whether optional CMS routes are registered. `CMS_THEME` controls the active CMS theme and defaults to `default`. CMS media can be configured with `CMS_MEDIA_DIR`, `CMS_MEDIA_PUBLIC_PATH`, `CMS_MEDIA_MAX_BYTES`, `CMS_MEDIA_ALLOWED_TYPES`, and `JSON_BODY_LIMIT`.

## License

This project is licensed under the ISC license.

## File Structure

```bash
React-Express-Mysql/
|-- db/
|   |-- schema/
|   |   |-- cms/
|   |   |   |-- README.md
|   |   |   |-- cms_media.sql
|   |   |   |-- cms_menus.sql
|   |   |   |-- cms_options.sql
|   |   |   |-- cms_permissions.sql
|   |   |   |-- cms_post_terms.sql
|   |   |   |-- cms_posts.sql
|   |   |   |-- cms_revisions.sql
|   |   |   `-- cms_terms.sql
|   |   |-- sessions.sql
|   |   `-- user.sql
|   `-- seed/
|       `-- admin.example.sql
|-- docs/
|   |-- architecture.md
|   `-- cms-plan.md
|-- dist/                       # Generated by npm run build; do not commit
|   |-- chunks/
|   |-- public/
|   |   |-- index.html
|   |   `-- status/
|   |       `-- .gitkeep
|   |-- client.js
|   |-- package.json
|   `-- server.js
|-- public/
|   |-- index.html
|   `-- status/
|       `-- .gitkeep
|-- src/
|   |-- client/
|   |   |-- cms/
|   |   |   |-- admin/
|   |   |   |   |-- CmsAdminLayout.js
|   |   |   |   |-- CmsDashboard.js
|   |   |   |   |-- CmsMediaLibrary.js
|   |   |   |   |-- CmsMenuBuilder.js
|   |   |   |   |-- CmsPostEditor.js
|   |   |   |   |-- CmsPostList.js
|   |   |   |   `-- CmsTermManager.js
|   |   |   |-- editor/
|   |   |   |   `-- markdown.js
|   |   |   |-- media/
|   |   |   |   |-- MediaPicker.js
|   |   |   |   `-- mediaFiles.js
|   |   |   |-- public/
|   |   |       |-- CmsContentView.js
|   |   |       |-- CmsMenu.js
|   |   |       |-- CmsNotFound.js
|   |   |       |-- CmsPage.js
|   |   |       |-- CmsPost.js
|   |   |       `-- CmsTermArchive.js
|   |   |   `-- themes/
|   |   |       |-- default/
|   |   |       |   |-- ArchiveTemplate.js
|   |   |       |   |-- LandingPageTemplate.js
|   |   |       |   |-- PageTemplate.js
|   |   |       |   |-- PostTemplate.js
|   |   |       |   `-- index.js
|   |   |       `-- themeRegistry.js
|   |   |-- components/
|   |   |   |-- Button.js
|   |   |   |-- Footer.js
|   |   |   |-- Navbar.js
|   |   |   `-- Sidebar.js
|   |   |-- layouts/
|   |   |   |-- ContentOnly.js
|   |   |   |-- FullLayout.js
|   |   |   `-- NoSidebarLayout.js
|   |   |-- pages/
|   |   |   |-- Admin.js
|   |   |   |-- Login.js
|   |   |   |-- ResetPassword.js
|   |   |   |-- Signup.js
|   |   |   `-- Status.js
|   |   |-- store/
|   |   |   |-- states/
|   |   |   |   |-- authState.js
|   |   |   |   `-- envState.js
|   |   |   |-- appContext.js
|   |   |   `-- combinedState.js
|   |   |-- modules/
|   |   |   |-- cmsModule.js
|   |   |   `-- moduleRegistry.js
|   |   |-- theme/
|   |   |   `-- original.js
|   |   |-- wrappers/
|   |   |   |-- CmsEnabledWrapper.js
|   |   |   |-- LoginWrapper.js
|   |   |   |-- PrivateWrapper.js
|   |   |   `-- SettingsWrapper.js
|   |   |-- utils/
|   |   |   `-- apiErrors.js
|   |   |-- index.js
|   |   `-- layout.js
|   `-- server/
|       |-- cms/
|       |   |-- cmsConfig.js
|       |   |-- cmsModule.js
|       |   |-- cmsModule.test.js
|       |   |-- cmsRoutes.js
|       |   |-- permissions/
|       |   |   `-- permissionConstants.js
|       |   |-- media/
|       |   |   |-- mediaConfig.js
|       |   |   |-- mediaController.js
|       |   |   |-- mediaRepository.js
|       |   |   |-- mediaRoutes.js
|       |   |   |-- mediaRoutes.test.js
|       |   |   |-- mediaService.js
|       |   |   |-- mediaService.test.js
|       |   |   `-- mediaValidation.js
|       |   |-- menus/
|       |   |   |-- menuController.js
|       |   |   |-- menuRepository.js
|       |   |   |-- menuRoutes.js
|       |   |   |-- menuRoutes.test.js
|       |   |   |-- menuService.js
|       |   |   |-- menuService.test.js
|       |   |   `-- menuValidation.js
|       |   |-- posts/
|       |   |   |-- postController.js
|       |   |   |-- postRepository.js
|       |   |   |-- postRoutes.js
|       |   |   |-- postRoutes.test.js
|       |   |   |-- postService.js
|       |   |   |-- postService.test.js
|       |   |   `-- postValidation.js
|       |   `-- taxonomies/
|       |       |-- termController.js
|       |       |-- termRepository.js
|       |       |-- termRoutes.js
|       |       |-- termRoutes.test.js
|       |       |-- termService.js
|       |       |-- termService.test.js
|       |       `-- termValidation.js
|       |-- config/
|       |   |-- auth.js
|       |   |-- autoRenewToken.js
|       |   |-- autoRenewToken.test.js
|       |   |-- cookieOptions.js
|       |   |-- dbpool.js
|       |   |-- email.js
|       |   |-- email.test.js
|       |   |-- logger.js
|       |   |-- sessionConfig.js
|       |   |-- validateEnv.js
|       |   `-- validateEnv.test.js
|       |-- main/
|       |   |-- mainController.js
|       |   |-- mainRoutes.js
|       |   |-- mainRoutes.test.js
|       |   `-- mainService.js
|       |-- modules/
|       |   |-- cmsModule.js
|       |   |-- moduleRegistry.js
|       |   `-- moduleRegistry.test.js
|       |-- settings/
|       |   |-- settingsController.js
|       |   |-- settingsRoutes.js
|       |   `-- settingsService.js
|       |-- user/
|       |   |-- userController.js
|       |   |-- userRepository.js
|       |   |-- userRepository.test.js
|       |   |-- userRoutes.js
|       |   |-- userRoutes.test.js
|       |   |-- userService.js
|       |   |-- userService.test.js
|       |   `-- userValidation.js
|       |-- app.js
|       `-- server.js
|-- env.example
|-- generatePackageJson.js
|-- issues-to-solve.txt
|-- newrelic.js
|-- package-lock.json
|-- package.json
|-- readme.md
|-- webpack.common.js
|-- webpack.dev.js
`-- webpack.prod.js
```
