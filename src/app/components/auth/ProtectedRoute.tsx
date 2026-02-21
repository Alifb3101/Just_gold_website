import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
