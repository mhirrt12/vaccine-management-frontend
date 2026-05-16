import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '70vh',
        background: 'linear-gradient(135deg, #f0f4f8 0%, #d8e6fb 100%)'
      }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted fw-semibold">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    let dashboardPath = '/';
    switch (user.role) {
      case 'parent': dashboardPath = '/parent'; break;
      case 'nurse': dashboardPath = '/nurse'; break;
      case 'admin': dashboardPath = '/admin'; break;
      default: dashboardPath = '/login';
    }
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;