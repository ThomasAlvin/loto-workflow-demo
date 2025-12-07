import { signOut } from "firebase/auth";
import { api } from "../../api/api";
import { auth, messaging } from "../../firebase/firebase";
import { getToken, deleteToken } from "firebase/messaging";
import GetFcmToken from "../../utils/GetFcmToken";
import { disconnectEcho } from "../../pusher/echo";

const init = {
  id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  role: "",
  image_url: "",
  login_loading: false,
  permissions: [],
};

async function logout() {
  try {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const currentToken = await GetFcmToken();
    if (!isSafari) {
      await deleteToken(messaging);
    }
    try {
      await api.post(`user/logout`, { tokenFCM: currentToken });

      disconnectEcho();
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out from API:", error);
      disconnectEcho();
      await signOut(auth);
    }
    return init;
  } catch (error) {
    console.error("Error logging out or deleting FCM token:", error);
  }
}

function adminReducer(state = init, action) {
  if (action.type === "login") {
    return {
      ...state,
      id: action.payload.id,
      first_name: action.payload.first_name,
      last_name: action.payload.last_name,
      email: action.payload.email,
      phone_number: action.payload.phone_number,
      is_superadmin: action.payload?.is_superadmin,
      role: action.payload?.role,
      profile_image_url: action.payload.profile_image_url,
      company_logo_image_url: action.payload.company_logo_image_url,
      company_name: action.payload.company_name,
      current_work_site: action.payload.current_work_site,
      main_work_site: action.payload.main_work_site,
      permissions: action.payload.permissions,
      subscription: action.payload.subscription,
      is_trial: action.payload.is_trial,
      is_2fa_enabled: action.payload.is_2fa_enabled,
      two_factor_type_default: action.payload.two_factor_type_default,
      is_valid_2fa: action.payload.is_valid_2fa,
      is_subscription_valid: action.payload.is_subscription_valid,
      login_loading: false,
    };
  } else if (action.type === "reset") {
    disconnectEcho();
    return init;
  } else if (action.type === "startLoading") {
    return { ...init, login_loading: true };
  } else if (action.type === "stopLoading") {
    return { ...init, login_loading: false };
  } else if (action.type === "logout") {
    logout();
  }

  return state;
}

export default adminReducer;
