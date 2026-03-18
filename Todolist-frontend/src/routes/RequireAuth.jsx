import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children }) => {
    const auth = useSelector((state) => state.auth.auth);
    const location = useLocation();

    if (!auth) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}

export default RequireAuth;