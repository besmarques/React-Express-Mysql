# Architecture Maps

This document uses Mermaid diagrams to describe the project structure and the main runtime flows. GitHub renders Mermaid diagrams directly in Markdown.

## Runtime Architecture

```mermaid
flowchart LR
    Browser["Browser"]
    StaticAssets["Static assets\npublic/index.html, client.js, chunks"]
    ReactApp["React SPA\nsrc/client"]
    ExpressApp["Express app\nsrc/server/app.js"]
    Middleware["Shared middleware\njson, urlencoded, session,\ncookie parser, token renewal"]
    ApiRoutes["API routes\n/api/*"]
    Controllers["Controllers"]
    Services["Services"]
    Repositories["Repositories"]
    MySQL["MySQL\nuser, sessions"]
    SMTP["SMTP provider"]
    Logs["Log files\nlogs/*.log"]

    Browser --> StaticAssets
    StaticAssets --> ReactApp
    ReactApp -->|Axios and fetch| ExpressApp
    Browser -->|Direct API request| ExpressApp
    ExpressApp --> Middleware
    Middleware --> ApiRoutes
    ApiRoutes --> Controllers
    Controllers --> Services
    Services --> Repositories
    Repositories --> MySQL
    Services -->|Password reset email| SMTP
    ExpressApp --> Logs
```

## Module Map

```mermaid
flowchart TB
    subgraph Client["src/client"]
        ClientEntry["index.js"]
        Router["layout.js\nBrowserRouter + routes"]
        Wrappers["wrappers\nPrivateWrapper, LoginWrapper,\nSettingsWrapper"]
        Layouts["layouts\nFullLayout, NoSidebarLayout,\nContentOnly"]
        Components["components\nNavbar, Sidebar, Footer, Button"]
        Pages["pages\nLogin, Signup, ResetPassword,\nStatus, Admin"]
        Store["store\nappContext, combinedState"]
        States["store/states\nauthState, envState"]
        Utils["utils\napiErrors"]
        Theme["theme\noriginal"]
    end

    subgraph Server["src/server"]
        ServerEntry["server.js\nstartup"]
        AppFactory["app.js\nExpress app factory"]
        Config["config\nauth, autoRenewToken,\ncookies, dbpool, email,\nsession, env validation, logger"]
        MainModule["main\nhealth, env, auth-status"]
        SettingsModule["settings\nfeature flags"]
        UserModule["user\nauth, users, password reset"]
        ServerModules["modules\nmoduleRegistry, cmsModule"]
    end

    subgraph Data["db"]
        UserSchema["schema/user.sql"]
        SessionSchema["schema/sessions.sql"]
        SeedExamples["seed/admin.example.sql"]
    end

    subgraph Build["Build and runtime config"]
        Webpack["webpack.common.js\nwebpack.dev.js\nwebpack.prod.js"]
        Package["package.json"]
        Env[".env / env.example"]
        NewRelic["newrelic.js"]
    end

    ClientEntry --> Theme
    ClientEntry --> Store
    Store --> States
    Store --> Router
    Router --> Wrappers
    Router --> Layouts
    Router --> Pages
    Router --> ClientModules
    Layouts --> Components
    Pages --> Utils
    States -->|HTTP calls| AppFactory
    
    subgraph ClientModules["src/client/modules"]
        ClientRegistry["moduleRegistry.js"]
        ClientCmsModule["cmsModule.js"]
    end

    ServerEntry --> Config
    ServerEntry --> AppFactory
    AppFactory --> Config
    AppFactory --> MainModule
    AppFactory --> SettingsModule
    AppFactory --> UserModule
    AppFactory --> ServerModules
    UserModule --> Config
    UserModule --> Data
    Config --> Data
    ServerModules --> Data
    Webpack --> ClientEntry
    Webpack --> ServerEntry
    Env --> ServerEntry
    Package --> Webpack
    NewRelic --> ServerEntry
```

## CMS Module Map

