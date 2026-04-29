import React, { lazy } from "react";
import { Navigate } from "react-router-dom";

import PrivateWrapper from "../wrappers/PrivateWrapper";
import FeatureEnabledWrapper from "../wrappers/FeatureEnabledWrapper";
import FullLayout from "../layouts/FullLayout";
import NoSidebarLayout from "../layouts/NoSidebarLayout";

const CmsMediaLibrary = lazy(() => import("../cms/admin/CmsMediaLibrary"));
const CmsMenuBuilder = lazy(() => import("../cms/admin/CmsMenuBuilder"));
const CmsPostEditor = lazy(() => import("../cms/admin/CmsPostEditor"));
const CmsPostList = lazy(() => import("../cms/admin/CmsPostList"));
const CmsTermManager = lazy(() => import("../cms/admin/CmsTermManager"));
const CmsNotFound = lazy(() => import("../cms/public/CmsNotFound"));
const CmsPage = lazy(() => import("../cms/public/CmsPage"));
const CmsPost = lazy(() => import("../cms/public/CmsPost"));
const CmsTermArchive = lazy(() => import("../cms/public/CmsTermArchive"));

const withCmsFeature = (children, fallback = null, redirectPath = "/admin") => (
    <FeatureEnabledWrapper featureFlag="cmsEnabled" fallback={fallback} redirectPath={redirectPath}>
        {children}
    </FeatureEnabledWrapper>
);

const cmsModule = {
    name: "cms",
    enabled: (store) => Boolean(store.cmsEnabled),
    navigationItems: [
        {
            key: "cms",
            label: "CMS",
            description: "Manage CMS content, assets, navigation, and publishing workflow.",
            to: "/admin/cms/pages",
            requiresCmsAccess: true,
        },
    ],
    sidebarItems: [
        { label: "Pages", to: "/admin/cms/pages" },
        { label: "Posts", to: "/admin/cms/posts" },
        { label: "Media", to: "/admin/cms/media" },
        { label: "Terms", to: "/admin/cms/terms" },
        { label: "Menus", to: "/admin/cms/menus" },
    ],
    clientRoutes: [
        {
            path: "/admin/cms",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    {withCmsFeature(
                        <FullLayout>
                            <Navigate to="/admin/cms/pages" replace />
                        </FullLayout>
                    )}
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/pages",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    {withCmsFeature(
                        <FullLayout>
                            <CmsPostList type="page" />
                        </FullLayout>
                    )}
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/pages/new",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    {withCmsFeature(
                        <FullLayout>
                            <CmsPostEditor type="page" />
                        </FullLayout>
                    )}
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/pages/:id",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    {withCmsFeature(
                        <FullLayout>
                            <CmsPostEditor type="page" />
                        </FullLayout>
                    )}
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/posts",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    {withCmsFeature(
                        <FullLayout>
                            <CmsPostList type="post" />
                        </FullLayout>
                    )}
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/posts/new",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    {withCmsFeature(
                        <FullLayout>
                            <CmsPostEditor type="post" />
                        </FullLayout>
                    )}
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/posts/:id",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    {withCmsFeature(
                        <FullLayout>
                            <CmsPostEditor type="post" />
                        </FullLayout>
                    )}
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/media",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    {withCmsFeature(
                        <FullLayout>
                            <CmsMediaLibrary />
                        </FullLayout>
                    )}
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/terms",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    {withCmsFeature(
                        <FullLayout>
                            <CmsTermManager />
                        </FullLayout>
                    )}
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin/cms/menus",
            element: (
                <PrivateWrapper requireCmsAccess={true}>
                    {withCmsFeature(
                        <FullLayout>
                            <CmsMenuBuilder />
                        </FullLayout>
                    )}
                </PrivateWrapper>
            ),
        },
        {
            path: "/posts/:slug",
            element: (
                <FeatureEnabledWrapper featureFlag="cmsEnabled" fallback={<NoSidebarLayout><CmsNotFound /></NoSidebarLayout>}>
                    <NoSidebarLayout>
                        <CmsPost />
                    </NoSidebarLayout>
                </FeatureEnabledWrapper>
            ),
        },
        {
            path: "/category/:slug",
            element: (
                <FeatureEnabledWrapper featureFlag="cmsEnabled" fallback={<NoSidebarLayout><CmsNotFound /></NoSidebarLayout>}>
                    <NoSidebarLayout>
                        <CmsTermArchive taxonomy="category" />
                    </NoSidebarLayout>
                </FeatureEnabledWrapper>
            ),
        },
        {
            path: "/tag/:slug",
            element: (
                <FeatureEnabledWrapper featureFlag="cmsEnabled" fallback={<NoSidebarLayout><CmsNotFound /></NoSidebarLayout>}>
                    <NoSidebarLayout>
                        <CmsTermArchive taxonomy="tag" />
                    </NoSidebarLayout>
                </FeatureEnabledWrapper>
            ),
        },
        {
            path: "/:slug",
            element: (
                <FeatureEnabledWrapper featureFlag="cmsEnabled" fallback={<NoSidebarLayout><CmsNotFound /></NoSidebarLayout>}>
                    <NoSidebarLayout>
                        <CmsPage />
                    </NoSidebarLayout>
                </FeatureEnabledWrapper>
            ),
        },
    ],
};

export default cmsModule;
