const permissions = {
    cmsMenusManage: "cms.menus.manage",
    cmsMediaManage: "cms.media.manage",
    cmsPostsCreate: "cms.posts.create",
    cmsPostsDelete: "cms.posts.delete",
    cmsPostsPublish: "cms.posts.publish",
    cmsPostsRead: "cms.posts.read",
    cmsPostsUpdate: "cms.posts.update",
    cmsSettingsManage: "cms.settings.manage",
    cmsTaxonomiesManage: "cms.taxonomies.manage",
    usersManage: "users.manage",
};

const cmsAccessPermissions = [
    permissions.cmsPostsRead,
    permissions.cmsPostsCreate,
    permissions.cmsPostsUpdate,
    permissions.cmsPostsPublish,
    permissions.cmsPostsDelete,
    permissions.cmsMediaManage,
    permissions.cmsMenusManage,
    permissions.cmsTaxonomiesManage,
    permissions.cmsSettingsManage,
];

module.exports = {
    cmsAccessPermissions,
    permissions,
};