```mermaid
flowchart TB
    subgraph Server["src/server"]
        AppFactory["app.js"]
        ServerRegistry["modules/moduleRegistry.js"]
        ServerCmsModule["modules/cmsModule.js"]
        CmsRoutes["cms/cmsRoutes.js"]
        PostApi["cms/posts/*"]
        MediaApi["cms/media/*"]
        MenuApi["cms/menus/*"]
        TermApi["cms/taxonomies/*"]
    end

    subgraph Client["src/client"]
        Layout["layout.js"]
        AdminPage["pages/Admin.js"]
        ClientRegistry["modules/moduleRegistry.js"]
        ClientCmsModule["modules/cmsModule.js"]
        CmsAdmin["cms/admin/*"]
        CmsPublic["cms/public/*"]
        CmsThemes["cms/themes/*"]
    end

    subgraph Data["db/schema/cms"]
        Posts["cms_posts.sql"]
        Revisions["cms_revisions.sql"]
        Terms["cms_terms.sql"]
        PostTerms["cms_post_terms.sql"]
        Media["cms_media.sql"]
        Menus["cms_menus.sql"]
        Permissions["cms_permissions.sql"]
    end

    AppFactory --> ServerRegistry
    ServerRegistry --> ServerCmsModule
    ServerCmsModule --> CmsRoutes
    CmsRoutes --> PostApi
    CmsRoutes --> MediaApi
    CmsRoutes --> MenuApi
    CmsRoutes --> TermApi

    Layout --> ClientRegistry
    AdminPage --> ClientRegistry
    ClientRegistry --> ClientCmsModule
    ClientCmsModule --> CmsAdmin
    ClientCmsModule --> CmsPublic
    CmsPublic --> CmsThemes

    PostApi --> Posts
    PostApi --> Revisions
    PostApi --> Terms
    PostApi --> PostTerms
    MediaApi --> Media
    MenuApi --> Menus
    PostApi --> Permissions
    MediaApi --> Permissions
    MenuApi --> Permissions
    TermApi --> Permissions
```

## CMS Database Diagram

```mermaid
erDiagram
    cms_posts ||--o{ cms_revisions : "has revisions"
    cms_posts ||--o{ cms_post_terms : "has term links"
    cms_terms ||--o{ cms_post_terms : "has post links"
    cms_menus ||--o{ cms_menu_items : "has items"
    cms_roles ||--o{ cms_user_roles : "assigned to users"
    cms_roles ||--o{ cms_role_permissions : "grants"
    cms_permissions ||--o{ cms_role_permissions : "mapped to roles"

    cms_posts {
        INT id PK
        VARCHAR type
        VARCHAR status
        VARCHAR title
        VARCHAR slug
        LONGTEXT content_json
        MEDIUMTEXT content_html
        INT author_id
        INT parent_id
        DATETIME published_at
        TIMESTAMP created_at
        DATETIME updated_at
    }

    cms_revisions {
        INT id PK
        INT post_id FK
        LONGTEXT content_json
        MEDIUMTEXT content_html
        VARCHAR template
        INT author_id
        TIMESTAMP created_at
    }

    cms_terms {
        INT id PK
        VARCHAR taxonomy
        VARCHAR name
        VARCHAR slug
        TEXT description
        TIMESTAMP created_at
        DATETIME updated_at
    }

    cms_post_terms {
        INT post_id FK
        INT term_id FK
        TIMESTAMP created_at
    }

    cms_media {
        INT id PK
        VARCHAR filename
        VARCHAR mime_type
        VARCHAR public_url
        INT uploaded_by
        TIMESTAMP created_at
    }

    cms_menus {
        INT id PK
        VARCHAR name
        VARCHAR location
        TIMESTAMP created_at
        DATETIME updated_at
    }

    cms_menu_items {
        INT id PK
        INT menu_id FK
        VARCHAR item_type
        VARCHAR label
        VARCHAR url
        INT linked_post_id
        INT linked_term_id
        INT parent_id
    }

    cms_roles {
        INT id PK
        VARCHAR name
    }

    cms_permissions {
        INT id PK
        VARCHAR name
    }

    cms_user_roles {
        INT user_id
        INT role_id FK
    }

    cms_role_permissions {
        INT role_id FK
        INT permission_id FK
    }
```

