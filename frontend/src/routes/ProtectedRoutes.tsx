import React from "react";
import { useAuth } from "src/services/AuthContext";
import SignIn from "src/routes/SignIn";
import { useTranslation } from "react-i18next";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  if (isAuthenticated === null) {
    return <div>{t("route_protected_route.loading")}</div>;
  }

  return isAuthenticated ? children : <SignIn />;
};

export default ProtectedRoute;
