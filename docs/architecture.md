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
    Layouts --> Components
    Pages --> Utils
    States -->|HTTP calls| AppFactory

    ServerEntry --> Config
    ServerEntry --> AppFactory
    AppFactory --> Config
    AppFactory --> MainModule
    AppFactory --> SettingsModule
    AppFactory --> UserModule
    UserModule --> Config
    UserModule --> Data
    Config --> Data
    Webpack --> ClientEntry
    Webpack --> ServerEntry
    Env --> ServerEntry
    Package --> Webpack
    NewRelic --> ServerEntry
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
