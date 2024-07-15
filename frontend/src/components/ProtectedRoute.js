import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, ...rest }) => {
  const isAuthenticated = localStorage.getItem('token'); // Adjust according to your auth logic

  return isAuthenticated ? element : <Navigate to="/" />;
};

export default ProtectedRoute;
