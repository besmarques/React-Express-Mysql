import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import injectContext from "./store/appContext";

import PrivateWrapper from "./wrappers/PrivateWrapper";
import LoginWrapper from "./wrappers/LoginWrapper";
import SettingsWrapper from "./wrappers/SettingsWrapper";
import CmsEnabledWrapper from "./wrappers/CmsEnabledWrapper";

const FullLayout = lazy(() => import("./layouts/FullLayout"));
const NoSidebarLayout = lazy(() => import("./layouts/NoSidebarLayout"));
const ContentOnlyLayout = lazy(() => import("./layouts/ContentOnly"));

const Status = lazy(() => import("./pages/Status"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Admin = lazy(() => import("./pages/Admin"));
const CmsDashboard = lazy(() => import("./cms/admin/CmsDashboard"));
const CmsMediaLibrary = lazy(() => import("./cms/admin/CmsMediaLibrary"));
const CmsMenuBuilder = lazy(() => import("./cms/admin/CmsMenuBuilder"));
const CmsPostEditor = lazy(() => import("./cms/admin/CmsPostEditor"));
const CmsPostList = lazy(() => import("./cms/admin/CmsPostList"));
const CmsTermManager = lazy(() => import("./cms/admin/CmsTermManager"));
const CmsNotFound = lazy(() => import("./cms/public/CmsNotFound"));
const CmsPage = lazy(() => import("./cms/public/CmsPage"));
const CmsPost = lazy(() => import("./cms/public/CmsPost"));
const CmsTermArchive = lazy(() => import("./cms/public/CmsTermArchive"));

const Layout = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/login" element={
                        <LoginWrapper>
                            <ContentOnlyLayout>
                                <Login />
                            </ContentOnlyLayout>
                        </LoginWrapper>
                    } />
                    <Route path="/signup" element={
                        <SettingsWrapper featureName="signup" redirectPath="/">
                            <LoginWrapper>
                                <ContentOnlyLayout>
                                    <Signup />
                                </ContentOnlyLayout>
                            </LoginWrapper>
                        </SettingsWrapper>
                    } />
                    <Route path="/reset-password/:resetToken" element={<LoginWrapper><ContentOnlyLayout> <ResetPassword /> </ContentOnlyLayout></LoginWrapper>} />
                    <Route path="/status" element={<PrivateWrapper><NoSidebarLayout> <Status /> </NoSidebarLayout></PrivateWrapper>} />
                    <Route path="/" element={<PrivateWrapper><FullLayout> <h1>Home</h1> </FullLayout></PrivateWrapper>} />
                    <Route path="/admin" element={<PrivateWrapper isAdminPage={true}><FullLayout> <Admin /> </FullLayout></PrivateWrapper>} />
                    <Route path="/admin/cms" element={<PrivateWrapper isAdminPage={true}><CmsEnabledWrapper><FullLayout> <CmsDashboard /> </FullLayout></CmsEnabledWrapper></PrivateWrapper>} />
                    <Route path="/admin/cms/pages" element={<PrivateWrapper isAdminPage={true}><CmsEnabledWrapper><FullLayout> <CmsPostList type="page" /> </FullLayout></CmsEnabledWrapper></PrivateWrapper>} />
                    <Route path="/admin/cms/pages/new" element={<PrivateWrapper isAdminPage={true}><CmsEnabledWrapper><FullLayout> <CmsPostEditor type="page" /> </FullLayout></CmsEnabledWrapper></PrivateWrapper>} />
                    <Route path="/admin/cms/pages/:id" element={<PrivateWrapper isAdminPage={true}><CmsEnabledWrapper><FullLayout> <CmsPostEditor type="page" /> </FullLayout></CmsEnabledWrapper></PrivateWrapper>} />
                    <Route path="/admin/cms/posts" element={<PrivateWrapper isAdminPage={true}><CmsEnabledWrapper><FullLayout> <CmsPostList type="post" /> </FullLayout></CmsEnabledWrapper></PrivateWrapper>} />
                    <Route path="/admin/cms/posts/new" element={<PrivateWrapper isAdminPage={true}><CmsEnabledWrapper><FullLayout> <CmsPostEditor type="post" /> </FullLayout></CmsEnabledWrapper></PrivateWrapper>} />
                    <Route path="/admin/cms/posts/:id" element={<PrivateWrapper isAdminPage={true}><CmsEnabledWrapper><FullLayout> <CmsPostEditor type="post" /> </FullLayout></CmsEnabledWrapper></PrivateWrapper>} />
                    <Route path="/admin/cms/media" element={<PrivateWrapper isAdminPage={true}><CmsEnabledWrapper><FullLayout> <CmsMediaLibrary /> </FullLayout></CmsEnabledWrapper></PrivateWrapper>} />
                    <Route path="/admin/cms/terms" element={<PrivateWrapper isAdminPage={true}><CmsEnabledWrapper><FullLayout> <CmsTermManager /> </FullLayout></CmsEnabledWrapper></PrivateWrapper>} />
                    <Route path="/admin/cms/menus" element={<PrivateWrapper isAdminPage={true}><CmsEnabledWrapper><FullLayout> <CmsMenuBuilder /> </FullLayout></CmsEnabledWrapper></PrivateWrapper>} />
                    <Route path="/posts/:slug" element={<CmsEnabledWrapper fallback={<NoSidebarLayout> <CmsNotFound /> </NoSidebarLayout>}><NoSidebarLayout> <CmsPost /> </NoSidebarLayout></CmsEnabledWrapper>} />
                    <Route path="/category/:slug" element={<CmsEnabledWrapper fallback={<NoSidebarLayout> <CmsNotFound /> </NoSidebarLayout>}><NoSidebarLayout> <CmsTermArchive taxonomy="category" /> </NoSidebarLayout></CmsEnabledWrapper>} />
                    <Route path="/tag/:slug" element={<CmsEnabledWrapper fallback={<NoSidebarLayout> <CmsNotFound /> </NoSidebarLayout>}><NoSidebarLayout> <CmsTermArchive taxonomy="tag" /> </NoSidebarLayout></CmsEnabledWrapper>} />
                    <Route path="/:slug" element={<CmsEnabledWrapper fallback={<NoSidebarLayout> <CmsNotFound /> </NoSidebarLayout>}><NoSidebarLayout> <CmsPage /> </NoSidebarLayout></CmsEnabledWrapper>} />
                    <Route element={<h1>Not found!</h1>} path="*" />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default injectContext(Layout);
