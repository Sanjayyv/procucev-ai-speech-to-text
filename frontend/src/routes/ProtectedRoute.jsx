
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getUserProfile } from '../services/authService';

const ProtectedRoute = () => {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    getUserProfile()
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false));
  }, []);

  if (authenticated === null) {
    return <div>Checking authentication...</div>;
  }

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
