export default function getNotificationLinkByEvent(event, resource_UID) {
  switch (event) {
    case "member":
      if (resource_UID) {
        return `/member`;
      } else {
        return `/member`;
      }

    case "inspection_form":
      if (resource_UID) {
        return `/inspection-form`;
      } else {
        return `/inspection-form`;
      }

    case "lock":
      if (resource_UID) {
        return `/lock-inventory`;
      } else {
        return `/lock-inventory`;
      }

    case "machine_category":
      if (resource_UID) {
        return `/machine-category`;
      } else {
        return `/machine-category`;
      }

    case "machine":
      if (resource_UID) {
        return `/equipment-machine`;
      } else {
        return `/equipment-machine`;
      }

    case "report":
      if (resource_UID) {
        return `/report/${resource_UID}`;
      } else {
        return `/report`;
      }

    case "work_order":
      if (resource_UID) {
        return `/work-order/${resource_UID}`;
      } else {
        return `/work-order`;
      }

    case "work_order_assigned":
      if (resource_UID) {
        return `/assigned-work-order`;
      } else {
        return `/assigned-work-order`;
      }

    case "template":
      if (resource_UID) {
        return `/template`;
      } else {
        return `/template`;
      }

    case "subscription":
      if (resource_UID) {
        return `/subscription`;
      } else {
        return `/subscription`;
      }
    default:
      return null;
      break;
  }
}
