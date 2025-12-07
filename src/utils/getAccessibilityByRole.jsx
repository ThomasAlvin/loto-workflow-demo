import CheckRoleAuth from "./checkRoleAuth";
import DefaultRoleAccessibility from "./DefaultRolesAccessibility";

export default function getAccessibilityByRole(authData, isSubscriptionValid) {
  if (isSubscriptionValid) {
    if (authData?.member?.accessibility?.modules) {
      return authData?.member?.accessibility?.modules;
    } else {
      const roleAccessibility = DefaultRoleAccessibility.find(
        (r) => r.technicalName === CheckRoleAuth(authData)
      );
      return roleAccessibility ? roleAccessibility.modules : [];
    }
  } else {
    return [];
  }
}
