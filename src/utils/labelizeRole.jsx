export default function labelizeRole(role, hasCustomPermission = false) {
  let labelizedRole = "";
  switch (role) {
    case "owner":
      labelizedRole = "Template Owner";
      break;
    case "guest":
      labelizedRole = "Guest";
      break;
    case "guest_member":
      labelizedRole = "Guest";
      break;
    case "member":
      labelizedRole = "Member";
      break;
    case "authorized_user":
      labelizedRole = "Authorized User";
      break;
    case "authorized_employee":
      labelizedRole = "Authorized Employee";
      break;
    case "affected_employee":
      labelizedRole = "Affected Employee";
      break;
    case "supervisor":
      labelizedRole = "Supervisor";
      break;
    case "safety_officer":
      labelizedRole = "Safety Officer";
      break;
    case "contractor":
      labelizedRole = "Contractor";
      break;
    case "admin":
      labelizedRole = "Admin";
      break;
    case "super_admin":
      labelizedRole = "Super Admin";
      break;
    case "finance":
      labelizedRole = "Finance";
      break;
    default:
      labelizedRole = role; // Or some default icon if needed
      break;
  }
  if (hasCustomPermission) {
    labelizedRole += " (Custom)";
  }
  return labelizedRole;
}
