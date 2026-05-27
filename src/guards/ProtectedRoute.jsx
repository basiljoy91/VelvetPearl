import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, verifyToken } from '../services/authService';

export default function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        setIsValid(false);
        return;
      }
      const result = await verifyToken();
      setIsValid(result.valid);
    };
    checkAuth();
  }, []);

  if (isValid === null) {
    return <div className="h-screen w-full bg-background flex items-center justify-center text-[#EFBF04]">Verifying Session...</div>;
  }

  if (!isValid) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
