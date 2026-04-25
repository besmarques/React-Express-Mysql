import React, { lazy, Suspense, useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import injectContext from "./store/appContext";
import { Context } from "./store/appContext";

import PrivateWrapper from "./wrappers/PrivateWrapper";
import LoginWrapper from "./wrappers/LoginWrapper";
import SettingsWrapper from "./wrappers/SettingsWrapper";
import { getClientRoutes } from "./modules/moduleRegistry";

const FullLayout = lazy(() => import("./layouts/FullLayout"));
const NoSidebarLayout = lazy(() => import("./layouts/NoSidebarLayout"));
const ContentOnlyLayout = lazy(() => import("./layouts/ContentOnly"));

const Status = lazy(() => import("./pages/Status"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Admin = lazy(() => import("./pages/Admin"));

const Layout = () => {
    const { store } = useContext(Context);
    const moduleRoutes = getClientRoutes(store);

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
                    <Route path="/admin" element={<PrivateWrapper><FullLayout> <Admin /> </FullLayout></PrivateWrapper>} />
                    {moduleRoutes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.element} />
                    ))}
                    <Route element={<h1>Not found!</h1>} path="*" />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default injectContext(Layout);
