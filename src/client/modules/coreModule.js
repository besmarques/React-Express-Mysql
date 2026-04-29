import React, { lazy } from "react";

import PrivateWrapper from "../wrappers/PrivateWrapper";
import LoginWrapper from "../wrappers/LoginWrapper";
import SettingsWrapper from "../wrappers/SettingsWrapper";

const FullLayout = lazy(() => import("../layouts/FullLayout"));
const NoSidebarLayout = lazy(() => import("../layouts/NoSidebarLayout"));
const ContentOnlyLayout = lazy(() => import("../layouts/ContentOnly"));

const Status = lazy(() => import("../pages/Status"));
const Login = lazy(() => import("../pages/Login"));
const Signup = lazy(() => import("../pages/Signup"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const Admin = lazy(() => import("../pages/Admin"));

const coreModule = {
    name: "core",
    enabled: () => true,
    clientRoutes: [
        {
            path: "/login",
            order: 100,
            element: (
                <LoginWrapper>
                    <ContentOnlyLayout>
                        <Login />
                    </ContentOnlyLayout>
                </LoginWrapper>
            ),
        },
        {
            path: "/signup",
            order: 110,
            element: (
                <SettingsWrapper featureName="signup" redirectPath="/">
                    <LoginWrapper>
                        <ContentOnlyLayout>
                            <Signup />
                        </ContentOnlyLayout>
                    </LoginWrapper>
                </SettingsWrapper>
            ),
        },
        {
            path: "/reset-password/:resetToken",
            order: 120,
            element: (
                <LoginWrapper>
                    <ContentOnlyLayout>
                        <ResetPassword />
                    </ContentOnlyLayout>
                </LoginWrapper>
            ),
        },
        {
            path: "/status",
            order: 200,
            element: (
                <PrivateWrapper>
                    <NoSidebarLayout navbarVariant="app">
                        <Status />
                    </NoSidebarLayout>
                </PrivateWrapper>
            ),
        },
        {
            path: "/",
            order: 210,
            element: (
                <PrivateWrapper>
                    <FullLayout>
                        <h1>Home</h1>
                    </FullLayout>
                </PrivateWrapper>
            ),
        },
        {
            path: "/admin",
            order: 220,
            element: (
                <PrivateWrapper>
                    <FullLayout>
                        <Admin />
                    </FullLayout>
                </PrivateWrapper>
            ),
        },
        {
            path: "*",
            order: 1000,
            element: <h1>Not found!</h1>,
        },
    ],
};

export default coreModule;
