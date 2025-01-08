import React, { useEffect } from "react";
import { useAuth } from "src/services/AuthContext";
import SignIn from "src/routes/SignIn";
import { useTranslation } from "react-i18next";
import axiosAuthenticated from "src/services/Axios";
import { auth } from "src/services/FirebaseConfig";
import { UserRoleObject } from "shared/UserRoleObject";
import { useState } from "react";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const AUTHENTICATION_SERVICE_URL = import.meta.env.VITE_AUTHENTICATION_SERVICE_URL;
  const [userRole, setUserRole] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        axiosAuthenticated
          .get(`${AUTHENTICATION_SERVICE_URL}/user/${auth.currentUser?.uid}`)
          .then((response) => {
            if (response.data.role) {
              setUserRole(response.data.role);
            } else {
              return <div>{t("route_protected_route.loading")}</div>;
            }
          });
      } catch (error) {
        console.error("Error getting user role: ", error);
      }
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return <div>{t("route_protected_route.loading")}</div>;
  }

  if (
    isAuthenticated &&
    (userRole === UserRoleObject.tenant_admin ||
      userRole === UserRoleObject.solution_admin)
  ) {
    return children;
  } else {
    return <SignIn />;
  }
};

export default PrivateRoute;