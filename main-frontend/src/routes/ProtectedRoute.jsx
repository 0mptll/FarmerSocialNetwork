import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    // If user is not logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If roles are specified and the user's role is not allowed, redirect to home
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
