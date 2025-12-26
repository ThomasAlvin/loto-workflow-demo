import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedPage({
  children,
  needLogin = false,
  needActiveSubscription = false,
  guestOnly = false,
  expiredOnly = false,
  signedInOnly = false,
  isDashboard = false,
  restrictSuperAdmin = false,
  module,
  permission,
  roles,
}) {
  const userSelector = useSelector((state) => state.login.auth);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const hasPermission = () => {
    if (userSelector.role === "super_admin") {
      if (restrictSuperAdmin) return false;

      return true;
    }

    if (roles?.length) {
      if (module && permission) {
        if (
          roles?.some((role) => {
            return userSelector.role === role;
          })
        ) {
          return true;
        }
      } else {
        return roles?.some((role) => {
          return userSelector.role === role;
        });
      }
    }

    if (module && permission) {
      const modulePermissions = userSelector.permissions?.find(
        (perm) => perm.name === module
      );
      return permission.some((permName) => {
        return modulePermissions?.permissions.some(
          (perm) => perm.permission === permName
        );
      });
    }
    return true;
  };
  useEffect(() => {
    if (!userSelector?.email && needLogin) {
      setIsLoading(false);
      navigate("/login");
      return;
    }

    if (
      (guestOnly && userSelector?.email) ||
      (expiredOnly && userSelector?.is_subscription_valid)
    ) {
      setIsLoading(false);
      navigate("/starter-guide");
      return;
    }

    if (signedInOnly && userSelector.role === "guest") {
      setIsLoading(false);
      navigate("/starter-guide");
      return;
    }
    if (
      !userSelector.is_subscription_valid &&
      !userSelector.is_superadmin &&
      !userSelector.role === "guest" &&
      ((roles && roles.length) ||
        (permission && permission.length) ||
        needActiveSubscription)
    ) {
      setIsLoading(false);
      navigate("/subscription-expired"); // Redirect if the user lacks permission
      return;
    }

    if (!hasPermission()) {
      setIsLoading(false);
      if (isDashboard) {
        navigate("/starter-guide");
      } else {
        navigate("/unauthorized");
      }
      return;
    }

    setIsLoading(false);
  }, [userSelector, navigate, needLogin, guestOnly]);

  return isLoading ? <Loading /> : <>{children}</>;
}
