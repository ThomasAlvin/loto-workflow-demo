import superAdminUserAuth from "../data/superAdminUserAuth.json";
import adminUserAuth from "../data/adminUserAuth.json";
import notificationsPagination from "../data/notificationsPagination.json";
import workSites from "../data/workSites.json";
import dashboard from "../data/dashboard.json";
import activitiesPagination from "../data/activitiesPagination.json";
import assignedWorkOrdersPagination from "../data/assignedWorkOrdersPagination.json";
import machineCategories from "../data/machineCategories.json";
import departments from "../data/departments.json";
import customAccessibility from "../data/customAccessibility.json";
import departmentsPagination from "../data/departmentsPagination.json";
import editEquipmentMachines from "../data/editEquipmentMachines.json";
import editLocks from "../data/editLocks.json";
import editMembers from "../data/editMembers.json";
import equipmentMachinesPagination from "../data/equipmentMachinesPagination.json";
import inspectionFormsPagination from "../data/inspectionFormsPagination.json";
import locksPagination from "../data/locksPagination.json";
import machineCategoriesPagination from "../data/machineCategoriesPagination.json";
import inspectionForms from "../data/inspectionForms.json";
import membersPagination from "../data/membersPagination.json";
import memberActivities from "../data/memberActivities.json";
import memberAccessibility from "../data/memberAccessibility.json";
import reportDetails from "../data/reportDetails.json";
import reportsPagination from "../data/reportsPagination.json";
import reviewDetails from "../data/reviewDetails.json";
import reviewsPagination from "../data/reviewsPagination.json";
import submitWorkOrderStep from "../data/submitWorkOrderStep.json";
import switchRequestsPagination from "../data/switchRequestsPagination.json";
import members from "../data/members.json";
import templatesPagination from "../data/templatesPagination.json";
import workOrdersPagination from "../data/workOrdersPagination.json";
import templates from "../data/templates.json";
import allSelection from "../data/allSelection.json";
import editTemplate from "../data/editTemplate.json";
import editWorkOrder from "../data/editWorkOrder.json";
import workOrderDetails from "../data/workOrderDetails.json";
import workOrderDetailsAuditLog from "../data/workOrderDetailsAuditLog.json";

