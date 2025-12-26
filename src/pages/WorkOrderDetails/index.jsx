import { Box, useDisclosure, useToast } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useLoading } from "../../service/LoadingContext";
import WorkOrderDetailsOverviewPage from "./WorkOrderDetailsOverviewPage.jsx";
import WorkOrderDetailsAuditLogPage from "./WorkOrderDetailsAuditLogPage.jsx";
import { useParams } from "react-router-dom";
import { api } from "../../api/api.js";
import Swal from "sweetalert2";
import SwalErrorMessages from "../../components/SwalErrorMessages.jsx";
import WorkOrderDetailsReviewsPage from "./WorkOrderDetailsReviewsPage.jsx";
import WorkOrderDetailsLayout from "../../components/Layout/WorkOrderDetailsLayout.jsx";
import WorkOrderDetails404Page from "./WorkOrderDetails404Page.jsx";
import { useSelector } from "react-redux";
import CustomToast from "../../components/CustomToast.jsx";
import SendReminderModal from "../../components/WorkOrders/SendReminderModal.jsx";
import checkHasPermission from "../../utils/checkHasPermission.jsx";
import { ReactFlowProvider } from "@xyflow/react";
import { DeleteMultiLockAccessProvider } from "../../service/DeleteMultiLockAccessContext.jsx";

