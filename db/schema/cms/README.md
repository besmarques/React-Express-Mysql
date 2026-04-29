# Optional CMS Schema

These SQL files are only required when `CMS_ENABLED=true`.

They are create-from-scratch schema files for a fresh CMS-enabled database. This project does not ship SQL migrations.

Run the base schema first:

```text
db/schema/user.sql
db/schema/sessions.sql
```

Then run the CMS schema in this order:

```text
db/schema/cms/cms_posts.sql
db/schema/cms/cms_revisions.sql
db/schema/cms/cms_terms.sql
db/schema/cms/cms_post_terms.sql
db/schema/cms/cms_media.sql
db/schema/cms/cms_options.sql
db/schema/cms/cms_menus.sql
db/schema/cms/cms_permissions.sql
```

Notes:

- `cms_posts.sql` must exist before `cms_revisions.sql` and `cms_post_terms.sql`.
- `cms_terms.sql` must exist before `cms_post_terms.sql`.
- `cms_menus.sql` creates both menus and menu items.
- `cms_permissions.sql` creates roles, permissions, and role assignment tables.
- These schema files do not insert a default admin account or a default session row.
