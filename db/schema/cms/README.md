# Optional CMS Schema

These SQL files are only required when `CMS_ENABLED=true`.

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
```

