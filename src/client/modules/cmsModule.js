import React, { lazy } from "react";

import PrivateWrapper from "../wrappers/PrivateWrapper";
import CmsEnabledWrapper from "../wrappers/CmsEnabledWrapper";
import FullLayout from "../layouts/FullLayout";
import NoSidebarLayout from "../layouts/NoSidebarLayout";

const CmsDashboard = lazy(() => import("../cms/admin/CmsDashboard"));
const CmsMediaLibrary = lazy(() => import("../cms/admin/CmsMediaLibrary"));
const CmsMenuBuilder = lazy(() => import("../cms/admin/CmsMenuBuilder"));
const CmsPostEditor = lazy(() => import("../cms/admin/CmsPostEditor"));
const CmsPostList = lazy(() => import("../cms/admin/CmsPostList"));
const CmsTermManager = lazy(() => import("../cms/admin/CmsTermManager"));
const CmsNotFound = lazy(() => import("../cms/public/CmsNotFound"));
const CmsPage = lazy(() => import("../cms/public/CmsPage"));
const CmsPost = lazy(() => import("../cms/public/CmsPost"));
const CmsTermArchive = lazy(() => import("../cms/public/CmsTermArchive"));

export const cmsAdminNavigationItems = [
    { label: "Dashboard", to: "/admin/cms", variant: "btn btn-outline-secondary" },
    { label: "Pages", to: "/admin/cms/pages", variant: "btn btn-outline-primary" },
    { label: "Posts", to: "/admin/cms/posts", variant: "btn btn-outline-primary" },
    { label: "Media", to: "/admin/cms/media", variant: "btn btn-outline-primary" },
    { label: "Terms", to: "/admin/cms/terms", variant: "btn btn-outline-primary" },
    { label: "Menus", to: "/admin/cms/menus", variant: "btn btn-outline-primary" },
];

const cmsModule = {
    name: "cms",
    enabled: (store) => Boolean(store.cmsEnabled),
    navigationItems: [
        {
            key: "cms",
            label: "CMS",
            description: "Manage CMS content, assets, navigation, and publishing workflow.",
            to: "/admin/cms",
            requiresCmsAccess: true,
        },
    ],
    clientRoutes: [
        {
            path: "/admin/cms",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    <CmsEnabledWrapper>
                        <FullLayout>
                            <CmsDashboard />
                        </FullLayout>
                    </CmsEnabledWrapper>
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/pages",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    <CmsEnabledWrapper>
                        <FullLayout>
                            <CmsPostList type="page" />
                        </FullLayout>
                    </CmsEnabledWrapper>
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/pages/new",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    <CmsEnabledWrapper>
                        <FullLayout>
                            <CmsPostEditor type="page" />
                        </FullLayout>
                    </CmsEnabledWrapper>
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/pages/:id",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    <CmsEnabledWrapper>
                        <FullLayout>
                            <CmsPostEditor type="page" />
                        </FullLayout>
                    </CmsEnabledWrapper>
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/posts",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    <CmsEnabledWrapper>
                        <FullLayout>
                            <CmsPostList type="post" />
                        </FullLayout>
                    </CmsEnabledWrapper>
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/posts/new",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    <CmsEnabledWrapper>
                        <FullLayout>
                            <CmsPostEditor type="post" />
                        </FullLayout>
                    </CmsEnabledWrapper>
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/posts/:id",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    <CmsEnabledWrapper>
                        <FullLayout>
                            <CmsPostEditor type="post" />
                        </FullLayout>
                    </CmsEnabledWrapper>
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/media",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    <CmsEnabledWrapper>
                        <FullLayout>
                            <CmsMediaLibrary />
                        </FullLayout>
                    </CmsEnabledWrapper>
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/terms",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    <CmsEnabledWrapper>
                        <FullLayout>
                            <CmsTermManager />
                        </FullLayout>
                    </CmsEnabledWrapper>
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/menus",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    <CmsEnabledWrapper>
                        <FullLayout>
                            <CmsMenuBuilder />
                        </FullLayout>
                    </CmsEnabledWrapper>
                </PrivateWrapper>
            ),
        },
        {
            path: "/posts/:slug",
            element: (
                <CmsEnabledWrapper fallback={<NoSidebarLayout><CmsNotFound /></NoSidebarLayout>}>
                    <NoSidebarLayout>
                        <CmsPost />
                    </NoSidebarLayout>
                </CmsEnabledWrapper>
            ),
        },
        {
            path: "/category/:slug",
            element: (
                <CmsEnabledWrapper fallback={<NoSidebarLayout><CmsNotFound /></NoSidebarLayout>}>
                    <NoSidebarLayout>
                        <CmsTermArchive taxonomy="category" />
                    </NoSidebarLayout>
                </CmsEnabledWrapper>
            ),
        },
        {
            path: "/tag/:slug",
            element: (
                <CmsEnabledWrapper fallback={<NoSidebarLayout><CmsNotFound /></NoSidebarLayout>}>
                    <NoSidebarLayout>
                        <CmsTermArchive taxonomy="tag" />
                    </NoSidebarLayout>
                </CmsEnabledWrapper>
            ),
        },
        {
            path: "/:slug",
            element: (
                <CmsEnabledWrapper fallback={<NoSidebarLayout><CmsNotFound /></NoSidebarLayout>}>
                    <NoSidebarLayout>
                        <CmsPage />
                    </NoSidebarLayout>
                </CmsEnabledWrapper>
            ),
        },
    ],
};

export default cmsModule;
