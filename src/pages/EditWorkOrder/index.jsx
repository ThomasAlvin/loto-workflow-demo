import { Box, useDisclosure } from "@chakra-ui/react";
import {
  getNodesBounds,
  getViewportForBounds,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useFormik } from "formik";
import { toPng } from "html-to-image";
import { debounce } from "lodash";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Swal from "sweetalert2";
import { v4 as uuid } from "uuid";
import * as Yup from "yup";
import { api } from "../../api/api";
import EmptySelectionWarningModal from "../../components/CreateWorkOrder/EmptySelectionWarningModal";
import SwalErrorMessages from "../../components/SwalErrorMessages";
import { DeleteMultiLockAccessProvider } from "../../service/DeleteMultiLockAccessContext";
import { useLoading } from "../../service/LoadingContext";
import base64ToFile from "../../utils/base64ToFile";
import convertStepsToXyFlowData from "../../utils/convertStepsToXyFlowData";
import convertToFormData from "../../utils/convertToFormData";
import getConnectedNodes from "../../utils/getConnectedNodes";
import WorkOrderDetails404Page from "../WorkOrderDetails/WorkOrderDetails404Page";
import EditWorkOrderBuildPage from "./EditWorkOrderBuildPage";
import ConfirmationModal from "../../components/ConfirmationModal";

