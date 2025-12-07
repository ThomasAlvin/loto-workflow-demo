import { lazy, Suspense } from "react";
import { Outlet, Route } from "react-router-dom";
import ProtectedPage from "./protectedPage.js";
import PageLayout from "../components/Layout/PageLayout.jsx";
import ProcessingLoading from "../components/ProcessingLoading.jsx";
import StarterGuideMemberPage from "../../pages/StarterGuideMemberPage.jsx";
import DepartmentPage from "../../pages/DepartmentPage.jsx";
import SwitchRequestsPage from "../../pages/SwitchRequestsPage.jsx";
import AssignedWorkOrderPage from "../../pages/AssignedWorkOrderPage.jsx";
import SubmitWorkOrderStepPage from "../../pages/SubmitWorkOrderStepPage.jsx";
import NotFoundPage from "../../pages/NotFoundPage.jsx";

const LoginPage = lazy(() => import("../../pages/LoginPage.jsx"));
const ForgotPasswordPage = lazy(() =>
  import("../../pages/ForgotPasswordPage.jsx")
);
const StarterGuidePage = lazy(() => import("../../pages/StarterGuidePage.jsx"));
const NotificationPage = lazy(() => import("../../pages/NotificationPage.jsx"));
const AccountSettingsPage = lazy(() =>
  import("../../pages/AccountSettingsPage.jsx")
);
const ActivitiesPage = lazy(() => import("../../pages/ActivitiesPage.jsx"));
const WorkSitesPage = lazy(() => import("../../pages/WorkSitesPage.jsx"));
const EquipmentMachinesPage = lazy(() =>
  import("../../pages/EquipmentMachinesPage.jsx")
);
const CreateEquipmentMachinePage = lazy(() =>
  import("../../pages/CreateEquipmentMachinePage.jsx")
);
const EditEquipmentMachinePage = lazy(() =>
  import("../../pages/EditEquipmentMachinePage.jsx")
);
const MachineCategoryPage = lazy(() =>
  import("../../pages/MachineCategoryPage.jsx")
);
const InspectionFormPage = lazy(() =>
  import("../../pages/InspectionFormPage.jsx")
);
const LockInventoryPage = lazy(() =>
  import("../../pages/LockInventoryPage.jsx")
);
const EditLockPage = lazy(() => import("../../pages/EditLockPage.jsx"));
const MembersPage = lazy(() => import("../../pages/MembersPage.jsx"));
const CreateMemberPage = lazy(() => import("../../pages/CreateMemberPage.jsx"));
const EditMemberPage = lazy(() => import("../../pages/EditMemberPage.jsx"));
const TemplatesPage = lazy(() => import("../../pages/TemplatesPage.jsx"));
const WorkOrdersPage = lazy(() => import("../../pages/WorkOrdersPage.jsx"));
const ReportsPage = lazy(() => import("../../pages/ReportsPage.jsx"));
const DashboardPage = lazy(() => import("../../pages/DashboardPage.jsx"));
const CreateWorkOrderPage = lazy(() =>
  import("../../pages/CreateWorkOrder/index.jsx")
);
const EditWorkOrderPage = lazy(() =>
  import("../pages/EditWorkOrder/index.jsx")
);
const WorkOrderDetailsPage = lazy(() =>
  import("../pages/WorkOrderDetails/index.js")
);
const CreateTemplatePage = lazy(() =>
  import("../pages/CreateTemplate/index.jsx")
);
const EditTemplatePage = lazy(() =>
  import("../../pages/EditTemplate/index.jsx")
);
const ReportDetailsPage = lazy(() =>
  import("../../pages/ReportDetailsPage.jsx")
);
const ReviewsAndApprovalsPage = lazy(() =>
  import("../../pages/ReviewsAndApprovalsPage.jsx")
);
const ReviewDetailsPage = lazy(() =>
  import("../../pages/ReviewDetailsPage.jsx")
);
const newRoleSettingsRoutes = [
  <Route
    key={"LoginPage"}
    path="/login"
    element={
      <ProtectedPage guestOnly={true}>
        <Suspense fallback={<ProcessingLoading />}>
          <LoginPage />
        </Suspense>
      </ProtectedPage>
    }
  ></Route>,
  <Route
    key={"ForgotPasswordPage"}
    path="/forgot-password"
    element={
      <ProtectedPage guestOnly={true}>
        <Suspense fallback={<ProcessingLoading />}>
          <ForgotPasswordPage />
        </Suspense>
      </ProtectedPage>
    }
  ></Route>,
  <Route
    key={"SubmitWorkOrderStepPage"}
    path="/submit-step/:UID/:stepUID"
    element={
      <ProtectedPage
        needLogin={true}
        restrictSuperAdmin={true}
        module={"assigned_work_orders"}
        permission={["full_access"]}
      >
        <Suspense fallback={<ProcessingLoading />}>
          <SubmitWorkOrderStepPage />
        </Suspense>
      </ProtectedPage>
    }
  ></Route>,
  <Route
    element={
      <PageLayout>
        <Outlet />
      </PageLayout>
    }
  >
    ,
    <Route
      key={"StarterGuidePage"}
      path="/starter-guide"
      element={
        <ProtectedPage needLogin={true} needActiveSubscription={true}>
          <Suspense fallback={<ProcessingLoading />}>
            <StarterGuidePage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"StarterGuideMemberPage"}
      path="/starter-guide/member"
      element={
        <ProtectedPage needLogin={true} needActiveSubscription={true}>
          <Suspense fallback={<ProcessingLoading />}>
            <StarterGuideMemberPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"NotificationPage"}
      path="/notification"
      element={
        <ProtectedPage needLogin={true}>
          <Suspense fallback={<ProcessingLoading />}>
            <NotificationPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"AssignedWorkOrderPage"}
      path="/assigned-work-order"
      element={
        <ProtectedPage
          needLogin={true}
          restrictSuperAdmin={true}
          module={"assigned_work_orders"}
          permission={["full_access"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <AssignedWorkOrderPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"AccountSettingsPage"}
      path="/account-settings"
      element={
        <ProtectedPage needLogin={true}>
          <Suspense fallback={<ProcessingLoading />}>
            <AccountSettingsPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"ActivitiesPage"}
      path="/activity"
      element={
        <ProtectedPage needLogin={true}>
          <Suspense fallback={<ProcessingLoading />}>
            <ActivitiesPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"WorkSitesPage"}
      path="/work-site"
      element={
        <ProtectedPage
          needLogin={true}
          module={"work_sites"}
          permission={["view"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <WorkSitesPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    <Route
      key={"EquipmentMachinePage"}
      path="/equipment-machine"
      element={
        <ProtectedPage
          needLogin={true}
          module={"equipment_machines"}
          permission={["view", "view_assigned"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <EquipmentMachinesPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"CreateEquipmentMachinePage"}
      path="/equipment-machine/create"
      element={
        <ProtectedPage
          needLogin={true}
          module={"equipment_machines"}
          permission={["manage"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <CreateEquipmentMachinePage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"EditEquipmentMachinePage"}
      path="/equipment-machine/edit/:UID"
      element={
        <ProtectedPage
          needLogin={true}
          module={"equipment_machines"}
          permission={["manage"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <EditEquipmentMachinePage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"MachineCategoriesPage"}
      path="/machine-categories"
      element={
        <ProtectedPage
          needLogin={true}
          module={"equipment_machines"}
          permission={["view"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <MachineCategoryPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"InspectionFormPage"}
      path="/inspection-form"
      element={
        <ProtectedPage
          needLogin={true}
          module={"equipment_machines"}
          permission={["view"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <InspectionFormPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"DepartmentPage"}
      path="/department"
      element={
        <ProtectedPage
          needLogin={true}
          module={"members"}
          permission={["view"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <DepartmentPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"LockInventoryPage"}
      path="/lock-inventory"
      element={
        <ProtectedPage
          needLogin={true}
          module={"lock_inventory"}
          permission={["view", "view_assigned"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <LockInventoryPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    <Route
      key={"EditLockPage"}
      path="/lock-inventory/edit/:UID"
      element={
        <ProtectedPage
          needLogin={true}
          module={"lock_inventory"}
          permission={["manage"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <EditLockPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"MembersPage"}
      path="/member"
      element={
        <ProtectedPage
          needLogin={true}
          module={"members"}
          permission={["view"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <MembersPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"CreateMemberPage"}
      path="/member/create"
      element={
        <ProtectedPage
          needLogin={true}
          module={"members"}
          permission={["manage_admin", "manage_member", "manage_finance"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <CreateMemberPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"EditMemberPage"}
      path="/member/edit/:UID"
      element={
        <ProtectedPage
          needLogin={true}
          module={"members"}
          permission={["manage_admin", "manage_member", "manage_finance"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <EditMemberPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"TemplatesPage"}
      path="/template"
      element={
        <ProtectedPage
          needLogin={true}
          module={"work_orders"}
          permission={["view", "view_owned"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <TemplatesPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"WorkOrdersPage"}
      path="/work-order"
      element={
        <ProtectedPage
          needLogin={true}
          module={"work_orders"}
          permission={["view", "view_owned"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <WorkOrdersPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"ReportPage"}
      path="/report"
      element={
        <ProtectedPage
          needLogin={true}
          module={"reports"}
          permission={["view", "view_assigned"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <ReportsPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"DashboardPage"}
      path="/"
      element={
        <ProtectedPage
          needLogin={true}
          module={"dashboard"}
          permission={["view"]}
          isDashboard={true}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <DashboardPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
    <Route
      key={"ReviewsAndApprovalPage"}
      path="/review"
      element={
        <ProtectedPage
          needLogin={true}
          module={"reviews"}
          permission={["view_assigned"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <ReviewsAndApprovalsPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    <Route
      key={"SwitchRequestsPage"}
      path="/switch-request"
      element={
        <ProtectedPage
          needLogin={true}
          module={"switch_requests"}
          permission={["view_owned"]}
        >
          <Suspense fallback={<ProcessingLoading />}>
            <SwitchRequestsPage />
          </Suspense>
        </ProtectedPage>
      }
    ></Route>
    ,
  </Route>,

  <Route
    key={"ReviewsDetailsPage"}
    path="/review/:UID"
    element={
      <ProtectedPage
        needLogin={true}
        module={"reviews"}
        permission={["view_assigned"]}
      >
        <Suspense fallback={<ProcessingLoading />}>
          <ReviewDetailsPage />
        </Suspense>
      </ProtectedPage>
    }
  ></Route>,
  <Route
    key={"CreateWorkOrderPage"}
    path="/work-order/create"
    element={
      <ProtectedPage
        needLogin={true}
        module={"work_orders"}
        permission={["manage"]}
      >
        <Suspense fallback={<ProcessingLoading />}>
          <CreateWorkOrderPage />
        </Suspense>
      </ProtectedPage>
    }
  ></Route>,
  <Route
    key={"EditWorkOrderPage"}
    path="/work-order/edit/:UID"
    element={
      <ProtectedPage
        needLogin={true}
        module={"work_orders"}
        permission={["manage"]}
      >
        <Suspense fallback={<ProcessingLoading />}>
          <EditWorkOrderPage />
        </Suspense>
      </ProtectedPage>
    }
  ></Route>,

  <Route
    key={"WorkOrderDetailsPage"}
    path="/work-order/:UID"
    element={
      <ProtectedPage
        needLogin={true}
        // module={"work_orders"}
        // permission={["view", "view_owned"]}
      >
        <Suspense fallback={<ProcessingLoading />}>
          <WorkOrderDetailsPage />
        </Suspense>
      </ProtectedPage>
    }
  ></Route>,
  <Route
    key={"CreateTemplatePage"}
    path="/template/create"
    element={
      <ProtectedPage
        needLogin={true}
        module={"work_orders"}
        permission={["manage"]}
      >
        <Suspense fallback={<ProcessingLoading />}>
          <CreateTemplatePage />
        </Suspense>
      </ProtectedPage>
    }
  ></Route>,
  <Route
    key={"EditTemplatePage"}
    path="/template/edit/:UID"
    element={
      <ProtectedPage
        needLogin={true}
        module={"work_orders"}
        permission={["manage"]}
      >
        <Suspense fallback={<ProcessingLoading />}>
          <EditTemplatePage />
        </Suspense>
      </ProtectedPage>
    }
  ></Route>,

  <Route
    key={"ReportDetailsPage"}
    path="/report/:UID"
    element={
      <ProtectedPage
        needLogin={true}
        module={"reports"}
        permission={["view", "view_assigned"]}
      >
        <Suspense fallback={<ProcessingLoading />}>
          <ReportDetailsPage />
        </Suspense>
      </ProtectedPage>
    }
  ></Route>,
  <Route path="*" element={<NotFoundPage />} />,
];
export default newRoleSettingsRoutes;
