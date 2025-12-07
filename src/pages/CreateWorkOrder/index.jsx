import { Box, useDisclosure } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import CreateWorkOrderBuildPage from "./CreateWorkOrderBuildPage";
import { useFormik } from "formik";
import * as Yup from "yup";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../service/LoadingContext";
import Swal from "sweetalert2";
import LeavePageConfirmationModal from "../../components/CreateWorkOrder/LeavePageConfirmationModal";
import EmptySelectionWarningModal from "../../components/CreateWorkOrder/EmptySelectionWarningModal";
import SwalErrorMessages from "../../components/SwalErrorMessages";
import {
  getNodesBounds,
  getViewportForBounds,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { DeleteMultiLockAccessProvider } from "../../service/DeleteMultiLockAccessContext";
import getConnectedNodes from "../../utils/getConnectedNodes";
import { toPng } from "html-to-image";
import base64ToFile from "../../utils/base64ToFile";
import autoArrangeNodes from "../../utils/autoArrangeNodes";
import convertToFormData from "../../utils/convertToFormData";

export default function CreateWorkOrderPage() {
  const isMultiAssign = import.meta.env.VITE_MULTI_ASSIGN === "true";
  const initialWorkOrderDetails = {
    name: "",
    description: "",
    workOrderSteps: [],
    deadline_date_time: "",
    ...(isMultiAssign
      ? { coCreatorMembers: null } // plural when multi
      : { coCreatorMember: null }), // singular when single
    review: { type: "single", reviewers: [] },
  };

  const { loading, setLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState("build");
  const leavePageConfirmationModal = useDisclosure();
  const emptySelectionWarningModal = useDisclosure();
  const [leavePageNav, setLeavePageNav] = useState();
  const [memberSelection, setMemberSelection] = useState([]);
  const [machineSelection, setMachineSelection] = useState([]);
  const [lockSelection, setLockSelection] = useState([]);
  const [selectionErrors, setSelectionErrors] = useState({
    lock: false,
    machine: false,
    member: false,
  });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const nav = useNavigate();
  const formik = useFormik({
    initialValues: initialWorkOrderDetails,
    validationSchema: Yup.object().shape({
      deadline_date_time: Yup.date("Deadline date format is invalid.").required(
        "Deadline date and time is required."
      ),
      workOrderSteps: Yup.array()
        .of(
          Yup.object().shape({
            assigned_to: isMultiAssign
              ? Yup.array()
                  .of(
                    Yup.object().shape({
                      id: Yup.string()
                        .trim()
                        .required("This step requires an assigned member."),
                    })
                  )
                  .min(1, "Must assign at least 1 member")
              : Yup.object().shape({
                  id: Yup.string()
                    .trim()
                    .required("This step requires an assigned member."),
                }),

            notify_to: isMultiAssign
              ? Yup.array().when("notify", {
                  is: true,
                  then: (schema) =>
                    schema
                      .of(
                        Yup.object().shape({
                          id: Yup.string()
                            .trim()
                            .required("Each notified member must have an ID."),
                        })
                      )
                      .min(
                        1,
                        "This step requires at least 1 member to be notified."
                      ),
                  otherwise: (schema) => schema.notRequired(),
                })
              : Yup.object().shape({
                  id: Yup.string()
                    .trim()
                    .test(
                      "customValidation",
                      "This step requires a member to be notified.",
                      function (val) {
                        const { parent, from } = this;
                        const workOrderStep = from[1].value;
                        if (workOrderStep && workOrderStep.notify) {
                          return val && val.trim() !== "";
                        }
                        return true;
                      }
                    ),
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
                    })
                  ),
              otherwise: (schema) => schema.notRequired(),
            }),
            work_order_locks: Yup.array() // Return a Yup array schema
              .of(
                Yup.object().shape({
                  id: Yup.string()
                    .trim()
                    .test(
                      "customValidation3",
                      "Lock cannot be empty.",
                      function (val) {
                        const { parent, from } = this; // Access parent and from
                        const workOrderStep = from[1].value;
                        // Access the second work order step
                        if (workOrderStep && workOrderStep.lockAccess) {
                          return val && val.trim() !== ""; // Ensure ID is provided (not empty or whitespace)
                        }
                        return true;
                      }
                    ),
                })
              )
              .test(
                "minLocks",
                "This step requires at least 1 lock.",
                function (value) {
                  const { from } = this;
                  const workOrderStep = from[1].value; // Access the second work order step

                  if (workOrderStep?.lockAccess) {
                    return Array.isArray(value) && value.length > 0; // Require at least 1 lock if lockAccess is true
                  }
                  return true; // No locks required if lockAccess is false
                }
              ),
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
                        }
                      ),
                  })
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
                      return Array.isArray(value) && value.length > 0; // Require at least 1 lock if lockAccess is true
                    }
                    return true; // No locks required if lockAccess is false
                  }
                ),
            }),
            titleTriggerAPI: Yup.string()
              .trim()
              .when("triggerAPI", {
                is: true,
                then: (schema) => schema.required("Key is required"),
                otherwise: (schema) => schema.notRequired(),
              }),
          })
        )
        .min(1, "At least one step is required")
        .required("This field cannot be empty"),
      name: Yup.string("Name must be a string").required(
        "Work order title is required"
      ),
    }),
    onSubmit: () => {
      // saveChanges();
      // setCurrentPage("assign");
      submitWorkOrder(
        formik.values.review?.reviewers?.length ? "under_review" : "ongoing",
        true
        // confirmCreateWorkOrderDisclosure.onClose
      );
    },
    validateOnMount: true,
  });

  const debouncedUpdateWorkOrderDetails = debounce(function (id, value) {
    formik.setFieldTouched(id);
    formik.setFieldValue(id, value);
  }, 300);
  useEffect(() => {
    formik.validateForm();
  }, [formik.values.name]);

  async function fetchAllSelection(controller) {
    setLoading(true);
    await api
      .get(`work-order/selection`, { signal: controller.signal })
      .then((response) => {
        setMemberSelection(
          response.data.members.map((val) => ({
            ...val,
            label: val.user.first_name + " " + val.user.last_name,
            value: val.id,
          }))
        );
        setMachineSelection(
          response.data.machines.map((val) => ({
            ...val,
            label: val.name,
            value: val.id,
            selectedInspectionForms: [],
          }))
        );
        setLockSelection(
          response.data.locks.map((val) => ({
            ...val,
            label: val.name,
            value: val.id,
          }))
        );
        const hasLocks = response.data.locks && response.data.locks.length > 0;

        const hasValidMachine = response.data.machines?.some((machine) =>
          machine.categories?.some(
            (category) => category.inspection_forms?.length > 0
          )
        );
        const hasMembers =
          response.data.members && response.data.members.length > 0;

        setSelectionErrors({
          lock: !hasLocks,
          machine: !hasValidMachine,
          member: !hasMembers,
        });
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  async function submitWorkOrder(
    status,
    showSuccessSwal = true,
    closeModalFunction
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
      if (!filteredItem.condition) {
        delete filteredItem.condition_question;
      }
      if (!filteredItem.machine) {
        delete filteredItem.selectedMachines;
      }
      if (!filteredItem.triggerAPI) {
        delete filteredItem.titleTriggerAPI;
      }
      if (!filteredItem.lockAccess) {
        delete filteredItem.work_order_locks;
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
    };
    const workFlowImage = await getWorkFlowImage();

    const formData = convertToFormData(formDataObject);
    formData.append("flowChartImages[]", workFlowImage);

    try {
      const response = await api.post(`work-order?status=${status}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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
        html: SwalErrorMessages(error.response?.data?.message),
        focusConfirm: false,
        customClass: {
          popup: "swal2-custom-popup",
          title: "swal2-custom-title",
          content: "swal2-custom-content",
          actions: "swal2-custom-actions",
          confirmButton: "swal2-custom-confirm-button",
        },
      });

      console.log(error);
      return null; // Ensure function returns null on error
    } finally {
      if (closeModalFunction) {
        closeModalFunction();
      }
      setLoading(false);
    }
  }

  // const getWorkFlowImage = async () => {
  //   const imageWidth = 1024;
  //   const imageHeight = 768;
  //   console.log(nodes);
  //   const newNodes = await autoArrangeNodes(nodes, edges, "TB");
  //   console.log(newNodes);
  //   console.log(nodes);
  //   // checkpoint and belom test
  //   setNodes(newNodes.map((node) => ({ ...node, selected: false })));
  //   setEdges(edges.map((edge) => ({ ...edge, selected: false })));
  //   await new Promise((resolve) =>
  //     requestAnimationFrame(() => requestAnimationFrame(resolve))
  //   );

  //   const nodesBounds = getNodesBounds(
  //     newNodes.map((node) => ({
  //       ...node,
  //       position: {
  //         x: node.position.x - (node.measured.width || 0) / 2,
  //         y: node.position.y - (node.measured.height || 0) / 2,
  //       },
  //     }))
  //   );
  //   const padding = 40;
  //   console.log(nodesBounds);
  //   const paddedBounds = {
  //     x: nodesBounds.x - padding,
  //     y: nodesBounds.y - padding,
  //     width: nodesBounds.width + padding * 2,
  //     height: nodesBounds.height + padding * 2,
  //   };
  //   const viewport = getViewportForBounds(
  //     paddedBounds,
  //     imageWidth,
  //     imageHeight,
  //     0.5,
  //     2
  //   );

  //   const base64WorkFlow = await toPng(
  //     document.querySelector(".react-flow__viewport"),
  //     {
  //       backgroundColor: "#f8f9fa",
  //       width: imageWidth,
  //       height: imageHeight,
  //       style: {
  //         width: imageWidth,
  //         height: imageHeight,
  //         transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
  //       },
  //       skipFonts: true,
  //     }
  //   );
  //   const link = document.createElement("a");
  //   link.download = "workflow.png"; // filename
  //   link.href = base64WorkFlow;

  //   // Trigger click
  //   link.click();

  //   // return base64ToFile(base64WorkFlow);
  // };
  const getWorkFlowImage = async () => {
    const imageWidth = 1024;
    const imageHeight = 768;
    const newNodes = await autoArrangeNodes(nodes, edges, "TB");
    console.log(newNodes);
    console.log(nodes);
    // checkpoint and belom test
    setNodes(newNodes.map((node) => ({ ...node, selected: false })));
    setEdges(edges.map((edge) => ({ ...edge, selected: false })));

    const nodesBounds = getNodesBounds(
      newNodes.map((node) => ({
        ...node,
        position: {
          x: node.position.x - (node.measured.width || 0) / 2,
          y: node.position.y - (node.measured.height || 0) / 2,
        },
      }))
    );
    const padding = 40;
    console.log(nodesBounds);
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
      2
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
      }
    );
    return base64ToFile(base64WorkFlow);
  };

  const handleCallToAction = useCallback((link) => {
    leavePageConfirmationModal.onOpen();
    setLeavePageNav(link);
  }, []);
  async function handleLeavePageConfirmation() {
    submitWorkOrder("draft", false)
      .then((response) => {
        nav(leavePageNav + "?wo_UID=" + response);
      })
      .finally(() => {
        setLeavePageNav("");
      });
  }
  useEffect(() => {
    const controller = new AbortController();
    fetchAllSelection(controller);

    return () => {
      controller.abort();
    };
  }, []);
  useEffect(() => {
    if (
      selectionErrors.lock ||
      selectionErrors.member ||
      selectionErrors.machine
    ) {
      emptySelectionWarningModal.onOpen();
    }
  }, [selectionErrors]);
  return (
    <>
      <ReactFlowProvider>
        <Box style={{ display: currentPage === "build" ? "block" : "none" }}>
          <DeleteMultiLockAccessProvider>
            <CreateWorkOrderBuildPage
              getWorkFlowImage={getWorkFlowImage}
              debouncedUpdateWorkOrderDetails={debouncedUpdateWorkOrderDetails}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              formik={formik}
              handleCallToAction={handleCallToAction}
              submitWorkOrder={submitWorkOrder}
              initialWorkOrderDetails={initialWorkOrderDetails}
              memberSelection={memberSelection}
              machineSelection={machineSelection}
              lockSelection={lockSelection}
              nodes={nodes}
              setNodes={setNodes}
              onNodesChange={onNodesChange}
              edges={edges}
              setEdges={setEdges}
              onEdgesChange={onEdgesChange}
            />
          </DeleteMultiLockAccessProvider>
        </Box>
        <LeavePageConfirmationModal
          handleLeavePageConfirmation={handleLeavePageConfirmation}
          leavePageConfirmationModal={leavePageConfirmationModal}
        />
        <EmptySelectionWarningModal
          selectionErrors={selectionErrors}
          emptySelectionWarningModal={emptySelectionWarningModal}
        />
      </ReactFlowProvider>
    </>
  );
}
