const AssignedRoleMapper = (status) => {
  switch (status) {
    case "co-creator":
      return {
        bgColor: "#FDE2E2",
        textColor: "#dc143c",
        text: "Co-Creator",
      };
    case "creator":
      return {
        bgColor: "#FDE2E2",
        textColor: "#dc143c",
        text: "Creator",
      };
    case "assignee":
      return {
        bgColor: "#e6e6fa",
        textColor: "#7059ff",
        text: "Assignee",
      };

    case "notified_member":
      return {
        bgColor: "#fff1d9",
        textColor: "#ff8629",
        text: "Notified Member",
      };

    case "reviewer":
      return {
        bgColor: "#cfecff",
        textColor: "#19a3ff",
        text: "Reviewer",
      };

    default:
      return {
        bgColor: "#FFFFFF",
        textColor: "#000000",
        text: "Unknown Role",
      };
  }
};
export default AssignedRoleMapper;
