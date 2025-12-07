export default function CheckRoleAuth(authData) {
  if (authData?.is_superadmin) {
    return "super_admin";
  } else {
    return authData.member?.role || "guest";
  }
}
