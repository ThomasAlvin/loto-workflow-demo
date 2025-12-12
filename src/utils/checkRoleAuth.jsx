export default function checkRoleAuth(authData) {
  if (authData?.is_superadmin) {
    return "super_admin";
  } else {
    return authData.member?.role || "guest";
  }
}
