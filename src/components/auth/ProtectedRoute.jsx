import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext.jsx';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAdmin();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect unauthenticated requests to /login, keeping the intended path in location state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