async function delay(ms = 2000) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
function errorMessage(message) {
  return {
    response: {
      data: { message },
    },
  };
}
export const mockApi = {
  login: async (loginInput = { email: "", password: "" }) => {
    await delay();
    if (
      loginInput.email === "test@gmail.com" &&
      loginInput.password === "Test@123"
    ) {
      return {
        data: {
          user: superAdminUserAuth,
        },
      };
    } else if (
      loginInput.email === "testAdmin@gmail.com" &&
      loginInput.password === "Test@123"
    ) {
      return {
        data: {
          user: adminUserAuth,
        },
      };
    } else {
      throw errorMessage("Invalid email or password");
    }
  },
  logout: async () => {
    await delay();
    return;
  },
  testSubmit: async (successMessage) => {
    await delay();
    return {
      data: {
        message:
          successMessage +
          " (This is a demo environment. Data is not persisted.)",
      },
    };
  },
  getDummy: async () => {
    await delay();
    return null;
  },
  getWorkOrderDetailsAuditLogByUID: async (UID) => {
    await delay();
    return {
      data: {
        ...workOrderDetailsAuditLog.find((val) => val.workOrderUID === UID),
      },
    };
  },
  getWorkOrderDetailsByUID: async (UID) => {
    await delay();
    return {
      data: {
        ...workOrderDetails.find((val) => val.workOrder.UID === UID),
      },
    };
  },
  getWorkOrderByUID: async (UID) => {
    await delay();
    return {
      data: {
        ...editWorkOrder.find((val) => val.workOrder.UID === UID),
      },
    };
  },
  downloadReportPdfByName: async (name) => {
    await delay();
    const fileUrl = `/pdf/report_${name}.pdf`;

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `report_${name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  },
  getTemplateByUID: async (UID) => {
    await delay();
    return {
      data: {
        ...editTemplate.find((val) => val.template.UID === UID),
      },
    };
  },
  getAllSelection: async () => {
    await delay();
    return {
      data: allSelection,
    };
  },
  getTemplates: async () => {
    await delay();
    return {
      data: {
        ...templates,
      },
    };
  },
  getAuth: async () => {
    await delay();
    return {
      data: {
        user: superAdminUserAuth,
      },
    };
  },
  getWorkOrderPagination: async () => {
    await delay();
    return {
      data: {
        ...workOrdersPagination,
      },
    };
  },
  getTemplatePagination: async () => {
    await delay();
    return {
      data: {
        ...templatesPagination,
      },
    };
  },
  getMembers: async () => {
    await delay();
    return {
      data: {
        ...members,
      },
    };
  },
  getSwitchRequestPagination: async () => {
    await delay();
    return {
      data: {
        ...switchRequestsPagination,
      },
    };
  },
  getSubmitWorkOrderStep: async () => {
    await delay();
    return {
      data: {
        ...submitWorkOrderStep,
      },
    };
  },
  getReviewPagination: async () => {
    await delay();
    return {
      data: {
        ...reviewsPagination,
      },
    };
  },
  getReviewDetails: async (UID) => {
    await delay();
    return {
      data: {
        ...reviewDetails.find((val) => val.report.UID === UID),
      },
    };
  },
  getReportPagination: async () => {
    await delay();
    return {
      data: {
        ...reportsPagination,
      },
    };
  },
  getReportDetails: async (UID) => {
    await delay();
    return {
      data: {
        ...reportDetails.find((val) => val.report.UID === UID),
      },
    };
  },
  getMemberActivities: async (UID) => {
    await delay();
    return {
      data: {
        ...memberActivities.find((val) => val.memberUID === UID),
      },
    };
  },
  getMemberAccessibility: async (UID) => {
    await delay();
    return {
      data: {
        ...memberAccessibility.find((val) => val.memberUID === UID),
      },
    };
  },
  getMemberPagination: async () => {
    await delay();
    return {
      data: {
        ...membersPagination,
      },
    };
  },
  getInspectionForms: async () => {
    await delay();
    return {
      data: {
        ...inspectionForms,
      },
    };
  },
  getMachineCategoryPagination: async () => {
    await delay();
    return {
      data: {
        ...machineCategoriesPagination,
      },
    };
  },
  getLockPagination: async () => {
    await delay();
    return {
      data: {
        ...locksPagination,
      },
    };
  },
  getInspectionFormsPagination: async () => {
    await delay();
    return {
      data: {
        ...inspectionFormsPagination,
      },
    };
  },
  getEquipmentMachinesPagination: async () => {
    await delay();
    return {
      data: {
        ...equipmentMachinesPagination,
      },
    };
  },
  getNotificationsPagination: async () => {
    await delay();
    return notificationsPagination;
  },
  getMemberByUID: async (UID) => {
    await delay();
    return {
      data: {
        ...editMembers.find((val) => val.member.UID === UID),
      },
    };
  },
  getLockByUID: async (UID) => {
    await delay();
    return {
      data: {
        lock: {
          ...editLocks.find((val) => val.UID === UID),
        },
      },
    };
  },
  getEquipmentMachineByUID: async (UID) => {
    await delay();
    return {
      data: {
        machine: {
          ...editEquipmentMachines.find((val) => val.UID === UID),
        },
      },
    };
  },
  getDepartmentsPagination: async () => {
    await delay();
    return {
      data: {
        ...departmentsPagination,
      },
    };
  },
  getCustomAccessibility: async () => {
    await delay();
    return {
      data: {
        ...customAccessibility,
      },
    };
  },
  getDepartments: async () => {
    await delay();
    return {
      data: {
        ...departments,
      },
    };
  },
  getDashboard: async () => {
    await delay();
    return {
      data: {
        ...dashboard,
      },
    };
  },
  getActivitiesPagination: async () => {
    await delay();
    return {
      data: {
        ...activitiesPagination,
      },
    };
  },
  getAssignedWorkOrdersPagination: async () => {
    await delay();
    return {
      data: {
        ...assignedWorkOrdersPagination,
      },
    };
  },
  getMachineCategories: async () => {
    await delay();
    return {
      data: {
        ...machineCategories,
      },
    };
  },
  getWorkSites: async () => {
    await delay();
    return {
      data: {
        ...workSites,
      },
    };
  },
  getWorkOrders: async () => {
    return delay([
      { id: 1, title: "Replace Valve A", status: "open" },
      { id: 2, title: "Check Machine B", status: "in_progress" },
    ]);
  },

  getWorkOrderById: async (id) => {
    return delay({
      id,
      title: "Replace Valve A",
      steps: [
        { id: "s1", name: "Shutdown power" },
        { id: "s2", name: "Apply locks" },
      ],
    });
  },
};

export const api = mockApi;
