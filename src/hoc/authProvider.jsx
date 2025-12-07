import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../api/api";
import Loading from "../components/Loading";
import { v4 as uuid } from "uuid";
import { useToast } from "@chakra-ui/react";
import CheckRoleAuth from "../../utils/checkRoleAuth";
import getAccessibilityByRole from "../../utils/getAccessibilityByRole";
export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  // const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const userSelector = useSelector((state) => state.login.auth);

  async function initializeAuth() {
    if (user) {
      try {
        const authData = await api
          .get("user/auth")
          .then((res) => res.data.user)
          .catch((error) => {
            toast({
              title: error.error,
              description:
                "Please try again or contact support if the issue persists.",
              status: "error",
              duration: 5000,
              position: "top",
              isClosable: true,
            });
          });
        const currentWorkSite = userSelector?.current_work_site;
        dispatch({
          type: "login",
          payload: {
            ...authData,
            role: CheckRoleAuth(authData),
            current_work_site: currentWorkSite,
            uuid: uuid(),
            subscription: authData.subscriptions,
            current_work_site: currentWorkSite || authData.main_work_site,
            permissions: getAccessibilityByRole(authData, isSubscriptionValid),
            is_subscription_valid: isSubscriptionValid,
          },
        });
        dispatch({ type: "stopLoading" });
      } catch (err) {
        console.log("Error during authentication:", err);
        dispatch({
          type: "logout",
        });
      }
    } else {
      dispatch({
        type: "reset",
      });
    }

    setIsLoading(false);
  }
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <>
      <>{isLoading ? <Loading /> : children}</>
    </>
  );
}
