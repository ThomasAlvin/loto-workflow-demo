import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Image,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { v4 as uuid } from "uuid";
import emptyIllustration from "../../assets/images/emptyIllustration.6782cc2c8633a338fe7d-removebg.png";

import { useNavigate } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";
import {
  FaFlag,
  FaRegCircleQuestion,
  FaTriangleExclamation,
} from "react-icons/fa6";
import WorkOrderDetailsInput from "../../components/CreateWorkOrder/WorkOrderDetailsInput";
import ReplaceTemplateModal from "../../components/CreateWorkOrder/ReplaceTemplateModal";
import ReactSelect from "react-select";
import { api } from "../../api/api";
import CreateWorkOrderLayout from "../../components/Layout/CreateWorkOrderLayout";
import ViewLatestReviewModal from "../../components/CreateWorkOrder/ViewLatestReviewModal";
import getAlphabeticSequencing from "../../utils/getAlphabeticSequencing";
import DeleteMultiLockAccessConfirmationModal from "../../components/CreateEditWorkOrderTemplate/DeleteMultiLockAccessConfirmationModal";
import ReactSelectMemberSelection from "../../components/ReactSelectMemberSelection";
import { useSelector } from "react-redux";
import ReactSelectMemberMultiValue from "../../components/ReactSelectMemberMultiValue";
import { FormikProvider } from "formik";
import EditStepDrawer from "../../components/CreateEditWorkOrderTemplate/EditStepDrawer";
import { DatePicker } from "antd";
import WorkFlowXyFlow from "../../components/WorkFlowXyFlow";
import getConnectedNodes from "../../utils/getConnectedNodes";
import { getConnectedEdges, getIncomers, getOutgoers } from "@xyflow/react";
import defaultNodeSettings from "../../constants/defaultNodeSettings";
import computeNodeOrder from "../../utils/computeNodeOrder";
import moment from "moment";
import dayjs from "dayjs";
import ReactSelectCustomTemplateOption from "../../components/CreateWorkOrder/ReactSelectCustomTemplateOption";
import ReactSelectMemberFixedMultiValueRemove from "../../components/ReactSelectMemberFixedMultiValueRemove";
import FlowProvider from "../../service/FlowProvider";
import convertStepsToXyFlowData from "../../utils/convertStepsToXyFlowData";
export default function EditWorkOrderBuildPage({
  debouncedUpdateWorkOrderDetails,
  currentPage,
  setCurrentPage,
  formik,
  showUnassignedStepSwal,
  handleCallToAction,
  submitWorkOrder,
  initialWorkOrderDetails,
  initialFetchedWorkOrderDetails,
  latestReview,
  memberSelection,
  machineSelection,
  lockSelection,
  workOrderDetailsInput,
  setWorkOrderDetailsInput,
  nodes,
  setNodes,
  onNodesChange,
  edges,
  setEdges,
  onEdgesChange,
}) {
  const flowWrapperRef = useRef();
  const userSelector = useSelector((state) => state.login.auth);
  const editStepDisclosure = useDisclosure();
  const [unconnectedNodesError, setUnconnectedNodesError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const deleteMultiLockAccessConfirmationDisclosure = useDisclosure();
  const [selectedEditStep, setSelectedEditStep] = useState();
  const [selectedEditStepTab, setSelectedEditStepTab] = useState("overview");
  const [
    selectedDeleteMultiLockAccessIndexes,
    setSelectedDeleteMultiLockAccessIndexes,
  ] = useState();
  const nextAlphabeticalSequence = getAlphabeticSequencing(
    formik.values?.workOrderSteps
  );
  const groupName = selectedEditStep?.multiLockAccessGroup?.name; // or any name you want to match
  const hasChanged = !(
    JSON.stringify(formik.values) ===
    JSON.stringify(initialFetchedWorkOrderDetails)
  );
  const mainStep = formik.values?.workOrderSteps.find(
    (step) =>
      step?.isMainMultiLockAccess === true &&
      step?.multiLockAccessGroup?.name === groupName
  );
  const disableEditCoCreator = formik.values?.coCreatorMembers?.some(
    (member) => member.user?.email === userSelector.email
  );

  const mainIsPreAssigned = mainStep?.multiLockAccessGroup?.isPreAssigned ?? 0;
  const mainTotalStep = mainStep?.multiLockAccessGroup?.totalStep ?? 0;
  const replaceTemplateModal = useDisclosure();

  const coCreatorMemberSelection = memberSelection.filter((member) => {
    return (
      member.user.email !== userSelector.email &&
      member.role === "admin" &&
      member.hasManageWorkOrderPermission
    );
  });
  const [templateSelectDisplay, setTemplateSelectDisplay] = useState(null);
  const [templateToReplace, setTemplateToReplace] = useState(null); // Store the selected template
  const [fetchTemplateLoading, setFetchTemplateLoading] = useState(false); // Store the selected template
  const [templates, setTemplates] = useState([]);
  const workFlowRef = useRef();
  const workOrderTitleInputRef = useRef();
  const workOrderDeadlineInputRef = useRef();
  const selectAllOption = {
    label: "Select All",
    value: "all",
  };
  const filteredMemberSelection = [
    selectAllOption,
    ...memberSelection.filter((member) => {
      return member.role === "admin";
    }),
  ];

  function getMemberOptions() {
    const realOptions = filteredMemberSelection.filter(
      (opt) => opt.value !== "all"
    );
    const selectedValues = formik.values.review.reviewers.map(
      (opt) => opt.value
    );
    const selectedRealOptions = realOptions.filter((opt) =>
      selectedValues.includes(opt.value)
    );
    const allSelected = selectedRealOptions.length === realOptions.length;
    const finalOptions = allSelected
      ? realOptions // don't include "Select All"
      : [selectAllOption, ...realOptions];
    return finalOptions;
  }
  function isSelectAllSelected(options) {
    return (
      options.length ===
      filteredMemberSelection.filter((opt) => opt.value !== "all").length
    );
  }
  async function reviewerSelectHandler(newReviewers, actionMeta) {
    if (actionMeta.action === "clear") {
      formik.setFieldValue(
        "review.reviewers",
        formik.values.review.reviewers.filter((val) => val?.isDisabled)
      );
      return;
    }

    if (!newReviewers || newReviewers.length === 0) {
      formik.setFieldValue("review.reviewers", []);
      return;
    }

    const lastSelected = newReviewers[newReviewers.length - 1];

    if (lastSelected.value === "all") {
      // Toggle behavior: if already selected all, deselect
      const allAlreadySelected = isSelectAllSelected(
        newReviewers.filter((opt) => opt.value !== "all")
      );

      filteredMemberSelection
        .filter((opt) => opt.value !== "all")
        .filter((opt2) =>
          formik.values.review.reviewers.some((val) => {
            return !(opt2.value === val.value);
          })
        );

      const newValue = allAlreadySelected
        ? []
        : [
            ...formik.values.review.reviewers,
            ...filteredMemberSelection
              .filter((opt) => opt.value !== "all") // skip "all"
              .filter(
                (opt) =>
                  !formik.values.review.reviewers.some(
                    (val) => opt.value === val.value
                  ) // only add if NOT already selected
              ),
          ];
      const newValue2 = allAlreadySelected
        ? []
        : filteredMemberSelection.filter((opt) => opt.value !== "all");

      formik.setFieldValue("review.reviewers", newValue);
    } else {
      // Exclude the Select All option if it's present in selection
      const filtered = newReviewers.filter((opt) => opt.value !== "all");

      formik.setFieldValue("review.reviewers", filtered);
    }
  }
  const styles = {
    multiValue: (base, state) => {
      return state.data.isDisabled
        ? { ...base, backgroundColor: "#9c9c9c" }
        : base;
    },
    multiValueLabel: (base, state) => {
      return state.data.isDisabled
        ? { ...base, paddingRight: 8, color: "white" }
        : base;
    },
    multiValueRemove: (base, state) => {
      return state.data.isDisabled ? { ...base, display: "none" } : base;
    },
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  const customReactSelectStyle = {
    control: (provided, state) => ({
      ...provided,

      borderColor: "#039be5",
      borderRadius: "5px",
      boxShadow: state.isFocused ? "0 0 3px rgba(3, 154, 229, 0.8)" : "none",
      "&:hover": {
        boxShadow: "0 0 3px rgba(3, 154, 229, 0.8)",
      },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: 200, // Ensure the inner menu list also respects the height limit
    }),
  };
  async function templateSelectHandler(event) {
    const selectedTemplate = event;
    if (!selectedTemplate) return;

    const workDetailsJSON = JSON.stringify(formik.values);
    const initialWorkDetailsJSON = JSON.stringify(initialWorkOrderDetails);

    if (workDetailsJSON !== initialWorkDetailsJSON) {
      setTemplateToReplace(selectedTemplate);
      replaceTemplateModal.onOpen();
      return;
    }
    const formattedTemplate = {
      deadline_date_time: "",
      name: selectedTemplate.name,
      description: selectedTemplate.description,
      workOrderSteps: selectedTemplate.template_steps.map((step) => ({
        // switch id to UID
        // id: step.id,
        // id: step.id,
        UID: step.UID,
        name: step.name,
        description: step.description || "",
        form: !!step.form,
        notify: !!step.notify,
        notificationMessage: step.notification_message || "",
        machine: !!step.machine,
        multiLockAccess: !!step.multi_access_lock,
        isMainMultiLockAccess: !!step.is_main_multi_access_lock,
        ...(step?.multi_access_lock_step_index != null && {
          multiLockAccessStepIndex: Number(step.multi_access_lock_step_index),
        }),
        ...(!!step.multi_access_lock && {
          multiLockAccessGroup: {
            ...{
              name: step.template_multi_lock_group.name,
            },
            ...(!!step.is_main_multi_access_lock && {
              totalStep: step.template_multi_lock_group.total_step,
              isPreAssigned: true,
              multiLockAccessGroupItems: [
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
        condition: !!step.condition,
        ...(step.condition_question
          ? { condition_question: step.condition_question }
          : {}),
        condition_value: step.condition_value,
        loop_target_UID: step.loop_target_UID,
        parent_UID: step.parent_UID,
        formQuestions: step.template_form_questions.map((question) => {
          const type = {
            title: question.question_type,
            ...(question.question_type === "Number" && {
              format: question.format,
              unit: question.unit,
            }),
            ...(question.question_type === "Text" && {
              format: question.format,
            }),
            ...((question.question_type === "Multiple Choice" ||
              question.question_type === "Checkbox" ||
              question.question_type === "Checklist") && {
              options: question.options,
            }),
            ...(question.question_type === "Checkbox" && {
              options: question.options,
            }),
            ...(question.question_type === "Date & Time" && {
              date: question.include_date,
              time: question.include_time,
            }),
          };

          return {
            title: question.question,
            required: !!question.is_required,
            type,
          };
        }),
        selectedMachines: [],
        assigned_to: [],
        notify_to: [],
        requireVerifyMachine: false,
      })),
    };
    formik.setValues((prevState) => ({
      ...prevState,
      ...formattedTemplate,
    }));
    const xyFlowData = await convertStepsToXyFlowData(
      formattedTemplate.workOrderSteps
    );

    setNodes(xyFlowData?.nodes);
    setEdges(xyFlowData?.edges);
    setTemplateSelectDisplay(selectedTemplate);
  }

  async function confirmReplaceTemplate() {
    if (templateToReplace) {
      setWorkOrderDetailsInput((prevState) => ({
        ...prevState,
        name: templateToReplace.name,
        description: templateToReplace.description,
      }));
      const formattedTemplate = {
        deadline_date_time: "",
        UID: templateToReplace.UID,
        name: templateToReplace.name,
        description: templateToReplace.description,
        workOrderSteps: templateToReplace.template_steps.map((step) => ({
          // switch id to UID
          // id: step.id,
          // id: step.id,
          UID: step.UID,
          name: step.name,
          description: step.description || "",
          form: !!step.form,
          notify: !!step.notify,
          notificationMessage: step.notification_message || "",
          machine: !!step.machine,
          multiLockAccess: !!step.multi_access_lock,
          isMainMultiLockAccess: !!step.is_main_multi_access_lock,
          ...(step?.multi_access_lock_step_index != null && {
            multiLockAccessStepIndex: Number(step.multi_access_lock_step_index),
          }),
          ...(!!step.multi_access_lock && {
            multiLockAccessGroup: {
              ...{
                name: step.template_multi_lock_group.name,
              },
              ...(!!step.is_main_multi_access_lock && {
                totalStep: step.template_multi_lock_group.total_step,
                isPreAssigned: true,
                multiLockAccessGroupItems: [
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
          condition: !!step.condition,
          ...(step.condition_question
            ? { condition_question: step.condition_question }
            : {}),
          condition_value: step.condition_value,
          loop_target_UID: step.loop_target_UID,
          parent_UID: step.parent_UID,
          formQuestions: step.template_form_questions.map((question) => {
            const type = {
              title: question.question_type,
              ...(question.question_type === "Number" && {
                format: question.format,
                unit: question.unit,
              }),
              ...(question.question_type === "Text" && {
                format: question.format,
              }),
              ...((question.question_type === "Multiple Choice" ||
                question.question_type === "Checkbox" ||
                question.question_type === "Checklist") && {
                options: question.options,
              }),
              ...(question.question_type === "Date & Time" && {
                date: question.include_date,
                time: question.include_time,
              }),
            };

            return {
              title: question.question,
              required: !!question.is_required,
              type,
            };
          }),
          selectedMachines: [],
          assigned_to: [],
          notify_to: [],
          requireVerifyMachine: false,
        })),
      };
      formik.setValues((prevState) => ({
        ...prevState,
        ...formattedTemplate,
      }));

      const xyFlowData = await convertStepsToXyFlowData(
        formattedTemplate.workOrderSteps
      );

      setNodes(xyFlowData?.nodes);
      setEdges(xyFlowData?.edges);

      setTemplateSelectDisplay({
        ...templateToReplace,
        value: templateToReplace?.UID,
        label: templateToReplace?.name,
      });
    } else {
      setWorkOrderDetailsInput({
        name: "",
        description: "",
        workOrderCustomId: "",
      });
      formik.setValues({
        name: "",
        description: "",
        workOrderCustomId: "",
        workOrderSteps: [],
        deadline_date_time: "",
        review: { type: "single", reviewers: [] },
      });
      setTemplateSelectDisplay(null);
    }

    setTemplateToReplace(null);
    replaceTemplateModal.onClose();
  }

  function clearAll() {
    const workDetailsJSON = JSON.stringify(formik.values);
    const initialWorkDetailsJSON = JSON.stringify({
      name: "",
      description: "",
      workOrderSteps: [],
      deadline_date_time: "",
      review: { type: "single", reviewers: [] },
    });

    if (workDetailsJSON !== initialWorkDetailsJSON) {
      replaceTemplateModal.onOpen();
      return;
    }
  }

  async function fetchTemplates(controller) {
    setFetchTemplateLoading(true);
    await api
      .getTemplates()
      .then((response) => {
        setTemplates(
          response.data.templates.map((val) => ({
            ...val,
            label: val.name,
            value: val.UID,
            stepCount: val.template_steps.length,
          }))
        );
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setFetchTemplateLoading(false);
      });
  }

  function coCreatorSelectHandler(member) {
    formik.setFieldValue("coCreatorMembers", member);
  }
  async function handleSubmit() {
    const errors = await formik.validateForm();
    const allTouched = Object.keys(formik.values).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    formik.setTouched(allTouched);

    const startNode = nodes.find((n) => n.data?.isStart);
    const connectedNodeIds = getConnectedNodes(startNode, edges);
    const unconnectedNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));

    if (Object.keys(errors).length > 0) {
      if (errors.name) {
        workOrderTitleInputRef.current.scrollIntoView({
          behavior: "smooth", // or "auto"
          block: "center", // "start", "center", "end", or "nearest"
        });
      } else if (errors.deadline_date_time) {
        workOrderDeadlineInputRef.current.scrollIntoView({
          behavior: "smooth", // or "auto"
          block: "center", // "start", "center", "end", or "nearest"
        });
      } else if (unconnectedNodes.length) {
        setSubmitAttempted(true);
        workFlowRef.current.scrollIntoView({
          behavior: "smooth", // or "auto"
          block: "center", // "start", "center", "end", or "nearest"
        });
      } else if (errors.workOrderSteps) {
        workFlowRef.current.scrollIntoView({
          behavior: "smooth", // or "auto"
          block: "center", // "start", "center", "end", or "nearest"
        });
      }
    } else {
      formik.handleSubmit();
    }
  }
  const workOrderStepsRef = useRef(formik.values?.workOrderSteps);
  workOrderStepsRef.current = formik.values?.workOrderSteps;
  const handleOpenEditStepModal = useCallback(
    (selectedStep, selectedIndex) => {
      editStepDisclosure.onOpen();
      if (!editStepDisclosure.isOpen) {
        setSelectedEditStepTab("overview");
      }
      setSelectedEditStep({
        ...selectedStep,
        index: formik.values.workOrderSteps.findIndex(
          // switch id to UID
          (step) => step.UID === selectedStep.UID
        ),
      });
    },
    [formik.values.workOrderSteps]
  );
  const disabledDate = (current) => {
    return current && current < moment().startOf("day");
  };
  const disabledTime = (current) => {
    const now = moment();

    if (current.isSame(now, "day")) {
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < now.hour() + 1; i++) {
            hours.push(i);
          }
          return hours;
        },
      };
    }
    return {};
  };
  function dateHandler(date, dateString) {
    formik.setFieldValue("deadline_date_time", dateString);
  }
  const deleteStep = useCallback(
    (deletedNodes, newNodes = nodes, newEdges = edges) => {
      let isStartDeleted;

      // 1. Update Formik
      formik.setValues((prevState) => ({
        ...prevState,
        workOrderSteps: prevState.workOrderSteps.filter(
          (workOrderStep) =>
            // switch id to UID
            !deletedNodes.some((node) => node.data.UID === workOrderStep.UID)
        ),
      }));

      // 2. Remove deleted nodes
      const nodesAfterDeletion = newNodes.filter(
        (node) => !deletedNodes.some((dNode) => dNode.id === node.id)
      );

      // 3. Check if start/end deleted
      deletedNodes.forEach((dNode) => {
        if (dNode.data.isStart) isStartDeleted = true;
      });

      // 4. Rebuild edges
      let remainingNodes = [...newNodes];
      const updatedEdges = deletedNodes.reduce((acc, node) => {
        const incomers = getIncomers(node, remainingNodes, acc);
        const outgoers = getOutgoers(node, remainingNodes, acc);
        const connectedEdges = getConnectedEdges([node], acc);

        const remainingEdges = acc.filter(
          (edge) => !connectedEdges.includes(edge)
        );

        const createdEdges = incomers.flatMap(({ id: source }) =>
          outgoers.map(({ id: target }) => ({
            id: `${source}->${target}`,
            source,
            target,
            type: defaultNodeSettings.edgeType,
            markerEnd: defaultNodeSettings.defaultMarkerEnd,
          }))
        );

        remainingNodes = remainingNodes.filter((rn) => rn.id !== node.id);

        return [...remainingEdges, ...createdEdges];
      }, newEdges);

      setEdges(updatedEdges);

      // 5. Recompute node ordering
      let reorderedNodes = computeNodeOrder(
        nodesAfterDeletion,
        updatedEdges,
        nodesAfterDeletion[0]?.id || null
      );

      setNodes(reorderedNodes);

      // 6. Restore start step if deleted
      if (isStartDeleted) {
        setNodes((prev) =>
          prev.map((node) =>
            node.data.order === 1
              ? { ...node, data: { ...node.data, isStart: true } }
              : node
          )
        );
      }

      editStepDisclosure.onClose();
    },
    [nodes, edges, formik.setValues, editStepDisclosure.onClose]
  );

  function deleteEdges(deletedEdges) {
    const filteredEdges = edges.filter(
      (e) => !deletedEdges.some((de) => de.id === e.id)
    );
    setEdges(filteredEdges);

    let reorderedNodes = computeNodeOrder(
      nodes,
      filteredEdges,
      nodes[0]?.id || null
    );
    const startNode = reorderedNodes.find((n) => n.data.isStart);
    const orderedNodes = startNode
      ? getConnectedNodes(startNode, filteredEdges)
      : [];
    // let orderedNodes = reorderedNodes.filter((nds) => nds.data.order);

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        const hadLoopBackFromThisNode = deletedEdges.some(
          (edge) => edge.source === node.id && edge.sourceHandle === "loop-back"
        );

        if (!hadLoopBackFromThisNode) return node;

        return {
          ...node,
          data: {
            ...node.data,
            loop_target_UID: null,
          },
        };
      })
    );
  }
  const handleOpenDeleteMultiLockAccessConfirmationModal = useCallback(
    (indexesToRemove) => {
      deleteMultiLockAccessConfirmationDisclosure.onOpen();
      setSelectedDeleteMultiLockAccessIndexes(indexesToRemove);
    },
    [setSelectedDeleteMultiLockAccessIndexes]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchTemplates(controller);

    return () => {
      controller.abort();
    };
  }, []);
  useEffect(() => {
    if (!submitAttempted) return;

    const startNode = nodes.find((n) => n.data?.isStart);
    const connectedNodeIds = getConnectedNodes(startNode, edges);
    const unconnectedNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));
    setUnconnectedNodesError(
      unconnectedNodes.length
        ? "Some steps are not connected to the workflow. Please connect them or remove them before submitting."
        : ""
    );
  }, [edges, nodes.length, submitAttempted]);
  // useEffect(() => {
  //   formik.setFieldValue("workOrderSteps", formik.values.workOrderSteps);
  // }, [formik.values.workOrderSteps]);
  return (
    <FlowProvider
      nodes={nodes}
      edges={edges}
      setNodes={setNodes}
      setEdges={setEdges}
      formikSetValues={formik.setValues}
      editStepDisclosureOnClose={editStepDisclosure.onClose}
      getIncomers={getIncomers}
      getOutgoers={getOutgoers}
      getConnectedEdges={getConnectedEdges}
    >
      <Flex flexDir={"column"} justifyContent={"center"} gap={"20px"}>
        <CreateWorkOrderLayout
          stage={"build"}
          formik={formik}
          showUnassignedStepSwal={showUnassignedStepSwal}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          variant={"edit"}
          // hasSidebar={"true"}
          hasChanged={hasChanged}
          clearAll={clearAll}
          workOrderStatus={formik.values.status}
        >
          <FormikProvider value={formik}>
            <Flex pt={"10px"} px={"140px"} gap={"20px"} flexDir={"column"}>
              <WorkOrderDetailsInput
                workOrderTitleInputRef={workOrderTitleInputRef}
                formik={formik}
                workOrderDetailsInput={workOrderDetailsInput}
                setWorkOrderDetailsInput={setWorkOrderDetailsInput}
                debouncedUpdateWorkOrderDetails={
                  debouncedUpdateWorkOrderDetails
                }
                variant={"edit"}
              />
              <Flex flexDir={"column"} gap={"20px"}>
                {disableEditCoCreator ? (
                  ""
                ) : (
                  <>
                    <Flex
                      flexDir={"column"}
                      color={"black"}
                      fontWeight={700}
                      fontSize={"24px"}
                    >
                      <Flex alignItems={"center"} gap={"10px"}>
                        <Flex color={"#dc143c"}>Assign Co-Creator</Flex>
                        <Tooltip
                          hasArrow
                          placement={"top"}
                          maxW={"none"}
                          label={
                            <Flex
                              _hover={{ color: "black" }}
                              whiteSpace={"nowrap"}
                            >
                              You can only assign admins with the "Manage Work
                              Order" permission
                            </Flex>
                          }
                        >
                          <Flex
                            _hover={{ color: "black" }}
                            color={"#848484"}
                            fontSize={"20px"}
                          >
                            <FaRegCircleQuestion />
                          </Flex>
                        </Tooltip>
                      </Flex>
                      <Flex fontSize={"12px"} color={"#848484"}>
                        <Flex>
                          Choose an admin to share full access of this work
                          order.
                        </Flex>
                      </Flex>
                    </Flex>
                    <Flex gap={"10px"} alignItems={"center"}>
                      <Flex minW={"350px"} flexDir={"column"}>
                        <ReactSelect
                          // closeMenuOnSelect={false}
                          isMulti={true}
                          isSearchable
                          isClearable
                          onChange={(event) => {
                            coCreatorSelectHandler(event);
                          }}
                          value={formik.values.coCreatorMembers}
                          options={coCreatorMemberSelection}
                          components={{
                            Option: ReactSelectMemberSelection,
                            MultiValue: ReactSelectMemberMultiValue,
                          }}
                          placeholder={"Select co-Creator (Optional)"}
                          noOptionsMessage={() => (
                            <Flex
                              flexDir={"column"}
                              justify={"center"}
                              alignItems={"center"}
                              py={"30px"}
                            >
                              <Flex fontWeight={700} color={"#dc143c"}>
                                No members found!
                              </Flex>
                              <Text color={"#848484"}>
                                <Box as={"span"}>Please&nbsp;</Box>
                                <Box
                                  as="span"
                                  // color={"#dc143c"}
                                  // cursor={"pointer"}
                                  // textDecoration={"underline"}
                                  // onClick={() => handleCallToAction("/member/create")}
                                >
                                  Add a new member
                                </Box>
                                <Box as="span">&nbsp;now to get started!</Box>
                              </Text>
                            </Flex>
                          )}
                        ></ReactSelect>
                      </Flex>
                    </Flex>
                  </>
                )}
                <Flex flexDir={"column"} gap={"10px"}>
                  <Flex
                    flexDir={"column"}
                    color={"black"}
                    fontWeight={700}
                    fontSize={"24px"}
                  >
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Flex color={"#dc143c"}>Work Order Deadline</Flex>
                    </Flex>

                    <Flex fontSize={"12px"} color={"#848484"}>
                      <Flex>
                        Specify the deadline for completing the work order.
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex ref={workOrderDeadlineInputRef} h={"40px"} w={"350px"}>
                    <DatePicker
                      placeholder="Select Deadline Time"
                      style={{
                        width: "100%",
                        border:
                          formik.errors.deadline_date_time &&
                          formik.touched.deadline_date_time
                            ? "1px solid crimson"
                            : "1px solid #039BE5",
                      }}
                      onOpenChange={(open) => {
                        if (!open) {
                          setTimeout(() => {
                            formik.setFieldTouched("deadline_date_time"); // Example action
                            formik.validateForm();
                          }, 0);
                        }
                      }}
                      id="deadline_date_time"
                      disabledDate={disabledDate}
                      disabledTime={disabledTime}
                      showTime={{ format: "HH A" }}
                      format="YYYY-MM-DD hh:mm A"
                      onChange={dateHandler}
                      value={
                        formik.values?.deadline_date_time
                          ? dayjs(
                              formik.values?.deadline_date_time,
                              "YYYY-MM-DD hh:mm A"
                            )
                          : null
                      }
                    />
                  </Flex>
                  {formik.errors.deadline_date_time &&
                  formik.touched.deadline_date_time ? (
                    <Flex
                      fontSize={"14px"}
                      color={"#dc143c"}
                      py={"4px"}
                      alignItems={"center"}
                      gap={"5px"}
                    >
                      <Flex>
                        <FaTriangleExclamation />
                      </Flex>
                      <Flex>{formik.errors.deadline_date_time}</Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex>
                <Flex flexDir={"column"} gap={"10px"}>
                  <Flex
                    flexDir={"column"}
                    color={"black"}
                    fontWeight={700}
                    fontSize={"24px"}
                  >
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Flex color={"#dc143c"}>Assign Reviewer</Flex>
                      <Tooltip
                        hasArrow
                        placement={"top"}
                        maxW={"none"}
                        label={
                          <Flex
                            _hover={{ color: "black" }}
                            whiteSpace={"nowrap"}
                          >
                            You can only assign admins with the "Manage Work
                            Order" permission
                          </Flex>
                        }
                      >
                        <Flex
                          _hover={{ color: "black" }}
                          color={"#848484"}
                          fontSize={"20px"}
                        >
                          <FaRegCircleQuestion />
                        </Flex>
                      </Tooltip>
                    </Flex>

                    <Flex fontSize={"12px"} color={"#848484"}>
                      <Flex>
                        Choose an admin to review the work order before
                        initiating it.
                      </Flex>
                    </Flex>
                  </Flex>

                  <Flex gap={"10px"} alignItems={"center"}>
                    <Flex minW={"350px"} flexDir={"column"}>
                      <ReactSelect
                        // closeMenuOnSelect={false}
                        menuPortalTarget={document.body}
                        placeholder={"Select Reviewer (Optional)"}
                        styles={styles}
                        onChange={reviewerSelectHandler}
                        isSearchable
                        isClearable={formik.values.review?.reviewers?.some(
                          (v) => !v.isDisabled
                        )}
                        isMulti
                        options={getMemberOptions()}
                        components={{
                          Option: ReactSelectMemberSelection,
                          MultiValue: ReactSelectMemberMultiValue,
                          MultiValueRemove:
                            ReactSelectMemberFixedMultiValueRemove,
                        }}
                        value={formik.values.review.reviewers}
                        noOptionsMessage={() => (
                          <Flex
                            flexDir={"column"}
                            justify={"center"}
                            alignItems={"center"}
                            py={"30px"}
                          >
                            <Flex fontWeight={700} color={"#dc143c"}>
                              No admins found!
                            </Flex>
                            <Text color={"#848484"}>
                              <Box as={"span"}>Please&nbsp;</Box>
                              <Box
                                as="span"
                                // color={"#dc143c"}
                                // cursor={"pointer"}
                                // textDecoration={"underline"}
                                // onClick={() => handleCallToAction("/member/create")}
                              >
                                Add a new admin
                              </Box>
                              <Box as="span">&nbsp;now to get started!</Box>
                            </Text>
                          </Flex>
                        )}
                      ></ReactSelect>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex
                  flexDir={"column"}
                  color={"black"}
                  fontWeight={700}
                  fontSize={"24px"}
                >
                  <Flex color={"#dc143c"}>Work Order Template</Flex>
                  <Flex fontSize={"12px"} color={"#848484"}>
                    <Flex>
                      Choose a pre-defined template to quickly set up your
                      workflow.
                    </Flex>
                  </Flex>
                </Flex>
                {fetchTemplateLoading ? (
                  <Flex gap={"10px"} alignItems={"center"} color={"#848484"}>
                    <Spinner color="#848484" />
                    Fetching templates...
                  </Flex>
                ) : (
                  <Flex gap={"10px"} alignItems={"center"}>
                    <Flex w={"350px"} flexDir={"column"}>
                      <ReactSelect
                        components={{
                          Option: ReactSelectCustomTemplateOption,
                        }}
                        menuPortalTarget={document.body}
                        styles={customReactSelectStyle}
                        isSearchable
                        placeholder={"Select Template (Optional)"}
                        // isClearable
                        onChange={templateSelectHandler}
                        options={templates}
                        value={templateSelectDisplay}
                      />
                    </Flex>
                  </Flex>
                )}

                <Flex flexDir={"column"} gap={"20px"}>
                  <Flex
                    flexDir={"column"}
                    color={"black"}
                    fontWeight={700}
                    fontSize={"24px"}
                  >
                    <Flex color={"#dc143c"}>Workflow</Flex>
                    <Flex
                      textAlign={"center"}
                      fontSize={"12px"}
                      color={"#848484"}
                      justifyContent={"space-between"}
                    >
                      <Flex>
                        Add or adjust the steps by dragging and dropping
                      </Flex>
                    </Flex>
                  </Flex>
                  {formik.values?.status === "review_rejected" ? (
                    <Flex>
                      <ViewLatestReviewModal latestReview={latestReview} />
                    </Flex>
                  ) : (
                    ""
                  )}

                  {unconnectedNodesError ||
                  (formik?.errors?.workOrderSteps &&
                    formik.touched?.workOrderSteps) ? (
                    <Flex
                      py={"4px"}
                      px={"8px"}
                      bg={"#FDE2E2"}
                      alignItems={"center"}
                      gap={"5px"}
                      color={"#dc143c"}
                    >
                      <Flex>
                        <FaTriangleExclamation />
                      </Flex>
                      <Flex>
                        {unconnectedNodesError
                          ? unconnectedNodesError
                          : typeof formik?.errors?.workOrderSteps === "string"
                          ? formik?.errors?.workOrderSteps
                          : "Some steps are not fully assigned. Please assign all steps before continuing."}
                      </Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                  <Flex ref={workFlowRef} w={"100%"} h={"100%"}>
                    <WorkFlowXyFlow
                      editStepDisclosureOnClose={editStepDisclosure.onClose}
                      // deleteStep={deleteStep}
                      deleteEdges={deleteEdges}
                      // handleDownload={handleDownload}
                      flowWrapperRef={flowWrapperRef}
                      nextAlphabeticalSequence={nextAlphabeticalSequence}
                      formikSetValues={formik.setValues}
                      formikWorkOrderStepsErrors={formik.errors?.workOrderSteps}
                      formikWorkOrderSteps={formik.values.workOrderSteps}
                      handleOpenEditStepModal={handleOpenEditStepModal}
                      nodes={nodes}
                      setNodes={setNodes}
                      onNodesChange={onNodesChange}
                      edges={edges}
                      setEdges={setEdges}
                      onEdgesChange={onEdgesChange}
                    />
                  </Flex>
                </Flex>
              </Flex>
              <Flex pt={"20px"} justifyContent={"end"}>
                <Button
                  alignItems={"center"}
                  gap={"10px"}
                  background={"#dc143c"}
                  color={"white"}
                  onClick={handleSubmit}
                >
                  <Flex>Submit Work Order</Flex>
                </Button>
              </Flex>
            </Flex>
            <ReplaceTemplateModal
              confirmReplaceTemplate={confirmReplaceTemplate}
              replaceTemplateModal={replaceTemplateModal}
            />
            <Flex w={"500px"}>
              <EditStepDrawer
                // deleteStep={deleteStep}
                stepIndex={selectedEditStep?.index}
                nextAlphabeticalSequence={nextAlphabeticalSequence}
                editStepDisclosure={editStepDisclosure}
                selectedEditStep={selectedEditStep}
                variant={"workOrder"}
                formikSetValues={formik.setValues}
                mainTotalStep={mainTotalStep}
                stepType={"workOrderSteps"}
                reviewsThatFlaggedThisStep={
                  selectedEditStep?.reviewsThatFlaggedThisStep
                }
                machineSelection={machineSelection}
                memberSelection={memberSelection}
                lockSelection={lockSelection}
                handleCallToAction={handleCallToAction}
                selectedEditStepTab={selectedEditStepTab}
                setSelectedEditStepTab={setSelectedEditStepTab}
              />
            </Flex>
          </FormikProvider>
          <DeleteMultiLockAccessConfirmationModal
          // deleteStep={deleteStep}
          />
        </CreateWorkOrderLayout>
      </Flex>
    </FlowProvider>
  );
}
