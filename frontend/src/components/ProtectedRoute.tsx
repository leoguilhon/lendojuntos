import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PageLoading } from "./PageLoading";

export function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading message="Carregando sua sessão..." />;
  }

  return token ? <Outlet /> : <Navigate to="/" replace />;
}