## CMS Publish Flow

```mermaid
sequenceDiagram
    participant Editor as Editor
    participant UI as "CMS editor UI"
    participant API as "POST or PUT /api/cms/posts"
    participant Auth as "authenticateJWT + authorizePermission"
    participant Controller as postController
    participant Service as postService
    participant RevisionRepo as revision repository
    participant PostRepo as postRepository
    participant DB as MySQL

    Editor->>UI: edit title, slug, content, status
    UI->>API: submit payload with credentials
    API->>Auth: verify token and cms.posts permission
    Auth->>Controller: authorized request
    Controller->>Service: createPost or updatePost
    alt update existing content
        Service->>RevisionRepo: save current version
        RevisionRepo->>DB: INSERT cms_revisions
        DB-->>RevisionRepo: revision row
    end
    alt target status is published
        Service->>Service: require cms.posts.publish
    end
    Service->>PostRepo: INSERT or UPDATE cms_posts
    PostRepo->>DB: persist content, html, template, status, publish date
    DB-->>PostRepo: saved row
    PostRepo-->>Service: post
    Service-->>Controller: post response
    Controller-->>UI: JSON payload
    UI-->>Editor: show saved or published state
```

## CMS Editor Save Flow

```mermaid
sequenceDiagram
    participant Editor as Editor
    participant Form as CmsPostEditor
    participant Markdown as "markdown renderer"
    participant Media as "MediaPicker"
    participant API as "/api/cms/posts and related endpoints"
    participant Server as "postController and postService"
    participant DB as MySQL

    Editor->>Form: open page or post editor
    Form->>API: GET post detail, revisions, terms
    API->>Server: fetch content data
    Server->>DB: SELECT post, revisions, terms
    DB-->>Server: rows
    Server-->>Form: editor payload

    Editor->>Media: optionally choose uploaded media
    Media-->>Form: markdown snippet or asset metadata
    Editor->>Form: update title, excerpt, markdown, status, template
    Form->>Markdown: render preview html
    Markdown-->>Form: content_html
    Form->>API: POST or PUT editor payload
    API->>Server: validate and save
    Server->>DB: write cms_posts and cms_revisions
    DB-->>Server: saved rows
    Server-->>Form: saved content
    Form-->>Editor: updated editor state
```

## Server Request Pipeline

```mermaid
sequenceDiagram
    participant Client as Browser or React client
    participant App as Express app
    participant Session as Session middleware
    participant Cookies as Cookie parser
    participant Renew as autoRenewToken
    participant Routes as API routes
    participant Controller as Controller
    participant Service as Service
    participant Repo as Repository
    participant DB as MySQL

    Client->>App: HTTP request
    App->>App: express.json and urlencoded
    App->>Session: load session from MySQL store
    Session-->>App: req.session
    App->>Cookies: parse cookies
    Cookies-->>App: req.cookies
    App->>Renew: renew valid JWT near expiry
    Renew-->>App: continue or reject invalid protected token
    App->>Routes: match /api route
    Routes->>Controller: validate and handle request
    Controller->>Service: business operation
    Service->>Repo: data access
    Repo->>DB: SQL query
    DB-->>Repo: rows or result
    Repo-->>Service: mapped result
    Service-->>Controller: domain result
    Controller-->>Client: JSON response and cookies
```

## Startup Flow

```mermaid
sequenceDiagram
    participant Node as node dist/server.js
    participant Env as dotenv and validateEnv
    participant DB as dbpool
    participant Logger as logger
    participant App as createApp
    participant HTTP as Express listener

    Node->>Env: load .env
    Node->>Env: validate required startup env
    alt required env missing
        Env-->>Node: throw missing variable error
        Node->>Logger: log startup error
        Node-->>Node: exit process
    else required env present
        Node->>DB: checkDatabaseConnection
        alt database unavailable
            DB-->>Node: throw connection error
            Node->>Logger: log startup error
            Node-->>Node: exit process
        else database reachable
            Node->>Logger: warn for missing optional env
            Node->>App: create Express app
            App-->>Node: app instance
            Node->>HTTP: listen on APP_PORT or 8080
        end
    end
```