export default function EditWorkOrderPage() {
  const location = useLocation();
  const duplicationIssues = location.state?.errorMessages;
  const initialWorkOrderDetails = {
    name: "",
    description: "",
    workOrderSteps: [],
    deadline_date_time: "",
    saveAsTemplate: false,
    review: { type: "single", reviewers: [] },
  };
  const emptySelectionWarningModal = useDisclosure();
  const [fetchError, setFetchError] = useState(false);
  //ini cuman pakai untuk realtime display when updating any work order details
  const [workOrderDetailsInput, setWorkOrderDetailsInput] = useState({
    name: "",
    description: "",
    workOrderCustomId: "",
  });
  const [searchParams] = useSearchParams();
  const paramRedirected = searchParams.get("redirected");
  const { UID } = useParams();
  const { loading, setLoading } = useLoading();
  const [selectionErrors, setSelectionErrors] = useState({
    lock: false,
    machine: false,
    member: false,
  });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [initialFetchedWorkOrderDetails, setInitialFetchedWorkOrderDetails] =
    useState();
  const [currentPage, setCurrentPage] = useState("build");
  const [leavePageNav, setLeavePageNav] = useState();
  const [memberSelection, setMemberSelection] = useState([]);
  const [machineSelection, setMachineSelection] = useState([]);
  const [lockSelection, setLockSelection] = useState([]);
  const [hasFetchDataError, setHasFetchDataError] = useState({
    lock: false,
    machine: false,
  });
  const [latestReview, setLatestReview] = useState([]);

  const leavePageConfirmationModalDisclosure = useDisclosure();
  const nav = useNavigate();
  const formik = useFormik({
    initialValues: initialWorkOrderDetails,
    validationSchema: Yup.object().shape({
      deadline_date_time: Yup.date("Deadline date format is invalid.").required(
        "Deadline date and time is required.",
      ),
      workOrderSteps: Yup.array()
        .of(
          Yup.object().shape({
            assigned_to: Yup.array()
              .of(
                Yup.object().shape({
                  id: Yup.string()
                    .trim()
                    .required("This step requires an assigned member."),
                }),
              )
              .min(1, "Must assign at least 1 member"),
            notify_to: Yup.array().when("notify", {
              is: true,
              then: (schema) =>
                schema
                  .of(
                    Yup.object().shape({
                      id: Yup.string()
                        .trim()
                        .required("Each notified member must have an ID."),
                    }),
                  )
                  .min(
                    1,
                    "This step requires at least 1 member to be notified.",
                  ),
              otherwise: (schema) => schema.notRequired(),
            }),
            selectedMachines: Yup.array().when("machine", {
              is: true,
              then: (schema) =>
                schema
                  .required("Please select at least 1 machine.")
                  .min(1, "Please select at least 1 machine.")
                  .of(
                    Yup.object().shape({
                      selectedInspectionForms: Yup.array()
                        .min(1, "Machine requires at least 1 inspection form.")
                        .required("Inspection forms are required."),
                    }),
                  ),
              otherwise: (schema) => schema.notRequired(),
            }),
            multiLockAccessGroup: Yup.object().shape({
              multiLockAccessGroupItems: Yup.array() // Return a Yup array schema
                .of(
                  Yup.object().shape({
                    id: Yup.string()
                      .trim()
                      .test(
                        "customValidation3",
                        "Lock cannot be empty.",
                        function (val) {
                          const { parent, from } = this; // Access parent and from
                          const workOrderStep = from[2].value;
                          // Access the second work order step
                          if (
                            workOrderStep &&
                            workOrderStep.multiLockAccess &&
                            workOrderStep.multiLockAccessGroup.isPreAssigned
                          ) {
                            return val && val.trim() !== ""; // Ensure ID is provided (not empty or whitespace)
                          }
                          return true;
                        },
                      ),
                  }),
                )
                .test(
                  "minLocks",
                  "This step requires at least 1 lock.",
                  function (value) {
                    const { from } = this;
                    const workOrderStep = from[1].value; // Access the second work order step
                    if (
                      workOrderStep?.multiLockAccess &&
                      workOrderStep.multiLockAccessGroup?.isPreAssigned
                    ) {
                      return Array.isArray(value) && value.length > 0;
                    }
                    return true;
                  },
                ),
            }),
          }),
        )
        .min(1, "At least one step is required")
        .required("This field cannot be empty"), // Ensure the items array exists
      name: Yup.string("Name must be a string").required(
        "Template title is required",
      ),
    }),
    onSubmit: () => {
      // saveChanges();
      // setCurrentPage("assign");
      submitWorkOrder(
        formik.values.review?.reviewers?.length ? "under_review" : "ongoing",
        true,
        // confirmCreateWorkOrderDisclosure.onClose
      );
    },
  });

  const debouncedUpdateWorkOrderDetails = debounce(function (id, value) {
    formik.setFieldTouched(id);
    formik.setFieldValue(id, value);
  }, 300);
  useEffect(() => {
    formik.validateForm();
  }, [formik.values.name]);

  async function submitWorkOrder(
    status,
    showSuccessSwal = true,
    closeModalFunction,
  ) {
    setLoading(true);
    const startNode = nodes.find((n) => n.data.isStart);
    const connectedNodeIds = getConnectedNodes(startNode, edges);
    const connectedNodes = nodes
      .filter((n) => connectedNodeIds.has(n.id))
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

    const filteredWorkFlow = connectedNodes.map((item) => {
      const filteredItem = { ...item.data };

      if (!filteredItem.form) {
        delete filteredItem.formQuestions;
      }

      if (!filteredItem.notify) {
        delete filteredItem.notificationMessage;
        // delete filteredItem.notification_message;
      }
      if (!filteredItem.machine) {
        delete filteredItem.selectedMachines;
      }
      if (!filteredItem?.multiLockAccessGroup?.isPreAssigned) {
        if (filteredItem?.multiLockAccessGroup) {
          delete filteredItem.multiLockAccessGroup.multiLockAccessGroupItems;
        }
      }
      return filteredItem;
    });

    let formDataObject = {
      ...formik.values,
      workOrderSteps: filteredWorkFlow,
      review: {
        type: formik.values.review.type,
        reviewers: formik.values.review.reviewers,
        newReviewers: formik.values.review.reviewers.filter(
          (reviewer) => !reviewer.isDisabled,
        ),
      },
    };
    // const workFlowImage = await getWorkFlowImage();
    // const formData = convertToFormData(formDataObject);
    // formData.append("flowChartImages[]", workFlowImage);

    try {
      const response = await api.testSubmit("Work order saved successfully");
      if (showSuccessSwal) {
        Swal.fire({
          title: "Success!",
          text: response?.data?.message,
          icon: "success",
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
      }
      nav("/work-order");
      return response.data.work_order_UID;
    } catch (error) {
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
      console.log(error);
    } finally {
      if (closeModalFunction) {
        closeModalFunction();
      }
      setLoading(false);
    }
  }
  const getWorkFlowImage = async () => {
    const imageWidth = 1024;
    const imageHeight = 768;
    setNodes(newNodes.map((node) => ({ ...node, selected: false })));
    setEdges(edges.map((edge) => ({ ...edge, selected: false })));
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    const nodesBounds = getNodesBounds(
      newNodes.map((node) => ({
        ...node,
        position: {
          x: node.position.x - (node.measured.width || 0) / 2,
          y: node.position.y - (node.measured.height || 0) / 2,
        },
      })),
    );

    const padding = 40;
    const paddedBounds = {
      x: nodesBounds.x - padding,
      y: nodesBounds.y - padding,
      width: nodesBounds.width + padding * 2,
      height: nodesBounds.height + padding * 2,
    };
    const viewport = getViewportForBounds(
      paddedBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
    );

    const base64WorkFlow = await toPng(
      document.querySelector(".react-flow__viewport"),
      {
        backgroundColor: "#f8f9fa",
        width: imageWidth,
        height: imageHeight,
        style: {
          width: imageWidth,
          height: imageHeight,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
        skipFonts: true,
      },
    );
    return base64ToFile(base64WorkFlow);
  };

  function handleCallToAction(link) {
    leavePageConfirmationModalDisclosure.onOpen();
    setLeavePageNav(link);
  }
  async function handleLeavePageConfirmation() {
    submitWorkOrder("draft", false)
      .then((response) => {
        nav(leavePageNav + "?wo_UID=" + response);
      })
      .finally(() => {
        setLeavePageNav("");
      });
  }
  function filterValidLocks(workOrderLocks = [], lockSelection = []) {
    const validLockIds = lockSelection.map((lock) => lock.id);
    const removedLocks = workOrderLocks.filter(
      (groupItem) => !validLockIds.includes(groupItem?.lockId),
    );

    const validLocks = workOrderLocks
      .filter((groupItem) => validLockIds.includes(groupItem?.lockId))
      .map((groupItem) => ({
        id: groupItem?.lockId,
        name: groupItem?.lock?.name,
        value: groupItem?.lockId,
        label: groupItem?.lock?.name,
      }));

    const hasRemovedLocks = removedLocks.length > 0 ? true : false;

    return { locks: validLocks.length ? validLocks : null, hasRemovedLocks };
  }
  function filterValidMachines(workOrderMachines = [], machineSelection = []) {
    const validMachineIds = machineSelection.map((machine) => machine.id);
    const removedMachines = workOrderMachines.filter(
      (groupItem) => !validMachineIds.includes(groupItem?.machineId),
    );
    const validMachines = workOrderMachines
      .filter((groupItem) => validMachineIds.includes(groupItem?.machineId))
      .map((groupItem) => ({
        ...groupItem.machine,
        selectedInspectionForms: groupItem.selected_inspection_forms.map(
          (selectedForms) => {
            return {
              categoryId: selectedForms.work_order_step_category.categoryId,
              categoryName:
                selectedForms.work_order_step_category.category.name,
              inspectionFormId:
                selectedForms.work_order_step_inspection_form.inspection_formId,
              label:
                selectedForms.work_order_step_inspection_form.inspection_form
                  .name,
              name: selectedForms.work_order_step_inspection_form
                .inspection_form.name,
              inspection_questions:
                selectedForms.work_order_step_inspection_form.inspection_form
                  .inspection_questions,
              value:
                selectedForms.work_order_step_inspection_form.inspection_formId,
            };
          },
        ),
        label: groupItem.machine.name,
        value: groupItem.machineId,
      }));

    const hasRemovedMachine = removedMachines.length > 0 ? true : false;

    return {
      machines: validMachines.length ? validMachines : null,
      hasRemovedMachine,
    };
  }
  async function fetchWorkOrder(controller) {
    setLoading(true);
    const duplicateRedirect = localStorage.getItem("duplicate");
    await api
      .getWorkOrderByUID(UID)
      .then(async (response) => {
        if (
          response.data.workOrder.status === "under_review" ||
          response.data.workOrder.status === "completed"
        ) {
          setFetchError(true);
          return;
        }
        let selectionCheck = { lock: false, machine: false, member: false };
        setMemberSelection(
          response.data.selection.members.map((val) => ({
            ...val,
            label: val.user.first_name + " " + val.user.last_name,
            value: val.id,
          })),
        );
        setMachineSelection(
          response.data.selection.machines.map((val) => ({
            ...val,
            label: val.name,
            value: val.id,
            selectedInspectionForms: [],
          })),
        );
        setLockSelection(
          response.data.selection.locks.map((val) => ({
            ...val,
            label: val.name,
            value: val.id,
          })),
        );
        if (!paramRedirected && !duplicateRedirect) {
          const hasLocks =
            response.data.selection.locks &&
            response.data.selection.locks.length > 0;

          const hasValidMachine = response.data.selection.machines?.some(
            (machine) =>
              machine.categories?.some(
                (category) => category.inspection_forms?.length > 0,
              ),
          );
          const hasMembers =
            response.data.selection.members &&
            response.data.selection.members.length > 0;

          selectionCheck = {
            lock: !hasLocks,
            machine: !hasValidMachine,
            member: !hasMembers,
          };
          setSelectionErrors(selectionCheck);
        }

        const responseReview = [
          ...(response.data.workOrder?.latest_work_order_review
            ?.work_order_reviewer_super_admin
            ? [
                response.data.workOrder.latest_work_order_review
                  .work_order_reviewer_super_admin,
              ]
            : []),

          ...(
            response.data.workOrder?.latest_work_order_review
              ?.work_order_reviewer_members ?? []
          ).filter((review) => {
            return (
              review.work_order_reviewer_response.status === "rejected" ||
              review.work_order_reviewer_response.status === "approved"
            );
          }),
        ];
        setLatestReview(responseReview);

        let hasRemovedError = { lock: false, machine: false };

        const fetchedValue = {
          name: response.data.workOrder.name,
          status: response.data.workOrder.status,
          description: response.data.workOrder.description,
          workOrderSteps: response.data.workOrder.work_order_steps.map(
            (step, stepIndex) => {
              const filteredValidMachines = filterValidMachines(
                step.work_order_step_machines,
                response.data.selection.machines,
              );
              const filteredValidLocks = filterValidLocks(
                step.work_order_multi_lock_group
                  ?.work_order_multi_lock_group_items,
                response.data.selection.locks,
              );

              if (filteredValidMachines.hasRemovedMachine) {
                hasRemovedError = { ...hasRemovedError, machine: true };
              }
              if (filteredValidLocks.hasRemovedLocks) {
                hasRemovedError = { ...hasRemovedError, lock: true };
              }

              return {
                reviewsThatFlaggedThisStep: responseReview.filter((review) =>
                  review?.work_order_step_review_rejections?.some(
                    (rejection) =>
                      rejection.no_work_order_step == stepIndex + 1,
                  ),
                ),
                // -X multi assign problem X-
                assigned_to: step.assigned_members.map((assignedMember) => ({
                  ...assignedMember,
                  label:
                    assignedMember?.user.first_name &&
                    assignedMember?.user.last_name
                      ? assignedMember?.user.first_name +
                        " " +
                        assignedMember?.user.last_name
                      : undefined,
                  value: assignedMember?.id,
                })),
                description: step.description,
                form: !!step.form,
                formQuestions: [
                  ...step.work_order_form_questions.map((formQuestion) => {
                    const type = {
                      title: formQuestion.question_type,
                      ...(formQuestion.question_type === "Number" && {
                        format: formQuestion.format,
                        unit: formQuestion.unit,
                      }),
                      ...(formQuestion.question_type === "Text" && {
                        format: formQuestion.format,
                      }),
                      ...((formQuestion.question_type === "Multiple Choice" ||
                        formQuestion.question_type === "Checkbox" ||
                        formQuestion.question_type === "Checklist") && {
                        options: formQuestion.options,
                      }),
                      ...(formQuestion.question_type === "Date & Time" && {
                        date: formQuestion.include_date,
                        time: formQuestion.include_time,
                      }),
                    };
                    return {
                      id: uuid(),
                      required: !!formQuestion.is_required,
                      title: formQuestion.question,
                      type,
                    };
                  }),
                ],
                // switch id to UID
                // id: step.UID,
                // id: step.UID,
                UID: step.UID,
                workOrderStepUID: step.UID,
                multiLockAccess: !!step.multi_access_lock,
                isMainMultiLockAccess: !!step.is_main_multi_access_lock,
                ...(step?.multi_access_lock_step_index != null && {
                  multiLockAccessStepIndex: Number(
                    step.multi_access_lock_step_index,
                  ),
                }),
                ...(!!step.multi_access_lock && {
                  multiLockAccessGroup: {
                    ...{
                      name: step.work_order_multi_lock_group.name,
                    },
                    ...(!!step.is_main_multi_access_lock && {
                      totalStep: step.work_order_multi_lock_group.total_step,
                      isPreAssigned: true,
                      // Hide preassign feature
                      //    isPreAssigned:
                      // step.work_order_multi_lock_group.is_pre_assigned,
                    }),
                    ...(!!step.is_main_multi_access_lock && {
                      multiLockAccessGroupItems:
                        filteredValidLocks.locks?.length > 0
                          ? filteredValidLocks.locks
                          : [
                              {
                                name: "",
                                id: "",
                                label: "",
                                value: "",
                              },
                            ],
                    }),
                  },
                }),
                machine: !!step.machine,
                requireVerifyMachine: !!step.require_verify_machine,
                condition: !!step.condition,
                ...(step.condition_question
                  ? { condition_question: step.condition_question }
                  : {}),
                condition_value: step.condition_value,
                loop_target_UID: step.loop_target_UID,
                parent_UID: step.parent_UID,
                name: step.name,
                notificationMessage: step.notification_message || "",
                notify: !!step.notify,
                // -X multi assign problem X-
                notify_to: step.notified_members.map((notifiedMember) => ({
                  ...notifiedMember,
                  label:
                    notifiedMember?.user.first_name &&
                    notifiedMember?.user.last_name
                      ? notifiedMember.user.first_name +
                        " " +
                        notifiedMember.user.last_name
                      : "",
                  value: notifiedMember?.id,
                })),
                selectedMachines: filteredValidMachines.machines || [],
              };
            },
          ),
          deadline_date_time: response.data.workOrder.deadline_date_time
            ? moment(response.data.workOrder.deadline_date_time).format(
                "YYYY-MM-DD hh:mm A",
              )
            : null,
          review: {
            type:
              response.data.workOrder?.latest_work_order_review?.type ||
              "single",
            reviewers: response.data.workOrder?.latest_work_order_review
              ?.work_order_reviewer_members.length
              ? response.data.workOrder?.latest_work_order_review?.work_order_reviewer_members
                  ?.map((reviewer) => {
                    if (reviewer.super_admin) {
                      // Skip this reviewer by returning undefined
                      return undefined;
                    } else {
                      return {
                        ...reviewer.member,
                        label:
                          reviewer.member.user.first_name +
                          " " +
                          reviewer.member.user.last_name,
                        value: reviewer.member.id,
                        isDisabled:
                          response.data.workOrder.status === "review_rejected"
                            ? true
                            : false,
                      };
                    }
                  })
                  .filter(Boolean)
              : [],
          },
          // -X multi assign problem X-
          coCreatorMembers: response.data.workOrder.co_creator_members.map(
            (coCreatorMember) => ({
              ...coCreatorMember,
              label:
                coCreatorMember.user.first_name +
                " " +
                coCreatorMember.user.last_name,
              value: coCreatorMember.id,
            }),
          ),
          workOrderCustomId:
            response.data.workOrder.work_order_custom_id || null,
        };

        if (duplicationIssues?.length) {
          showUnassignedStepSwal(
            duplicationIssues,
            selectionCheck.lock ||
              selectionCheck.member ||
              selectionCheck.machine,
          );
        } else {
          if (
            selectionCheck.lock ||
            selectionCheck.member ||
            selectionCheck.machine
          ) {
            emptySelectionWarningModal.onOpen();
          }
        }
        // Provide error message if previously assigned lock or machine already got assigned

        setWorkOrderDetailsInput((prevState) => ({
          ...prevState,
          name: fetchedValue.name,
          workOrderCustomId: fetchedValue.workOrderCustomId,
          description: fetchedValue.description,
        }));

        formik.setValues(fetchedValue);
        const errors = await formik.validateForm(fetchedValue);
        const xyFlowData = await convertStepsToXyFlowData(
          fetchedValue.workOrderSteps,
        );
        const nodesWithError = xyFlowData.nodes.map((n) => {
          const idx = fetchedValue.workOrderSteps.findIndex(
            (s) => s.UID === n.data.UID,
          );
          const hasError = Boolean(errors?.workOrderSteps?.[idx]);
          return {
            ...n,
            data: {
              ...n.data,
              hasError,
            },
          };
        });
        setNodes(nodesWithError);
        setEdges(xyFlowData?.edges);

        setInitialFetchedWorkOrderDetails(fetchedValue);
      })
      .catch((error) => {
        setFetchError(true);
        console.error(error);
      })
      .finally(async () => {
        setLoading(false);
      });
  }
  const showUnassignedStepSwal = useCallback(
    (duplicationIssues, hasOpenSelectionWarning) => {
      Swal.fire({
        title: "Warning!",
        html: SwalErrorMessages(
          `Some steps could not retain their assigned machines or locks because the selected resources are no longer available.`,
          duplicationIssues,
        ),
        icon: "warning",
        customClass: {
          popup: "swal2-custom-popup",
          title: "swal2-custom-title",
          content: "swal2-custom-content",
          actions: "swal2-custom-actions",
          confirmButton: "swal2-custom-confirm-button",
        },
        width: "500px",
        ...(hasOpenSelectionWarning
          ? {
              didClose: () => {
                emptySelectionWarningModal.onOpen();
              },
            }
          : {}),
      });
    },
  );
  useEffect(() => {
    const controller = new AbortController();
    // const controller2 = new AbortController();
    fetchWorkOrder(controller);
    // fetchAllSelection(controller);
    if (paramRedirected) {
      // setCurrentPage("assign");
    }

    return () => {
      controller.abort();
      // controller2.abort();
    };
  }, []);
  return (
    <>
      {!fetchError ? (
        <ReactFlowProvider>
          <Box style={{ display: currentPage === "build" ? "block" : "none" }}>
            <DeleteMultiLockAccessProvider>
              <EditWorkOrderBuildPage
                debouncedUpdateWorkOrderDetails={
                  debouncedUpdateWorkOrderDetails
                }
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                formik={formik}
                showUnassignedStepSwal={showUnassignedStepSwal}
                handleCallToAction={handleCallToAction}
                submitWorkOrder={submitWorkOrder}
                initialWorkOrderDetails={initialWorkOrderDetails}
                initialFetchedWorkOrderDetails={initialFetchedWorkOrderDetails}
                latestReview={latestReview}
                memberSelection={memberSelection}
                machineSelection={machineSelection}
                lockSelection={lockSelection}
                workOrderDetailsInput={workOrderDetailsInput}
                setWorkOrderDetailsInput={setWorkOrderDetailsInput}
                nodes={nodes}
                setNodes={setNodes}
                onNodesChange={onNodesChange}
                edges={edges}
                setEdges={setEdges}
                onEdgesChange={onEdgesChange}
              />
            </DeleteMultiLockAccessProvider>
          </Box>
          <Box
            style={{ display: currentPage === "assign" ? "block" : "none" }}
          ></Box>

          <ConfirmationModal
            header={"Leave Page?"}
            header2={"Are you sure you want to leave you're current work?"}
            body={"You're work will be saved as drafted if you proceed"}
            confirmationFunction={handleLeavePageConfirmation}
            confirmationDisclosure={leavePageConfirmationModalDisclosure}
            confirmationLabel={"Confirm"}
          />
          <EmptySelectionWarningModal
            emptySelectionWarningModal={emptySelectionWarningModal}
            selectionErrors={selectionErrors}
          />
        </ReactFlowProvider>
      ) : (
        <Box>
          <WorkOrderDetails404Page />
        </Box>
      )}
    </>
  );
}
