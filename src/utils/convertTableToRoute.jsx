export default function convertTableToRoute(tableName, UID) {
  switch (tableName) {
    case "categories":
      return `/machine-categories`;
    case "machines":
      return `/equipment-machine`;
    case "inspection_forms":
      return `/inspection-form`;
    case "locks":
      return `/lock-inventory`;
    case "members":
      return `/member`;
    case "templates":
      return `/template`;
    case "work_sites":
      return `/work-site`;
    // -X disable role settings page X-
    // case "accessibility":
    //   return `/role`;
    case "work_orders":
      if (UID) {
        return `/work-order/${UID}`;
      } else {
        return `/work-order`;
      }
    case "report":
      if (UID) {
        return `/report/${UID}`;
      } else {
        return `/report`;
      }

    default:
      return "";
  }
}