## Login Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Page as Login page
    participant AuthState as authState
    participant API as POST /api/login
    participant Validation as userValidation
    participant Controller as userController
    participant Service as userService
    participant Repo as userRepository
    participant DB as MySQL
    participant JWT as jsonwebtoken
    participant Session as Express session

    User->>Page: submit email and password
    Page->>AuthState: loginUser(email, password)
    AuthState->>API: POST credentials
    API->>Validation: validate email and password
    Validation->>Controller: login
    Controller->>Service: loginUser
    Service->>Repo: findByEmail
    Repo->>DB: SELECT user by email
    DB-->>Repo: user row
    Repo-->>Service: user
    Service->>Service: bcrypt.compare password
    alt invalid credentials
        Service-->>Controller: 401 Invalid email or password
        Controller-->>AuthState: 401 JSON response
    else valid credentials
        Service->>JWT: sign token
        Service-->>Controller: token and userId
        Controller->>Session: set req.session.userId
        Controller-->>AuthState: Set-Cookie token + Logged in
        AuthState->>API: GET /api/auth-status
        API-->>AuthState: isAuthenticated and isAdmin
        AuthState-->>Page: update auth store
    end
```

## Password Reset Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Forgot as Forgot password request
    participant API as /api/forgot-password
    participant Service as userService
    participant Repo as userRepository
    participant DB as MySQL
    participant Email as emailService
    participant SMTP as SMTP provider
    participant Reset as /api/reset-password

    User->>Forgot: submit email
    Forgot->>API: POST email
    API->>Service: sendPasswordReset(email)
    Service->>Service: generate raw token and SHA-256 hash
    Service->>Repo: saveResetToken(email, hash, expiry)
    Repo->>DB: UPDATE user resetToken and resetTokenExpiresAt
    DB-->>Repo: affectedRows
    alt no matching user
        Service-->>API: return without sending email
        API-->>Forgot: generic success response
    else matching user
        Service->>Email: send reset email with raw token URL
        Email->>SMTP: send mail
        SMTP-->>Email: accepted
        API-->>Forgot: generic success response
    end

    User->>Reset: submit raw reset token and new password
    Reset->>Service: resetPassword(token, newPassword)
    Service->>Service: hash raw token
    Service->>Repo: findByResetToken(hash)
    Repo->>DB: SELECT unexpired token
    DB-->>Repo: matching user or empty
    alt invalid or expired token
        Service-->>Reset: 400 Invalid or expired reset token
    else valid token
        Service->>Service: bcrypt.hash new password
        Service->>Repo: updatePasswordByResetToken
        Repo->>DB: UPDATE password and clear reset fields
        Service-->>Reset: success
    end
```

## Protected Admin Users Flow

```mermaid
sequenceDiagram
    participant Client as React client
    participant API as GET /api/users
    participant Auth as authenticateJWT
    participant Admin as authorizeAdmin
    participant Controller as userController
    participant Service as userService
    participant Repo as userRepository
    participant DB as MySQL

    Client->>API: GET /api/users with token cookie
    API->>Auth: verify JWT
    alt missing token
        Auth-->>Client: 401 Unauthorized
    else invalid or expired token
        Auth-->>Client: 403 Forbidden
    else valid token
        Auth->>Admin: check isAdmin
        alt not admin
            Admin-->>Client: 403 Forbidden
        else admin
            Admin->>Controller: getUsers
            Controller->>Service: getUsers
            Service->>Repo: getUsers
            Repo->>DB: SELECT id, email, is_admin
            DB-->>Repo: users
            Repo-->>Service: users
            Service-->>Controller: users
            Controller-->>Client: users JSON
        end
    end
```

## How To Keep These Current

- Update the architecture diagram when a new external dependency, persistence layer, or runtime boundary is added.
- Update the module map when new top-level client or server modules are added.
- Update sequence diagrams when request middleware order, controller/service/repository contracts, or auth behavior changes.
- Update the CMS diagrams when CMS schema files, module registration contracts, or editor and publishing flows change.
