import checkRoleAuth from "./checkRoleAuth";
import defaultRoleAccessibility from "./defaultRolesAccessibility";

export default function getAccessibilityByRole(authData, isSubscriptionValid) {
  if (isSubscriptionValid) {
    if (authData?.member?.accessibility?.modules) {
      return authData?.member?.accessibility?.modules;
    } else {
      const roleAccessibility = defaultRoleAccessibility.find(
        (r) => r.technicalName === checkRoleAuth(authData)
      );
      return roleAccessibility ? roleAccessibility.modules : [];
    }
  } else {
    return [];
  }
}