export default function WorkOrderDetailsPage() {
  const pageModule = "work_orders";
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const abortControllerRef2 = useRef(new AbortController()); // Persistent controller
  const userSelector = useSelector((state) => state.login.auth);
  const workSiteUID = userSelector.current_work_site?.id;
  const [cancelNextPusherToast, setCancelNextPusherToast] = useState(false);
  const [currentPage, setCurrentPage] = useState("overview");
  const [fetchError, setFetchError] = useState(false);
  const [from, setFrom] = useState();
  const [rows, setRows] = useState(10);
  const [showing, setShowing] = useState(0);
  const [auditLogs, setAuditLogs] = useState([]);
  const [totalPages, setTotalPages] = useState(null);
  const [currentAuditLogPage, setCurrentAuditLogPage] = useState(1);
  const { loading, setLoading } = useLoading();
  const [auditLogLoading, setAuditLogLoading] = useState(true);
  const [memberSelection, setMemberSelection] = useState([]);
  const [workOrder, setWorkOrder] = useState();
  const { UID } = useParams();
  const [abortStepButtonLoading, setAbortStepButtonLoading] = useState();
  const [switchAssigneeButtonLoading, setSwitchAssigneeButtonLoading] =
    useState();
  const [sendReminderButtonLoading, setSendReminderButtonLoading] =
    useState(false);
  const [selectedSendReminderMember, setSelectedSendReminderMember] =
    useState(false);
  const sendReminderDisclosure = useDisclosure();

  const toast = useToast();
  const creatorEmail = workOrder?.creator?.email;
  const coCreatorsEmail = workOrder?.co_creator_members?.map(
    (coCreator) => coCreator.user.email
  );
  const stepDetailsDisclosure = useDisclosure();

  const hasManagePermission =
    ((userSelector?.email === creatorEmail ||
      coCreatorsEmail?.some(
        (coCreatorEmail) => coCreatorEmail === userSelector.email
      )) &&
      checkHasPermission(userSelector, pageModule, ["manage"])) ||
    (checkHasPermission(userSelector, pageModule, ["view"]) &&
      checkHasPermission(userSelector, pageModule, ["manage"]));
  function setAndUpdateWorkOrderData(newWorkOrderData) {
    const uniqueAssigneesSet = new Set();
    const uniqueAssignees = [];
    const uniqueNotifiedMembersSet = new Set();
    const uniqueNotifiedMembers = [];
    const uniqueAssignedMachinesSet = new Set();
    const uniqueAssignedMachines = [];
    const uniqueAssignedLocksSet = new Set();
    const uniqueAssignedLocks = [];
    const uniqueAssignedReviewerSet = new Set();
    const uniqueAssignedReviewer = [];

    newWorkOrderData?.latest_work_order_reviews?.map((review) => {
      const reviewers = review.work_order_reviewer_members;
      reviewers.map((reviewer) => {
        const filteredReviewer = reviewer?.super_admin
          ? reviewer.super_admin
          : {
              ...reviewer.member.user,
              memberUID: reviewer.member.UID,
              employee_id: reviewer.member.employee_id,
              role: reviewer.member.role,
            };
        if (
          filteredReviewer.email &&
          !uniqueAssignedReviewerSet.has(filteredReviewer.email)
        ) {
          uniqueAssignedReviewerSet.add(filteredReviewer.email);
          uniqueAssignedReviewer.push(filteredReviewer);
        }
      });
    });
    newWorkOrderData?.work_order_steps.map((step) => {
      // -X multi assign problem X-
      const assignees = step.assigned_members;
      // -X multi assign problem X-
      const notifiedMembers = step.notified_members;
      const assigned_machines = step.work_order_step_machines;
      const assigned_locks =
        step?.work_order_multi_lock_group?.work_order_multi_lock_group_items;

      if (assignees.length) {
        assignees.map((assignee) => {
          if (
            assignee?.user.email &&
            !uniqueAssigneesSet.has(assignee.user.email)
          ) {
            uniqueAssigneesSet.add(assignee.user.email);
            uniqueAssignees.push(assignee);
          }
        });
      }

      if (notifiedMembers.length) {
        notifiedMembers.map((notifMember) => {
          if (
            notifMember?.user.email &&
            !uniqueNotifiedMembersSet.has(notifMember.user.email)
          ) {
            uniqueNotifiedMembersSet.add(notifMember.user.email);
            uniqueNotifiedMembers.push(notifMember);
          }
        });
      }

      assigned_machines.map((assigned_machine) => {
        if (newWorkOrderData.status === "draft") {
          if (
            assigned_machine?.machine.name &&
            !uniqueAssignedMachinesSet.has(assigned_machine.machine.name)
          ) {
            uniqueAssignedMachinesSet.add(assigned_machine.machine.name);
            uniqueAssignedMachines.push(assigned_machine.machine);
          }
        } else {
          if (
            assigned_machine?.name &&
            !uniqueAssignedMachinesSet.has(assigned_machine.name)
          ) {
            uniqueAssignedMachinesSet.add(assigned_machine.name);
            uniqueAssignedMachines.push(assigned_machine);
          }
        }
      });

      assigned_locks?.map((assigned_lock) => {
        if (newWorkOrderData.status === "draft") {
          if (
            assigned_lock?.lock?.name &&
            !uniqueAssignedLocksSet.has(assigned_lock.lock.name)
          ) {
            uniqueAssignedLocksSet.add(assigned_lock.lock.name);
            uniqueAssignedLocks.push(assigned_lock.lock);
          }
        } else {
          if (
            assigned_lock?.name &&
            !uniqueAssignedLocksSet.has(assigned_lock.name)
          ) {
            uniqueAssignedLocksSet.add(assigned_lock.name);
            uniqueAssignedLocks.push(assigned_lock);
          }
        }
      });
    });
    setWorkOrder({
      ...newWorkOrderData,
      assignees: uniqueAssignees,
      notifiedMembers: uniqueNotifiedMembers,
      assignedLocks: uniqueAssignedLocks,
      assignedMachines: uniqueAssignedMachines,
      assignedReviewers: uniqueAssignedReviewer,
    });
    // setSelectedStep({ ...response.data.workOrder.work_order_steps[0], index: 0 });
  }

  async function switchAssignee(
    stepUID,
    requestSwitchAssigneeMemberUID,
    selectedSteps,
    memberUIDs,
    reason,
    closeFunction,
    isRequest = false
  ) {
    setCancelNextPusherToast(true);
    setSwitchAssigneeButtonLoading(true);
    if (isRequest === true) {
      await api
        .testSubmit("Switch request sent successfully")
        .then((response) => {
          abortControllerRef.current.abort();
          abortControllerRef.current = new AbortController();
          fetchWorkOrderDetails(false);
          abortControllerRef2.current.abort();
          abortControllerRef2.current = new AbortController();
          fetchWorkOrderAuditLog();
          Swal.fire({
            title: "Success!",
            text: response.data.message,
            icon: "success",
            customClass: {
              popup: "swal2-custom-popup",
              title: "swal2-custom-title",
              content: "swal2-custom-content",
              actions: "swal2-custom-actions",
              confirmButton: "swal2-custom-confirm-button",
            },
          });
        })
        .catch((error) => {
          Swal.fire({
            title: "Oops...",
            icon: "error",
            html: SwalErrorMessages(error.response.data.message),
            customClass: {
              popup: "swal2-custom-popup",
              title: "swal2-custom-title",
              content: "swal2-custom-content",
              actions: "swal2-custom-actions",
              confirmButton: "swal2-custom-confirm-button",
            },
          });
        })
        .finally(() => {
          closeFunction();
          setSwitchAssigneeButtonLoading(false);
        });
    } else {
      await api
        .testSubmit("Assignee switch successfully")
        .then((response) => {
          abortControllerRef.current.abort();
          abortControllerRef.current = new AbortController();
          fetchWorkOrderDetails(false);
          abortControllerRef2.current.abort();
          abortControllerRef2.current = new AbortController();
          fetchWorkOrderAuditLog();
          Swal.fire({
            title: "Success!",
            text: response.data.message,
            icon: "success",
            customClass: {
              popup: "swal2-custom-popup",
              title: "swal2-custom-title",
              content: "swal2-custom-content",
              actions: "swal2-custom-actions",
              confirmButton: "swal2-custom-confirm-button",
            },
          });
        })
        .catch((error) => {
          Swal.fire({
            title: "Oops...",
            icon: "error",
            html: SwalErrorMessages(error.response.data.message),
            customClass: {
              popup: "swal2-custom-popup",
              title: "swal2-custom-title",
              content: "swal2-custom-content",
              actions: "swal2-custom-actions",
              confirmButton: "swal2-custom-confirm-button",
            },
          });
        })
        .finally(() => {
          closeFunction();
          setSwitchAssigneeButtonLoading(false);
        });
    }
  }

  async function abortStep(stepUID, closeFunction) {
    setCancelNextPusherToast(true);
    setAbortStepButtonLoading(true);
    await api
      .testSubmit("Step aborted successfully")
      .then((response) => {
        abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        fetchWorkOrderDetails(false);
        abortControllerRef2.current.abort();
        abortControllerRef2.current = new AbortController();
        fetchWorkOrderAuditLog();
        Swal.fire({
          title: "Success!",
          text: response.data.message,
          icon: "success",
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "Oops...",
          icon: "error",
          html: SwalErrorMessages(error.response.data.message),
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
      })
      .finally(() => {
        closeFunction();
        setAbortStepButtonLoading(false);
      });
  }

  async function fetchMember(controller) {
    await api
      .getMembers()
      .then((response) => {
        setMemberSelection(
          response.data.members.map((val) => ({
            ...val,
            memberUID: val.UID,
            label: val.user.first_name + " " + val.user.last_name,
            value: val.id,
          }))
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }
  async function fetchWorkOrderDetails(isWithLoading) {
    if (isWithLoading) {
      setLoading(true);
    }
    await api
      .getWorkOrderDetailsByUID(UID)
      .then((response) => {
        setAndUpdateWorkOrderData(response.data.workOrder);
      })
      .catch((error) => {
        console.log(error);
        if (error.response.data?.error_type === "NotFound") {
          setFetchError(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function fetchWorkOrderAuditLog() {
    setAuditLogLoading(true);
    const localAbortController = abortControllerRef2.current;
    await api
      .getWorkOrderDetailsAuditLogByUID(UID)
      .then((response) => {
        setAuditLogs(response.data.data);
        setFrom(response.data.from);
        setTotalPages(response.data.last_page);
        setShowing({
          current: response.data.to,
          total: response.data.total,
        });
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        if (localAbortController === abortControllerRef2.current) {
          setAuditLogLoading(false);
        }
      });
  }

  async function sendReminder(memberUID, role) {
    setSendReminderButtonLoading(true);
    await api
      .testSubmit("Reminder sent successfully")
      .then((response) => {
        Swal.fire({
          title: "Success!",
          text: response.data.message,
          icon: "success",
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "Oops...",
          icon: "error",
          html: SwalErrorMessages(error.response.data.message),
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
      })
      .finally(() => {
        handleCloseSendReminder();
        setSendReminderButtonLoading(false);
      });
  }

  function handleOpenSendReminder(member, reminderRole) {
    sendReminderDisclosure.onOpen();
    setSelectedSendReminderMember({ ...member, reminderRole });
  }

  function handleCloseSendReminder() {
    sendReminderDisclosure.onClose();
    setSelectedSendReminderMember({});
  }

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const controller = new AbortController();
    fetchMember(controller);
    fetchWorkOrderDetails(true);
    return () => {
      controller.abort();
      abortControllerRef.current.abort(); // Cleanup on unmount
      abortControllerRef2.current.abort(); // Cleanup on unmount
    };
  }, []);
  useEffect(() => {
    abortControllerRef2.current = new AbortController();
    fetchWorkOrderAuditLog();

    return () => {
      abortControllerRef2.current.abort(); // Cleanup on unmount
    };
  }, [currentAuditLogPage, rows]);

  return (
    <Box>
      {!fetchError ? (
        <ReactFlowProvider>
          <WorkOrderDetailsLayout
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            workOrder={workOrder}
            stepDetailsDisclosure={stepDetailsDisclosure}
          >
            <DeleteMultiLockAccessProvider>
              <Box display={currentPage === "overview" ? "block" : "none"}>
                <WorkOrderDetailsOverviewPage
                  workOrder={workOrder}
                  memberSelection={memberSelection}
                  abortStep={abortStep}
                  switchAssignee={switchAssignee}
                  abortStepButtonLoading={abortStepButtonLoading}
                  switchAssigneeButtonLoading={switchAssigneeButtonLoading}
                  hasManagePermission={hasManagePermission}
                  handleOpenSendReminder={
                    workOrder?.status !== "draft" ? handleOpenSendReminder : ""
                  }
                  pageModule={pageModule}
                  stepDetailsDisclosure={stepDetailsDisclosure}
                />
              </Box>
            </DeleteMultiLockAccessProvider>
            <Box
              style={{
                display: currentPage === "auditLogs" ? "block" : "none",
              }}
            >
              <WorkOrderDetailsAuditLogPage
                workOrder={workOrder}
                from={from}
                rows={rows}
                setRows={setRows}
                auditLogs={auditLogs}
                totalPages={totalPages}
                showing={showing}
                currentAuditLogPage={currentAuditLogPage}
                setCurrentAuditLogPage={setCurrentAuditLogPage}
                auditLogLoading={auditLogLoading}
                hasManagePermission={hasManagePermission}
                handleOpenSendReminder={
                  workOrder?.status !== "draft" ? handleOpenSendReminder : ""
                }
              />
            </Box>
            <Box
              style={{ display: currentPage === "reviews" ? "block" : "none" }}
            >
              <WorkOrderDetailsReviewsPage
                UID={UID}
                workOrder={workOrder}
                hasManagePermission={hasManagePermission}
                handleOpenSendReminder={
                  workOrder?.status !== "draft" ? handleOpenSendReminder : ""
                }
              />
            </Box>
          </WorkOrderDetailsLayout>
        </ReactFlowProvider>
      ) : (
        <Box>
          <WorkOrderDetails404Page />
        </Box>
      )}
      <SendReminderModal
        sendReminder={sendReminder}
        sendReminderButtonLoading={sendReminderButtonLoading}
        sendReminderDisclosure={sendReminderDisclosure}
        selectedSendReminderMember={selectedSendReminderMember}
      />
    </Box>
  );
}
