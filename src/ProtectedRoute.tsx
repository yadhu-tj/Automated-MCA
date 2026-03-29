import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const adminToken = localStorage.getItem("adminToken");
  return adminToken ? children : <Navigate to="/" replace />;
}
