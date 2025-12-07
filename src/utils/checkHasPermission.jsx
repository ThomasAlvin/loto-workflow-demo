export default function checkHasPermission(
  user,
  module,
  permissions,
  roles,
  mode = "any",
) {
  if (user.role === "super_admin") return true;

  const modulePermissions = user.permissions?.find(
    (perm) => perm.name === module,
  );
  // Belum siap
  // if (mode === "all") {
  //   return permissions.every((permName) =>
  //     modulePermissions?.permissions.some(
  //       (perm) => perm.permission === permName
  //     )
  //   );
  // }

  if (mode === "any") {
    if (
      roles?.length &&
      roles?.some((role) => {
        return user.role === role;
      })
    ) {
      return true;
    }
    return permissions.some((permName) =>
      modulePermissions?.permissions.some(
        (perm) => perm.permission === permName,
      ),
    );
  }

  return false;
}
