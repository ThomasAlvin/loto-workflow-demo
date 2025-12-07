import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Button,
  Checkbox,
  Collapse,
  Flex,
  Input,
  Slide,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import formatString from "../../utils/formatString";
import { GoPencil } from "react-icons/go";
import { IoAccessibility } from "react-icons/io5";
import { FaTriangleExclamation } from "react-icons/fa6";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { VscEmptyWindow } from "react-icons/vsc";
import { FaAngleDown, FaFlag, FaRegEdit, FaUserAlt } from "react-icons/fa";
import {
  IoIosWarning,
  IoMdClose,
  IoMdInformationCircleOutline,
} from "react-icons/io";
import { useFormik, useFormikContext } from "formik";
import * as Yup from "yup";
import NonEditableStepModalFormQuestion from "./NonEditableStepModalFormQuestion";
import EditStepQuestionsModal from "./EditStepQuestionsModal";
import setAllFieldsTouched from "../../utils/setAllFieldsTouched";
import { useReactFlow } from "@xyflow/react";
import { v4 as uuid } from "uuid";
import StepDetailsDrawerAssignment from "./StepDetailsDrawerAssignment";
import defaultNodeSettings from "../../constants/defaultNodeSettings";
import { useDeleteContext } from "../../service/DeleteMultiLockAccessContext";
import getConditionalStepValue from "../../utils/getConditionalStepValue";
import getConditionalNode from "../../utils/getConditionalNode";
import getConditionalEdge from "../../utils/getConditionalEdge";
import ConfirmationModal from "../ConfirmationModal";
import computeNodeOrder from "../../utils/computeNodeOrder";
import getDescendantNodesById from "../../utils/getDescendantNodesById";
import labelizeRole from "../../utils/labelizeRole";
import { ActionsContext } from "../../service/FlowProvider";

export default function EditStepDrawer({
  stepIndex,
  nextAlphabeticalSequence,
  editStepDisclosure,
  selectedEditStep,
  variant = "workOrder",
  formikSetValues,
  mainTotalStep,
  stepType,
  reviewsThatFlaggedThisStep,
  machineSelection,
  memberSelection,
  lockSelection,
  handleCallToAction,
  selectedEditStepTab,
  setSelectedEditStepTab,
}) {
  const actionsRef = useContext(ActionsContext);
  const { deleteStep } = actionsRef.current;

  const { isOpen } = useDeleteContext();
  const drawerRef = useRef();
  const tabSelection =
    variant === "template" ? ["overview"] : ["overview", "assignment"];
  const editStepQuestionsDisclosure = useDisclosure();
  const { screenToFlowPosition, setNodes, setEdges, getNodes, getEdges } =
    useReactFlow();
  const workOrderFormik = useFormikContext();

  function statusHandler(event) {
    const { id } = event.currentTarget;
    setSelectedEditStepTab(id);
  }
  const formikErrorRefs = useRef([]);
  const modalUnsavedChanges = useDisclosure();
  const saveChangesConfirmationDisclosure = useDisclosure();
  const [saveChangesConfirmationLabel, setSaveChangesConfirmationLabel] =
    useState({
      header: "",
      header2: "",
      body: "",
      confirmationLabel: "",
    });
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const editStepDrawerFormik = useFormik({
    initialValues: {
      ...selectedEditStep,
      actions: "",
      formQuestionsSize: "",
    },
    validateOnChange: false,
    validationSchema: Yup.object()
      .shape({
        name: Yup.string().trim().required("Name cannot be empty"),
        form: Yup.boolean().required(),
        notify: Yup.boolean().required(),
        notificationMessage: Yup.string()
          .trim()
          .when("notify", {
            is: true,
            then: () =>
              Yup.string().trim().required("Notification message is required"),
            otherwise: () => Yup.string().trim().nullable(),
          }),
        condition_question: Yup.string()
          .trim()
          .when("condition", {
            is: true,
            then: () =>
              Yup.string().trim().required("Condition Question is required"),
            otherwise: () => Yup.string().trim().nullable(),
          }),
        formQuestions: Yup.array().when("form", {
          is: true,
          then: () =>
            Yup.array().of(
              Yup.object().shape({
                title: Yup.string().trim().required("Question cannot be empty"),
                type: Yup.object().shape({
                  options: Yup.array().when("title", {
                    is: (val) => val === "Multiple Choice", // Check if type.title is 'Multiple Choice'
                    then: () =>
                      Yup.array()
                        .of(
                          Yup.string().trim().required("Option cannot be empty")
                        ) // Each option must be a string
                        .min(
                          2,
                          "At least two options are required for Multiple Choice"
                        )
                        .test("unique", "Options must be unique", (value) => {
                          if (!value) return true; // Skip if undefined, let required/min handle it
                          const trimmed = value.map((v) =>
                            typeof v === "string" ? v.trim() : ""
                          );
                          const unique = new Set(trimmed);
                          return unique.size === trimmed.length;
                        }), // At least 2 options required for Multiple Choice
                    otherwise: () =>
                      Yup.array().when("title", {
                        is: (val) => val === "Checkbox" || val === "Checklist", // Check if type.title is 'Checkbox'
                        then: () =>
                          Yup.array()
                            .of(
                              Yup.string()
                                .trim()
                                .required("Option cannot be empty")
                            ) // Each option must be a string
                            .min(
                              1,
                              "At least one option is required for Checkbox"
                            )
                            .test(
                              "unique",
                              "Options must be unique",
                              (value) => {
                                if (!value) return true; // Skip if undefined, let required/min handle it
                                const trimmed = value.map((v) =>
                                  typeof v === "string" ? v.trim() : ""
                                );
                                const unique = new Set(trimmed);
                                return unique.size === trimmed.length;
                              }
                            ), // At least 1 option required for Checkbox
                        otherwise: () => Yup.array().nullable(), // Options are not required for other types
                      }),
                  }),
                }),
              })
            ), // At least one question if forms is true
          otherwise: () => Yup.array().nullable(), // Make it optional if forms is not true
        }),
        formQuestionsSize: Yup.number().when(["form", "formQuestions"], {
          is: (formVal, formQuestionsVal) => {
            return formVal === true && formQuestionsVal?.length < 1;
          },
          then: (schema) =>
            schema.required("At least one question is required"),
        }),
        assigned_to: Yup.array()
          .of(
            Yup.object().shape({
              id: Yup.string()
                .trim()
                .required("This step requires an assigned member."),
            })
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
                })
              )
              .min(1, "This step requires at least 1 member to be notified."),
          otherwise: (schema) => schema.notRequired(),
        }),
        selectedMachines: Yup.array()
          .test("customValidation", "Machines is Required.", function (val) {
            const { from } = this; // Access parent and from
            const workOrderStep = from[0].value;
            if (workOrderStep && workOrderStep.machine) {
              return Array.isArray(val) && val.length > 0; // Ensure ID is provided (not empty or whitespace)
            }
            return true;
          })
          .of(
            Yup.object().shape({
              selectedInspectionForms: Yup.array()
                .min(1, "Machine requires at least 1 inspection form.")
                .required("Inspection forms are required."), // Validate inspection forms
            })
          ),
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
              const workOrderStep = from[0].value; // Access the second work order step

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
      .test("atleastOne", "null", (obj) => {
        if (
          obj.form ||
          obj.notify ||
          obj.machine ||
          obj.lockAccess ||
          obj.multiLockAccess ||
          obj.condition ||
          obj.triggerAPI ||
          obj.sendWebhook
        ) {
          return true; // everything is fine
        }
        return new Yup.ValidationError(
          "Atleast 1 action is required",
          null,
          "actions"
        );
      }),
    onSubmit: () => {
      saveChanges();
    },
  });
  const [selectedEditQuestions, setSelectedEditQuestions] = useState();
  const [
    initialMainMultiLockAccessGroupName,
    setInitialMainMultiLockAccessGroupName,
  ] = useState(selectedEditStep?.multiLockAccessGroup?.name);
  const feedbackDisclosure = useDisclosure();
  const multiLockAccessDisabled =
    editStepDrawerFormik.values?.multiLockAccess &&
    !editStepDrawerFormik.values?.isMainMultiLockAccess;

  function onDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    const copiedItems = [...editStepDrawerFormik.values?.formQuestions];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);

    editStepDrawerFormik.setValues((prevState) => {
      return {
        ...prevState,
        formQuestions: copiedItems,
      };
    });
  }
  function createInitialStepInput(name = "", linkedStepIndex = "", customUuid) {
    const initialStepInput = {
      // switch id to UID
      UID: customUuid || uuid(),
      name: name + linkedStepIndex,
      description: "",
      form: false,
      assigned_to: [],
      notify: false,
      notificationMessage: "",
      notify_to: [],
      lockAccess: false,
      multiLockAccess: name ? true : false,
      isMainMultiLockAccess: false,
      ...(name
        ? {
            multiLockAccessStepIndex: linkedStepIndex || 0,
            multiLockAccessGroup: {
              name: name ? name : nextAlphabeticalSequence,
            },
          }
        : {}),
      machine: false,
      requireVerifyMachine: false,
      triggerAPI: false,
      sendWebhook: false,
      condition: false,
      condition_question: "",
      titleTriggerAPI: "",
      selectedMachines: [],
      formQuestions: [
        {
          id: uuid(),
          title: "",
          required: true,
          type: {
            title: "Text",
            format: "Short Answer",
          },
        },
      ],
    };
    return initialStepInput;
  }
  const handleKeyUp = (event) => {
    if (event.key === " ") {
      event.preventDefault();
    }
  };

  function inputHandler(event) {
    const { id, value } = event.target;
    let tempObject = { ...editStepDrawerFormik.values, [id]: value };

    editStepDrawerFormik.setValues((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }

  function handleAccordionChange(type) {
    switch (type) {
      case "form":
        editStepDrawerFormik.setFieldValue(
          "form",
          !editStepDrawerFormik.values.form
        );

        break;
      case "notify":
        editStepDrawerFormik.setFieldValue(
          "notify",
          !editStepDrawerFormik.values.notify
        );
        break;
      case "condition":
        editStepDrawerFormik.setFieldValue(
          "condition",
          !editStepDrawerFormik.values.condition
        );
        break;
      case "machine":
        editStepDrawerFormik.setFieldValue(
          "machine",
          !editStepDrawerFormik.values.machine
        );

        break;
      case "lockAccess":
        editStepDrawerFormik.setFieldValue(
          "lockAccess",
          !editStepDrawerFormik.values.lockAccess
        );
        editStepDrawerFormik.setFieldValue(
          "work_order_locks",
          !editStepDrawerFormik.values.lockAccess
            ? [
                {
                  name: "",
                  id: "",
                  require_lock_image: false,
                  label: "",
                  value: "",
                },
              ]
            : []
        );

        break;
      case "multiLockAccess":
        editStepDrawerFormik.setValues((prevState) => ({
          ...prevState,
          multiLockAccess: !prevState.multiLockAccess,
          isMainMultiLockAccess: !prevState.multiLockAccess,
          multiLockAccessStepIndex: !prevState.multiLockAccess ? 0 : null,
          multiLockAccessGroup: !prevState.multiLockAccess
            ? {
                name:
                  initialMainMultiLockAccessGroupName ||
                  nextAlphabeticalSequence,
                lockLimit: 1,
                totalStep: 0,
                isPreAssigned: true,
                multiLockAccessGroupItems: !prevState.multiLockAccess
                  ? [
                      {
                        name: "",
                        id: "",
                        label: "",
                        value: "",
                      },
                    ]
                  : [],
              }
            : {},
        }));
        break;
      case "triggerAPI":
        editStepDrawerFormik.setFieldValue(
          "triggerAPI",
          !editStepDrawerFormik.values.triggerAPI
        );
        break;
      case "sendWebhook":
        editStepDrawerFormik.setFieldValue(
          "sendWebhook",
          !editStepDrawerFormik.values.sendWebhook
        );
        break;
    }
  }

  function saveChanges(withConfirmationCheck = true) {
    if (withConfirmationCheck) {
      if (
        selectedEditStep.condition &&
        !editStepDrawerFormik.values.condition &&
        selectedEditStep.multiLockAccess &&
        !editStepDrawerFormik.values.multiLockAccess
      ) {
        saveChangesConfirmationDisclosure.onOpen();
        setSaveChangesConfirmationLabel({
          header: "Remove Condition?",
          header2:
            "Are you sure you want to remove condition and lock access from this step?",
          body: "Removing the condition and lock access from this step will also delete all conditional branches linked to it and its linked steps. Are you sure you want to continue?",
          confirmationLabel: "Save Changes",
        });
        return;
      }
      if (
        selectedEditStep.condition &&
        !editStepDrawerFormik.values.condition
      ) {
        saveChangesConfirmationDisclosure.onOpen();
        setSaveChangesConfirmationLabel({
          header: "Remove Condition?",
          header2: "Are you sure you want to remove condition from this step?",
          body: "Removing the condition from this step will also delete all conditional branches linked to it. Are you sure you want to continue?",
          confirmationLabel: "Save Changes",
        });
        return;
      }
      if (
        selectedEditStep.multiLockAccess &&
        !editStepDrawerFormik.values.multiLockAccess
      ) {
        saveChangesConfirmationDisclosure.onOpen();
        setSaveChangesConfirmationLabel({
          header: "Remove Lock Access?",
          header2:
            "Are you sure you want to remove lock access from this step?",
          body: "Removing the lock access from this step will also delete all its linked steps. Are you sure you want to continue?",
          confirmationLabel: "Save Changes",
        });
        return;
      }
    }

    const filteredStepDetails = { ...editStepDrawerFormik.values };
    if (!filteredStepDetails.form) {
      filteredStepDetails.formQuestions = [];
      // filteredStepDetails.form_questions = [];
    }
    if (!filteredStepDetails.notify) {
      filteredStepDetails.notificationMessage = "";
      // filteredStepDetails.notification_message = "";
      filteredStepDetails.notify_to = [];
    }
    if (!filteredStepDetails.condition) {
      filteredStepDetails.condition_question = "";
    }
    if (!filteredStepDetails.machine) {
      filteredStepDetails.selectedMachines = [];
    }
    if (!filteredStepDetails.triggerAPI) {
      filteredStepDetails.titleTriggerAPI = "";
    }
    if (!filteredStepDetails.lockAccess) {
      filteredStepDetails.work_order_locks = [];
    }
    if (!filteredStepDetails?.multiLockAccessGroup?.isPreAssigned) {
      if (filteredStepDetails?.multiLockAccessGroup) {
        delete filteredStepDetails.multiLockAccessGroup
          .multiLockAccessGroupItems;
      }
    }
    const count = filteredStepDetails?.multiLockAccessGroup?.totalStep || 0;

    const groupName =
      filteredStepDetails?.multiLockAccessGroup?.name ||
      initialMainMultiLockAccessGroupName;
    const conditionalNodeUuid = [uuid(), uuid()];
    const conditionalDataUuid = [uuid(), uuid()];
    const items = getNodes();

    const linkedSteps = items.filter((item) => {
      return (
        item.data.multiLockAccessGroup?.name === groupName &&
        !item.data.isMainMultiLockAccess
      );
    });
    console.log(linkedSteps);

    const sortedLinkedSteps = [...linkedSteps].sort(
      (a, b) =>
        Number(a.data.multiLockAccessStepIndex) -
        Number(b.data.multiLockAccessStepIndex)
    );

    const keptLinkedSteps = sortedLinkedSteps.slice(0, count);
    const linkedStepNodeUuid = Array.from({ length: count }, () => uuid());
    const linkedStepDataUuid = Array.from({ length: count }, () => uuid());
    console.log("Node", linkedStepNodeUuid);
    console.log("Data", linkedStepDataUuid);

    formikSetValues((prevState) => {
      const newLinkedSteps = [];
      for (let i = linkedSteps.length; i < count; i++) {
        console.log(i);

        newLinkedSteps.push(
          createInitialStepInput(groupName, i + 1, linkedStepDataUuid[i])
        );
      }

      let newItems = [];

      items.forEach((item, index) => {
        const isLinkedStep =
          item.data.multiLockAccessGroup?.name === groupName &&
          !item.data.isMainMultiLockAccess;

        if (index === stepIndex) {
          newItems.push(filteredStepDetails);
          if (
            filteredStepDetails.isMainMultiLockAccess &&
            newLinkedSteps.length > 0
          ) {
            console.log(newLinkedSteps);

            newItems.push(...newLinkedSteps);
          }
          if (filteredStepDetails.condition && !item.data.condition) {
            newItems.push(
              ...getConditionalStepValue(
                filteredStepDetails.UID,
                conditionalDataUuid
              )
            );
          }
        } else if (
          initialMainMultiLockAccessGroupName &&
          isLinkedStep &&
          // switch id to UID
          !keptLinkedSteps.some((kept) => kept.data.UID === item.data.UID)
        ) {
          return;
        } else {
          newItems.push(item.data);
        }
      });
      console.log(newItems);

      if (selectedEditStep.condition && !filteredStepDetails.condition) {
        newItems = newItems.filter(
          (newItm) => newItm?.parent_UID !== filteredStepDetails.id
        );
      }

      return {
        ...prevState,
        [stepType]: newItems,
      };
    });
    console.log(linkedSteps);
    console.log(count);

    const newLinkedSteps = [];
    for (let i = linkedSteps.length; i < count; i++) {
      newLinkedSteps.push(
        createInitialStepInput(groupName, i + 1, linkedStepDataUuid[i])
      );
    }
    console.log(newLinkedSteps);

    const newNodes = [];
    let newEdges = getEdges();

    const deletedNodes = [];
    const isAddingLinkedStep =
      filteredStepDetails.isMainMultiLockAccess && newLinkedSteps.length > 0;
    console.log(isAddingLinkedStep);

    const { descendantNodes } = getDescendantNodesById(
      selectedEditStep.nodeId,
      newEdges,
      getNodes()
    );
    console.log("selectedEditStep.nodeId", selectedEditStep.nodeId);
    console.log("newEdges", newEdges);
    console.log("getNodes()", getNodes());
    console.log("descendantsNodes", descendantNodes);
    console.log("items", items);

    items.forEach((item, index) => {
      const isLinkedStep =
        item.data.multiLockAccessGroup?.name === groupName &&
        !item.data.isMainMultiLockAccess;
      if (index === stepIndex) {
        newNodes.push({
          ...item,
          data: {
            ...filteredStepDetails,
            label: filteredStepDetails.name,
            isEnd:
              filteredStepDetails.isEnd &&
              filteredStepDetails.isMainMultiLockAccess &&
              newLinkedSteps.length > 0
                ? false
                : filteredStepDetails.isEnd,
          },
        });

        // Kalau di add condition, tambahin sample steps
        if (filteredStepDetails.condition && !item.data?.condition) {
          console.log(filteredStepDetails);
          console.log(item);

          let nextNodeId = "";
          newEdges = newEdges.filter((e) => {
            if (e.source === item.id) {
              nextNodeId = e.target;
            }
            return e.source !== item.id;
          });
          newEdges.push(...getConditionalEdge(conditionalNodeUuid, item.id));

          newNodes.push(
            ...getConditionalNode(
              conditionalNodeUuid,
              { x: item.position.x, y: item.position.y },
              // switch id to UID
              item.data.UID,
              conditionalDataUuid
            )
          );
        }
        if (isAddingLinkedStep) {
          console.log(newEdges);
          // if there is like 3 nodes and you are editing step 2, nextNodeId gives you data on step 3
          let nextNodeId = "";
          if (!filteredStepDetails.condition) {
            newEdges = newEdges.filter((e) => {
              if (e.source === item.id) {
                nextNodeId = e.target;
              }
              return e.source !== item.id;
            });
          }

          const linkedEdge = newLinkedSteps.map((linkStep, linkStepIndex) => ({
            id: `edge-${
              linkStepIndex ? linkedStepNodeUuid[linkStepIndex - 1] : item.id
            }-${linkedStepNodeUuid[linkStepIndex]}`,
            source: linkStepIndex
              ? linkedStepNodeUuid[linkStepIndex - 1]
              : item.id,
            target: linkedStepNodeUuid[linkStepIndex],
            sourceHandle: "normal",
            type: defaultNodeSettings.edgeType,
            markerEnd: defaultNodeSettings.defaultMarkerEnd,
          }));

          if (!filteredStepDetails.condition) {
            newEdges.push(...linkedEdge);
            if (nextNodeId) {
              const lastNewEdge = {
                id: `edge-${
                  linkedStepNodeUuid[newLinkedSteps.length - 1]
                }-${nextNodeId}`,
                source: linkedStepNodeUuid[newLinkedSteps.length - 1],
                target: nextNodeId,
                type: defaultNodeSettings.edgeType,
                markerEnd: defaultNodeSettings.defaultMarkerEnd,
              };
              newEdges.push(lastNewEdge);
            }
          }

          newNodes.push(
            ...newLinkedSteps.map((newLinkedStep, idx) => {
              return {
                id: linkedStepNodeUuid[idx],
                type: "step",
                position: {
                  x: item.position.x,
                  y:
                    item.position.y +
                    defaultNodeSettings.newStepGap * (idx + 1),
                },
                data: {
                  ...newLinkedStep,
                  label: newLinkedStep.name,
                  parent_UID: filteredStepDetails.parent_UID || "",
                  condition_value: filteredStepDetails.condition_value || "",
                  order: item.data.order + idx + 1,
                  isEnd:
                    item.data.isEnd && idx + 1 === newLinkedSteps.length
                      ? true
                      : false,
                },
              };
            })
          );
        }
      } else if (
        initialMainMultiLockAccessGroupName &&
        isLinkedStep &&
        // switch id to UID
        !keptLinkedSteps.some((kept) => kept.data.UID === item.data.UID)
      ) {
        deletedNodes.push(item);
        return;
      } else if (
        isAddingLinkedStep &&
        descendantNodes.some(
          // switch id to UID
          (descendant) => descendant.data.UID === item.data.UID
        )
      ) {
        newNodes.push({
          ...item,
          position: {
            x: item.position.x,
            y:
              item.position.y +
              newLinkedSteps.length * defaultNodeSettings.newStepGap,
          },
          data: {
            ...item.data,
            order: item.data.order + newLinkedSteps.length,
          },
        });
      } else {
        newNodes.push(item);
      }
    });

    // Kalau di remove condition, remove all conditional branch steps
    if (selectedEditStep.condition && !filteredStepDetails.condition) {
      deletedNodes.push(
        ...newNodes.filter((newItm) =>
          descendantNodes.some(
            // switch id to UID
            (descendant) => descendant.data.UID === newItm?.data.UID
          )
        )
      );
    }
    const reorderedNewNodes = computeNodeOrder(
      newNodes,
      newEdges,
      newNodes[0]?.id || null
    );
    if (deletedNodes.length) {
      deleteStep(deletedNodes, newNodes, newEdges);
    } else {
      setNodes(reorderedNewNodes.map((node) => ({ ...node, selected: false })));
      setEdges(newEdges.map((edge) => ({ ...edge, selected: false })));
    }
    console.log(newLinkedSteps);

    closeModal();
    saveChangesConfirmationDisclosure.onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    editStepDrawerFormik.setTouched(
      setAllFieldsTouched(editStepDrawerFormik.values)
    );
    const errors = await editStepDrawerFormik.validateForm();
    const {
      assigned_to,
      notify_to,
      selectedMachines,
      work_order_locks,
      multiLockAccessGroup,
      titleTriggerAPI,
      ...filteredUnblockingErrors
    } = errors;

    const errorPaths = getFieldPaths(filteredUnblockingErrors);

    if (errorPaths.length > 0) {
      setSelectedEditStepTab("overview");
      setTimeout(() => {
        scrollToFirstError(errorPaths);
      }, 100);
      editStepDrawerFormik.handleSubmit();
    } else {
      saveChanges();
    }
  }
  function getFieldPaths(obj, prefix = "") {
    let paths = [];
    for (const key in obj) {
      const value = obj[key];
      const path = prefix
        ? Array.isArray(obj)
          ? `${prefix}[${key}]`
          : `${prefix}.${key}`
        : key;
      if (value && typeof value === "object") {
        paths = paths.concat(getFieldPaths(value, path));
      } else {
        paths.push(path);
      }
    }

    return paths;
  }
  function scrollToFirstError(errorKeys) {
    for (const key of errorKeys) {
      const ref = formikErrorRefs.current[key];
      if (ref) {
        const match = key.match(/^formQuestions\[(\d+)\]/);
        const formQuestionsIndex = match ? parseInt(match[1], 10) : null;

        if (formQuestionsIndex !== null) {
          editStepDrawerFormik.setValues((prevState) => {
            return {
              ...prevState,
              formQuestions: prevState.formQuestions.map(
                (formQuestion, questionIndex) => {
                  if (questionIndex === formQuestionsIndex) {
                    return {
                      ...formQuestion,
                      accordionOpen: true,
                    };
                  }
                  return formQuestion;
                }
              ),
            };
          });
        }
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
    }
  }

  const handleOpenEditStepQuestionsModal = useCallback(
    (selectedQuestions) => {
      editStepQuestionsDisclosure.onOpen();
      setSelectedEditQuestions([
        ...selectedQuestions.map((question) => ({
          ...question,
          accordionOpen: false,
        })),
      ]);
    },
    [setSelectedEditQuestions]
  );
  const unselectAll = () => {
    setNodes(getNodes().map((node) => ({ ...node, selected: false })));
    setEdges(getEdges().map((edge) => ({ ...edge, selected: false })));
  };
  function closeModal() {
    modalUnsavedChanges.onClose();
    feedbackDisclosure.onClose();
    editStepDrawerFormik.resetForm();
    editStepDisclosure.onClose();
  }

  function checkUnsavedChanges() {
    if (
      JSON.stringify(editStepDrawerFormik.values) !==
      JSON.stringify(selectedEditStep)
    ) {
      modalUnsavedChanges.onOpen();
    } else {
      closeModal();
    }
  }

  function handleSlider(value, type) {
    editStepDrawerFormik.setValues((prevState) => {
      return {
        ...prevState,
        multiLockAccessGroup: {
          ...prevState.multiLockAccessGroup,
          [type]: value,
        },
      };
    });
  }
  // useEffect(() => {
  //   const observer = new MutationObserver((mutations) => {
  //     mutations.forEach((m) => {
  //       console.log("DOM mutation detected:", m);
  //     });
  //   });

  //   if (drawerRef.current) {
  //     observer.observe(drawerRef.current, {
  //       childList: true,
  //       subtree: true,
  //     });
  //   }

  //   return () => observer.disconnect();
  // }, []);
  useEffect(() => {
    function handleClickOutside(event) {
      console.log(event.target);
      console.log(!drawerRef.current.contains(event.target));
      if (event.target.closest(".react-select__indicator")) return;
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !editStepQuestionsDisclosure.isOpen &&
        !isOpen
      ) {
        unselectAll();
        editStepDisclosure.onClose();
      }
    }

    if (editStepDisclosure.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    editStepDisclosure.isOpen,
    editStepDisclosure.onClose,
    editStepQuestionsDisclosure.isOpen,
    isOpen,
  ]);
  useEffect(() => {
    setInitialMainMultiLockAccessGroupName(
      selectedEditStep?.isMainMultiLockAccess
        ? selectedEditStep?.multiLockAccessGroup?.name
        : ""
    );
    editStepDrawerFormik.validateForm();
    editStepDrawerFormik.setValues({
      ...selectedEditStep,
      actions: "",
      formQuestionsSize: "",
    });
  }, [selectedEditStep]);
  return (
    <>
      <Slide
        direction="right"
        in={editStepDisclosure.isOpen}
        style={{ zIndex: 1000, width: "500px" }}
      >
        <Box
          ref={drawerRef}
          position="fixed"
          top="0"
          right="0"
          w={"500px"}
          height="100vh"
          bg="white"
          shadow="md"
          pl={4}
          pt={4}
          zIndex={1000}
        >
          <Flex
            h={"100%"}
            w={"100%"}
            position={"relative"}
            flexDir={"column"}
            // gap={"20px"}
          >
            {/* Header */}
            <Flex
              fontWeight={700}
              borderBottom={"2px solid #bababa"}
              justify={"space-between"}
              pr={"10px"}
            >
              <Flex fontWeight={700}>
                {tabSelection.map((statusOption) => (
                  <Flex
                    id={statusOption}
                    cursor={"pointer"}
                    borderBottom={
                      selectedEditStepTab === statusOption
                        ? "3px solid #dc143c"
                        : ""
                    }
                    color={
                      workOrderFormik?.errors?.workOrderSteps?.[
                        workOrderFormik.values.workOrderSteps.findIndex(
                          (step) =>
                            // switch id to UID
                            step.UID === editStepDrawerFormik.values.UID
                        )
                      ] && statusOption === "assignment"
                        ? "#dc143c"
                        : selectedEditStepTab === statusOption
                        ? "black"
                        : "#848484"
                    }
                    px={"30px"}
                    py={"2px"}
                    alignItems={"center"}
                    gap={"5px"}
                    onClick={statusHandler}
                  >
                    {formatString(statusOption, true, true, true)}
                    {workOrderFormik?.errors?.workOrderSteps?.[
                      workOrderFormik.values.workOrderSteps.findIndex(
                        // switch id to UID
                        (step) => step.UID === editStepDrawerFormik.values.UID
                      )
                    ] && statusOption === "assignment" ? (
                      <IoIosWarning />
                    ) : (
                      ""
                    )}
                  </Flex>
                ))}
              </Flex>
              <Flex fontSize={"20px"} mb={"5px"}>
                <Flex
                  onClick={editStepDisclosure.onClose}
                  cursor={"pointer"}
                  p={"5px"}
                  _hover={{ bg: "#ededed" }}
                >
                  <IoMdClose />
                </Flex>
              </Flex>
            </Flex>
            {/* Body */}
            <Flex py={"20px"} flex={1} w={"100%"} overflowY={"auto"}>
              <Flex
                h={"fit-content"}
                pb={"50px"}
                w={"100%"}
                flexDir={"column"}
                gap={"10px"}
              >
                {reviewsThatFlaggedThisStep?.length ? (
                  <Flex color={"#dc143c"} p={"10px"} fontSize={"14px"}>
                    <Flex w={"100%"} flexDir={"column"}>
                      <Flex alignItems={"center"} gap={"10px"}>
                        <Flex>
                          <FaFlag />
                        </Flex>
                        <Flex
                          cursor={"pointer"}
                          onClick={() => {
                            feedbackDisclosure.onToggle();
                          }}
                          alignItems={"center"}
                          gap={"10px"}
                        >
                          <Flex fontWeight={"700"}>Show Feedback</Flex>
                          <Flex
                            transition="transform 0.3s ease"
                            transform={
                              feedbackDisclosure.isOpen
                                ? "rotate(180deg)"
                                : "rotate(0deg)"
                            }
                          >
                            <FaAngleDown />
                          </Flex>
                        </Flex>
                      </Flex>

                      <Collapse in={feedbackDisclosure.isOpen} animateOpacity>
                        <Flex mt={"20px"} flexDir={"column"} gap={"10px"}>
                          {reviewsThatFlaggedThisStep.map((val) => {
                            const filteredReviewer = val?.super_admin?.id
                              ? { ...val?.super_admin, is_superadmin: true }
                              : {
                                  ...val?.member.user,
                                  role: val.member.role,
                                  employee_id: val.member.employee_id,
                                };
                            return (
                              <Flex
                                w={"100%"}
                                p={"10px"}
                                border={"1px solid #dc143c"}
                                bg={"#fff5f5"}
                                flexDir={"column"}
                                gap={"10px"}
                              >
                                <Flex alignItems={"center"} gap={"10px"}>
                                  {filteredReviewer.first_name ? (
                                    <Avatar
                                      outline={"1px solid #dc143c"}
                                      border={"2px solid white"}
                                      name={
                                        filteredReviewer.first_name +
                                        " " +
                                        filteredReviewer.last_name
                                      }
                                      src={
                                        filteredReviewer.profile_image_url
                                          ? IMGURL +
                                            filteredReviewer.profile_image_url
                                          : null
                                      }
                                    ></Avatar>
                                  ) : (
                                    <Flex
                                      outline={"2px solid #dc143c"}
                                      bg={"#bababa"}
                                      borderRadius={"100%"}
                                      justifyContent={"center"}
                                      alignItems={"center"}
                                      h={"88px"}
                                      w={"88px"}
                                      border={"4px solid white"}
                                    >
                                      <Flex color={"white"} fontSize={"44px"}>
                                        <FaUserAlt />
                                      </Flex>
                                    </Flex>
                                  )}
                                  <Flex
                                    flexDir={"column"}
                                    justify={"space-between"}
                                  >
                                    <Flex color={"black"} fontWeight={700}>
                                      {filteredReviewer.first_name +
                                        " - " +
                                        filteredReviewer.last_name}
                                    </Flex>
                                    <Flex color={"#848484"}>
                                      {filteredReviewer?.is_superadmin
                                        ? "Super Admin"
                                        : labelizeRole(filteredReviewer?.role) +
                                          " - " +
                                          filteredReviewer?.employee_id}
                                    </Flex>
                                  </Flex>
                                </Flex>
                                <Flex color={"black"}>
                                  {val.work_order_reviewer_response.reason}
                                </Flex>
                              </Flex>
                            );
                          })}
                        </Flex>
                      </Collapse>
                    </Flex>
                  </Flex>
                ) : (
                  ""
                )}
                {selectedEditStepTab === "overview" ? (
                  <Flex flexDir={"column"} gap={"10px"}>
                    <Flex flexDir={"column"} gap={"10px"}>
                      <Flex flexDir={"column"}>
                        <Flex
                          justify={"space-between"}
                          px={"10px"}
                          alignItems={"center"}
                          fontWeight={700}
                          fontSize={"18px"}
                        >
                          <Flex
                            onClick={() => {
                              console.log(
                                "selectedEditStep:",
                                selectedEditStep
                              );
                              console.log(
                                "selectedEditStep:",
                                getNodes().filter((nds) => {
                                  // switch id to UID
                                  nds.data.UID === selectedEditStep.UID;
                                })
                              );
                              console.log("workOrderFormik:", workOrderFormik);
                              console.log(
                                "editStepDrawerFormik:",
                                editStepDrawerFormik
                              );
                              console.log(
                                "editStepDrawerFormik.values:",
                                editStepDrawerFormik.values
                              );
                            }}
                          >
                            Step Details
                          </Flex>
                          <Flex>
                            <GoPencil />
                          </Flex>
                        </Flex>
                      </Flex>
                      <Flex px={"15px"} flexDir={"column"}>
                        <Flex fontSize={"14px"} fontWeight={"700"}>
                          Name&nbsp;
                          <Box as="span" color={"#dc143c"}>
                            *
                          </Box>
                        </Flex>
                        <Input
                          fontSize={"14px"}
                          border={
                            editStepDrawerFormik.touched.name &&
                            editStepDrawerFormik.errors.name
                              ? "1px solid crimson"
                              : "1px solid #e2e8f0"
                          }
                          onChange={inputHandler}
                          onBlur={editStepDrawerFormik.handleBlur}
                          id="name"
                          value={editStepDrawerFormik.values?.name}
                          px={"20px"}
                          placeholder="name"
                        ></Input>
                        {editStepDrawerFormik.touched.name &&
                          editStepDrawerFormik.errors.name && (
                            <Flex
                              ref={(el) =>
                                (formikErrorRefs.current[`name`] = el)
                              }
                              color="crimson"
                              fontSize="14px"
                              gap="5px"
                              alignItems="center"
                            >
                              <FaTriangleExclamation />
                              <Flex>{editStepDrawerFormik.errors.name}</Flex>
                            </Flex>
                          )}
                      </Flex>
                      <Flex px={"15px"} flexDir={"column"}>
                        <Flex fontSize={"14px"} fontWeight={"700"}>
                          Description (
                          <Box as="span" color={"#848484"}>
                            Optional
                          </Box>
                          )
                        </Flex>
                        <Textarea
                          fontSize={"14px"}
                          onChange={inputHandler}
                          id="description"
                          value={editStepDrawerFormik.values?.description ?? ""}
                          px={"20px"}
                          placeholder="Description"
                        ></Textarea>
                      </Flex>
                    </Flex>
                    <Flex flexDir={"column"} gap={"10px"}>
                      <Flex px={"10px"} flexDir={"column"}>
                        <Flex
                          justify={"space-between"}
                          alignItems={"center"}
                          fontWeight={700}
                          fontSize={"18px"}
                        >
                          <Flex
                            onClick={() =>
                              console.log([
                                editStepDrawerFormik.values?.form && 0,
                                editStepDrawerFormik.values?.machine && 1,
                                editStepDrawerFormik.values?.multiLockAccess &&
                                  2,
                                editStepDrawerFormik.values?.notify && 3,
                                editStepDrawerFormik.values?.condition && 4,
                                // editStepDrawerFormik.values?.triggerAPI && 5,
                                // editStepDrawerFormik.values?.sendWebhook && 6,
                              ])
                            }
                          >
                            Actions&nbsp;
                            <Box as="span" color={"#dc143c"}>
                              *
                            </Box>
                          </Flex>
                          <Flex>
                            <IoAccessibility />
                          </Flex>
                        </Flex>
                        {editStepDrawerFormik.touched.actions &&
                        editStepDrawerFormik.errors.actions ? (
                          <Flex
                            ref={(el) =>
                              (formikErrorRefs.current[`actions`] = el)
                            }
                            bg={"#FDE2E2"}
                            px={"10px"}
                            alignItems={"center"}
                            gap={"5px"}
                            py={"5px"}
                            fontSize={"14px"}
                            color={"crimson"}
                          >
                            <FaTriangleExclamation />
                            {editStepDrawerFormik.errors.actions}
                          </Flex>
                        ) : (
                          ""
                        )}
                      </Flex>
                      <Flex gap={"15px"} flexDir={"column"}>
                        <Accordion
                          onKeyUp={handleKeyUp}
                          defaultIndex={
                            variant === "workOrder"
                              ? [0, 1, 2, 3, 4]
                              : undefined
                          }
                          index={[
                            editStepDrawerFormik.values?.form ? 0 : null,
                            editStepDrawerFormik.values?.machine ? 1 : null,
                            editStepDrawerFormik.values?.multiLockAccess
                              ? 2
                              : null,
                            editStepDrawerFormik.values?.notify ? 3 : null,
                            editStepDrawerFormik.values?.condition ? 4 : null,
                            // editStepDrawerFormik.values?.triggerAPI && 5,
                            // editStepDrawerFormik.values?.sendWebhook && 6,
                          ]}
                          allowMultiple
                          gap={"0px"}
                        >
                          {variant === "template" || variant === "workOrder" ? (
                            <AccordionItem>
                              <Flex flexDir={"column"}>
                                <AccordionButton px={"10px"}>
                                  <Flex
                                    onClick={() => {
                                      handleAccordionChange("form");
                                    }}
                                    w={"100%"}
                                    justify={"space-between"}
                                    gap={"5px"}
                                  >
                                    <Flex gap={"10px"} alignItems={"center"}>
                                      <AccordionIcon />
                                      <Flex flexDir={"column"}>
                                        <Box
                                          fontSize={"14px"}
                                          fontWeight={700}
                                          as="span"
                                          flex="1"
                                          textAlign="left"
                                        >
                                          Forms
                                        </Box>
                                        <Flex
                                          textAlign={"left"}
                                          fontSize={"13px"}
                                          color={"#848484"}
                                          justifyContent={"space-between"}
                                        >
                                          <Flex>
                                            Add a form to complete this step.
                                          </Flex>
                                        </Flex>
                                      </Flex>
                                    </Flex>

                                    <Flex pointerEvents={"none"}>
                                      <Checkbox
                                        isChecked={
                                          editStepDrawerFormik.values?.form
                                        }
                                      ></Checkbox>
                                    </Flex>
                                  </Flex>
                                </AccordionButton>
                              </Flex>
                              <AccordionPanel pb={4}>
                                <Flex flexDir={"column"} gap={"20px"}>
                                  <Flex flexDir={"column"} gap={"10px"}>
                                    <Flex flexDir={"column"}>
                                      {editStepDrawerFormik.touched
                                        .formQuestionsSize &&
                                        editStepDrawerFormik.errors
                                          .formQuestionsSize && (
                                          <Flex
                                            ref={(el) =>
                                              (formikErrorRefs.current[
                                                `formQuestionsSize`
                                              ] = el)
                                            }
                                            color="crimson"
                                            fontSize="14px"
                                            gap="5px"
                                            alignItems="center"
                                          >
                                            <FaTriangleExclamation />
                                            <Flex>
                                              {
                                                editStepDrawerFormik.errors
                                                  .formQuestionsSize
                                              }
                                            </Flex>
                                          </Flex>
                                        )}
                                    </Flex>
                                    <Flex
                                      pb={"10px"}
                                      fontSize={"14px"}
                                      flexDir={"column"}
                                      w={"100%"}
                                    >
                                      <Flex
                                        bg={
                                          editStepDrawerFormik.touched
                                            .formQuestionsSize &&
                                          editStepDrawerFormik.errors
                                            .formQuestionsSize
                                            ? "#fde2e2"
                                            : "#F8F9FA"
                                        }
                                        w={"100%"}
                                        color={
                                          editStepDrawerFormik.touched
                                            .formQuestionsSize &&
                                          editStepDrawerFormik.errors
                                            .formQuestionsSize
                                            ? "#dc143c"
                                            : "#848484"
                                        }
                                        fontSize={"12px"}
                                        shadow={
                                          editStepDrawerFormik.touched
                                            .formQuestionsSize &&
                                          editStepDrawerFormik.errors
                                            .formQuestionsSize
                                            ? "0px 0px 3px rgba(220,20,60,1)"
                                            : "0px 0px 3px rgba(50,50,93,0.5)"
                                        }
                                      >
                                        <Flex
                                          flex={1}
                                          borderRight={"#E2E8F0 1px solid"}
                                          px={"10px"}
                                          py={"5px"}
                                        >
                                          Question
                                        </Flex>

                                        <Flex
                                          borderRight={"#E2E8F0 1px solid"}
                                          px={"5px"}
                                          py={"5px"}
                                          w={"120px"}
                                        >
                                          Type
                                        </Flex>
                                        <Flex
                                          borderRight={"#E2E8F0 1px solid"}
                                          px={"5px"}
                                          py={"5px"}
                                          w={"60px"}
                                        >
                                          Required
                                        </Flex>
                                      </Flex>
                                      <DragDropContext
                                        onDragEnd={(result) =>
                                          onDragEnd(result)
                                        }
                                      >
                                        <Droppable
                                          droppableId={"editQuestion"}
                                          key={"editQuestion"}
                                        >
                                          {(provided, snapshot) => {
                                            return (
                                              <Flex
                                                flexDir={"column"}
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                style={{
                                                  width: "100%",
                                                  background:
                                                    snapshot.isDraggingOver
                                                      ? "#ffb0b0"
                                                      : "",
                                                }}
                                              >
                                                {editStepDrawerFormik.values
                                                  ?.formQuestions?.length ===
                                                0 ? (
                                                  <Flex
                                                    justifyContent={"center"}
                                                    flexDir={"column"}
                                                    p={"20px"}
                                                    bg={"#f8f9fa"}
                                                    border={
                                                      editStepDrawerFormik
                                                        .touched
                                                        .formQuestionsSize &&
                                                      editStepDrawerFormik
                                                        .errors
                                                        .formQuestionsSize
                                                        ? "#dc143c 2px dashed"
                                                        : "#848484 2px dashed"
                                                    }
                                                    color={"#848484"}
                                                    gap={"20px"}
                                                  >
                                                    <Flex
                                                      justify={"center"}
                                                      fontSize={"100px"}
                                                    >
                                                      <VscEmptyWindow />
                                                    </Flex>
                                                    <Flex
                                                      flexDir={"column"}
                                                      gap={"5px"}
                                                    >
                                                      <Flex
                                                        justify={"center"}
                                                        fontWeight={700}
                                                        fontSize={"20px"}
                                                      >
                                                        Form Questions is Empty!
                                                      </Flex>
                                                      <Flex justify={"center"}>
                                                        Create questions to
                                                        gather the information
                                                        needed for this step.
                                                      </Flex>
                                                    </Flex>
                                                  </Flex>
                                                ) : (
                                                  editStepDrawerFormik.values?.formQuestions?.map(
                                                    (val2, index) => {
                                                      return (
                                                        <NonEditableStepModalFormQuestion
                                                          formikErrorRefs={
                                                            formikErrorRefs
                                                          }
                                                          title={val2.title}
                                                          required={
                                                            val2.required
                                                          }
                                                          accordionOpen={
                                                            val2?.accordionOpen
                                                          }
                                                          type={val2.type}
                                                          formik={
                                                            editStepDrawerFormik
                                                          }
                                                          index={index}
                                                        />
                                                      );
                                                    }
                                                  )
                                                )}
                                                {provided.placeholder}
                                              </Flex>
                                            );
                                          }}
                                        </Droppable>
                                      </DragDropContext>
                                    </Flex>
                                    <Flex justify={"space-between"}>
                                      <Button
                                        bg={"white"}
                                        onClick={() =>
                                          handleOpenEditStepQuestionsModal(
                                            editStepDrawerFormik.values
                                              .formQuestions
                                          )
                                        }
                                        border={"dashed 2px #dc143c"}
                                        p={0}
                                        borderRadius={"2px"}
                                        h={"auto"}
                                        fontSize={"13px"}
                                      >
                                        <Flex
                                          py={"4px"}
                                          px={"8px"}
                                          alignItems={"center"}
                                          justifyContent={"space-between"}
                                        >
                                          <Flex
                                            gap={"5px"}
                                            alignItems={"center"}
                                          >
                                            <Flex
                                              color={"crimson"}
                                              fontWeight={700}
                                            >
                                              <FaRegEdit />
                                            </Flex>
                                            <Flex
                                              color={"crimson"}
                                              fontWeight={"700"}
                                            >
                                              Edit Questions
                                            </Flex>
                                          </Flex>
                                        </Flex>
                                      </Button>
                                    </Flex>
                                  </Flex>
                                </Flex>
                              </AccordionPanel>
                            </AccordionItem>
                          ) : (
                            ""
                          )}

                          {variant === "template" || variant === "workOrder" ? (
                            <AccordionItem>
                              <Flex flexDir={"column"}>
                                <AccordionButton
                                  px={"10px"}
                                  onClick={() => {
                                    handleAccordionChange("machine");
                                  }}
                                >
                                  <Flex
                                    gap={"5px"}
                                    w={"100%"}
                                    justify={"space-between"}
                                  >
                                    <Flex gap={"10px"} alignItems={"center"}>
                                      <AccordionIcon visibility={"hidden"} />
                                      <Flex flexDir={"column"}>
                                        <Box
                                          fontSize={"14px"}
                                          fontWeight={700}
                                          as="span"
                                          flex="1"
                                          textAlign="left"
                                        >
                                          Machine
                                        </Box>
                                        <Flex
                                          textAlign={"left"}
                                          fontSize={"13px"}
                                          color={"#848484"}
                                          justifyContent={"space-between"}
                                        >
                                          <Flex>
                                            Include machines in this step for
                                            members to finish
                                          </Flex>
                                          <Flex></Flex>
                                        </Flex>
                                      </Flex>
                                    </Flex>
                                    <Flex>
                                      <Flex pointerEvents={"none"}>
                                        <Checkbox
                                          isChecked={
                                            editStepDrawerFormik.values?.machine
                                          }
                                        ></Checkbox>
                                      </Flex>
                                    </Flex>
                                  </Flex>
                                </AccordionButton>
                              </Flex>
                            </AccordionItem>
                          ) : (
                            ""
                          )}

                          {variant === "template" || variant === "workOrder" ? (
                            <AccordionItem>
                              <Flex flexDir={"column"}>
                                <AccordionButton
                                  px={"10px"}
                                  onClick={() => {
                                    multiLockAccessDisabled
                                      ? ""
                                      : handleAccordionChange(
                                          "multiLockAccess"
                                        );
                                  }}
                                >
                                  <Flex
                                    gap={"5px"}
                                    w={"100%"}
                                    justify={"space-between"}
                                  >
                                    <Flex gap={"10px"} alignItems={"center"}>
                                      <AccordionIcon />
                                      <Flex flexDir={"column"}>
                                        <Box
                                          fontSize={"14px"}
                                          fontWeight={700}
                                          as="span"
                                          flex="1"
                                          textAlign="left"
                                        >
                                          Lock Access
                                        </Box>
                                        <Flex
                                          textAlign={"left"}
                                          fontSize={"13px"}
                                          color={"#848484"}
                                          justifyContent={"space-between"}
                                        >
                                          <Flex>
                                            Allow giving lock access to members
                                            for completing this step
                                          </Flex>
                                          <Flex></Flex>
                                        </Flex>
                                      </Flex>
                                    </Flex>
                                    <Flex>
                                      <Flex
                                        flexDir={"column"}
                                        justify={"center"}
                                        pointerEvents={"none"}
                                      >
                                        <Checkbox
                                          isDisabled={multiLockAccessDisabled}
                                          isChecked={
                                            editStepDrawerFormik.values
                                              ?.multiLockAccess
                                          }
                                        ></Checkbox>
                                      </Flex>
                                    </Flex>
                                  </Flex>
                                </AccordionButton>
                                <AccordionPanel pb={4}>
                                  <Flex flexDir={"column"} gap={"20px"}>
                                    <Flex
                                      w={"100%"}
                                      justify={"space-between"}
                                      gap={"30px"}
                                    >
                                      {editStepDrawerFormik.values
                                        ?.multiLockAccess ? (
                                        <>
                                          <Flex
                                            w={"100%"}
                                            gap={"5px"}
                                            flexDir={"column"}
                                          >
                                            <Flex
                                              fontSize={"13px"}
                                              flexDir={"column"}
                                            >
                                              <Flex alignItems={"center"}>
                                                <Flex
                                                  fontWeight={700}
                                                  textAlign="left"
                                                >
                                                  Linked Step Count&nbsp;
                                                </Flex>
                                                <Flex mb={"1px"}>
                                                  <Tooltip
                                                    hasArrow
                                                    placement="top"
                                                    maxW={"none"}
                                                    label={
                                                      <Box whiteSpace="nowrap">
                                                        The linked steps will be
                                                        generated based on the
                                                        count set
                                                      </Box>
                                                    }
                                                  >
                                                    <Flex
                                                      _hover={{
                                                        color: "black",
                                                      }}
                                                      color={"#848484"}
                                                      fontSize={"16px"}
                                                    >
                                                      <IoMdInformationCircleOutline />
                                                    </Flex>
                                                  </Tooltip>
                                                </Flex>
                                              </Flex>
                                              <Flex
                                                fontSize={"13px"}
                                                color={"#848484"}
                                              >
                                                Number of steps to create and
                                                link under this lock access.
                                              </Flex>
                                            </Flex>

                                            <Flex pt={"32px"} px={"10px"}>
                                              <Slider
                                                isDisabled={
                                                  multiLockAccessDisabled
                                                }
                                                onChange={(val) => {
                                                  handleSlider(
                                                    val,
                                                    "totalStep"
                                                  );
                                                }}
                                                value={
                                                  editStepDrawerFormik.values
                                                    .isMainMultiLockAccess
                                                    ? editStepDrawerFormik
                                                        .values
                                                        ?.multiLockAccessGroup
                                                        ?.totalStep
                                                    : mainTotalStep
                                                }
                                                min={0}
                                                max={10}
                                                step={1}
                                              >
                                                <SliderMark
                                                  fontSize={"12px"}
                                                  value={
                                                    editStepDrawerFormik.values
                                                      .isMainMultiLockAccess
                                                      ? editStepDrawerFormik
                                                          .values
                                                          ?.multiLockAccessGroup
                                                          ?.totalStep
                                                      : mainTotalStep
                                                  }
                                                  textAlign="center"
                                                  bg="#dc143c"
                                                  color="white"
                                                  mt="-10"
                                                  ml="-4"
                                                  w="28px"
                                                >
                                                  {editStepDrawerFormik.values
                                                    .isMainMultiLockAccess
                                                    ? editStepDrawerFormik
                                                        .values
                                                        ?.multiLockAccessGroup
                                                        ?.totalStep
                                                    : mainTotalStep}
                                                </SliderMark>
                                                <SliderTrack bg="red.200">
                                                  <SliderFilledTrack bg="#dc143c" />
                                                </SliderTrack>
                                                <SliderThumb boxSize={4} />
                                              </Slider>
                                            </Flex>
                                          </Flex>
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </Flex>
                                  </Flex>
                                </AccordionPanel>
                              </Flex>
                            </AccordionItem>
                          ) : (
                            ""
                          )}
                          {variant === "template" || variant === "workOrder" ? (
                            <AccordionItem>
                              <Flex flexDir={"column"}>
                                <AccordionButton px={"10px"} onClick={() => ""}>
                                  <Flex
                                    onClick={() => {
                                      handleAccordionChange("notify");
                                    }}
                                    w={"100%"}
                                    gap={"5px"}
                                    justify={"space-between"}
                                  >
                                    <Flex gap={"10px"} alignItems={"center"}>
                                      <AccordionIcon />
                                      <Flex flexDir={"column"}>
                                        <Box
                                          fontSize={"14px"}
                                          fontWeight={700}
                                          as="span"
                                          flex="1"
                                          textAlign="left"
                                        >
                                          Notify
                                        </Box>
                                        <Flex
                                          textAlign={"left"}
                                          fontSize={"13px"}
                                          color={"#848484"}
                                          justifyContent={"space-between"}
                                        >
                                          <Flex>
                                            Allow sending notifications to other
                                            members when this step is finished
                                          </Flex>
                                          <Flex></Flex>
                                        </Flex>
                                      </Flex>
                                    </Flex>
                                    <Flex pointerEvents={"none"}>
                                      <Checkbox
                                        isChecked={
                                          editStepDrawerFormik.values?.notify
                                        }
                                      ></Checkbox>
                                    </Flex>
                                  </Flex>
                                </AccordionButton>
                                <AccordionPanel pb={4}>
                                  <Flex flexDir={"column"} gap={"20px"}>
                                    <Flex
                                      fontSize={"13px"}
                                      flexDir={"column"}
                                      w={"100%"}
                                    >
                                      <Flex gap={"5px"} flexDir={"column"}>
                                        <Box
                                          fontWeight={700}
                                          as="span"
                                          flex="1"
                                          textAlign="left"
                                        >
                                          Notification Message&nbsp;
                                          <Box as="span" color={"#dc143c"}>
                                            *
                                          </Box>
                                        </Box>
                                        <Input
                                          fontSize={"14px"}
                                          border={
                                            editStepDrawerFormik.touched
                                              .notificationMessage &&
                                            editStepDrawerFormik.errors
                                              .notificationMessage
                                              ? "1px solid crimson"
                                              : "1px solid #e2e8f0"
                                          }
                                          value={
                                            editStepDrawerFormik.values
                                              ?.notificationMessage
                                          }
                                          id="notificationMessage"
                                          onChange={inputHandler}
                                          onBlur={
                                            editStepDrawerFormik.handleBlur
                                          }
                                          placeholder='Step 3 on "Fixing AC in Room 317" is Finished '
                                        ></Input>
                                        {editStepDrawerFormik.touched
                                          .notificationMessage &&
                                          editStepDrawerFormik.errors
                                            .notificationMessage && (
                                            <Flex
                                              ref={(el) =>
                                                (formikErrorRefs.current[
                                                  `notificationMessage`
                                                ] = el)
                                              }
                                              color="crimson"
                                              fontSize="14px"
                                              gap="5px"
                                              alignItems="center"
                                            >
                                              <FaTriangleExclamation />
                                              <Flex>
                                                {
                                                  editStepDrawerFormik.errors
                                                    .notificationMessage
                                                }
                                              </Flex>
                                            </Flex>
                                          )}
                                      </Flex>
                                    </Flex>
                                  </Flex>
                                </AccordionPanel>
                              </Flex>
                            </AccordionItem>
                          ) : (
                            ""
                          )}
                          {variant === "template" || variant === "workOrder" ? (
                            <AccordionItem>
                              <Flex flexDir={"column"}>
                                <AccordionButton px={"10px"} onClick={() => ""}>
                                  <Flex
                                    onClick={() => {
                                      handleAccordionChange("condition");
                                    }}
                                    w={"100%"}
                                    gap={"5px"}
                                    justify={"space-between"}
                                  >
                                    <Flex gap={"10px"} alignItems={"center"}>
                                      <AccordionIcon />
                                      <Flex flexDir={"column"}>
                                        <Box
                                          fontSize={"14px"}
                                          fontWeight={700}
                                          as="span"
                                          flex="1"
                                          textAlign="left"
                                        >
                                          Condition
                                        </Box>
                                        <Flex
                                          textAlign={"left"}
                                          fontSize={"13px"}
                                          color={"#848484"}
                                          justifyContent={"space-between"}
                                        >
                                          <Flex>
                                            Mark this step as conditional to
                                            branch the workflow based on an
                                            answer.
                                          </Flex>
                                          <Flex></Flex>
                                        </Flex>
                                      </Flex>
                                    </Flex>
                                    <Flex pointerEvents={"none"}>
                                      <Checkbox
                                        isChecked={
                                          editStepDrawerFormik.values?.condition
                                        }
                                      ></Checkbox>
                                    </Flex>
                                  </Flex>
                                </AccordionButton>
                                <AccordionPanel pb={4}>
                                  <Flex flexDir={"column"} gap={"20px"}>
                                    <Flex
                                      fontSize={"13px"}
                                      flexDir={"column"}
                                      w={"100%"}
                                    >
                                      <Flex gap={"5px"} flexDir={"column"}>
                                        <Flex flexDir={"column"}>
                                          <Box
                                            fontWeight={700}
                                            as="span"
                                            flex="1"
                                            textAlign="left"
                                          >
                                            Condition Question&nbsp;
                                            <Box as="span" color={"#dc143c"}>
                                              *
                                            </Box>
                                          </Box>
                                          <Flex
                                            textAlign={"center"}
                                            fontSize={"13px"}
                                            color={"#848484"}
                                            justifyContent={"space-between"}
                                          >
                                            <Flex>
                                              Note : Assignee can only answer
                                              the question with Yes or No
                                            </Flex>
                                            <Flex></Flex>
                                          </Flex>
                                        </Flex>
                                        <Input
                                          fontSize={"14px"}
                                          border={
                                            editStepDrawerFormik.touched
                                              .condition_question &&
                                            editStepDrawerFormik.errors
                                              .condition_question
                                              ? "1px solid crimson"
                                              : "1px solid #e2e8f0"
                                          }
                                          value={
                                            editStepDrawerFormik.values
                                              ?.condition_question || ""
                                          }
                                          id="condition_question"
                                          onChange={inputHandler}
                                          onBlur={
                                            editStepDrawerFormik.handleBlur
                                          }
                                          placeholder='Step 3 on "Fixing AC in Room 317" is Finished '
                                        ></Input>

                                        {editStepDrawerFormik.touched
                                          .condition_question &&
                                          editStepDrawerFormik.errors
                                            .condition_question && (
                                            <Flex
                                              ref={(el) =>
                                                (formikErrorRefs.current[
                                                  `condition_question`
                                                ] = el)
                                              }
                                              color="crimson"
                                              fontSize="14px"
                                              gap="5px"
                                              alignItems="center"
                                            >
                                              <FaTriangleExclamation />
                                              <Flex>
                                                {
                                                  editStepDrawerFormik.errors
                                                    .condition_question
                                                }
                                              </Flex>
                                            </Flex>
                                          )}
                                      </Flex>
                                    </Flex>
                                  </Flex>
                                </AccordionPanel>
                              </Flex>
                            </AccordionItem>
                          ) : (
                            ""
                          )}
                          {/* {variant === "template" || variant === "workOrder" ? (
                    <AccordionItem>
                      <Flex flexDir={"column"}>
                        <AccordionButton
                          onClick={() => {
                            handleAccordionChange("triggerAPI");
                          }}
                        >
                          <Flex w={"100%"} justify={"space-between"}>
                            <Flex gap={"10px"} alignItems={"center"}>
                              <AccordionIcon visibility={"hidden"} />
                              <Flex flexDir={"column"}>
                                <Flex
                                  fontWeight={700}
                                  as="span"
                                  flex="1"
                                  alignItems={"center"}
                                  gap={"4px"}
                                >
                                  Trigger API
                                  <Tooltip
                                    hasArrow
                                    placement="top"
                                    maxW={"none"}
                                    label={
                                      <Box whiteSpace="nowrap">
                                        You're server must send a request to
                                        confirm this step
                                      </Box>
                                    }
                                  >
                                    <Flex
                                      _hover={{ color: "black" }}
                                      color={"#848484"}
                                      fontSize={"20px"}
                                    >
                                      <IoMdInformationCircleOutline />
                                    </Flex>
                                  </Tooltip>
                                </Flex>
                                <Flex
                                  textAlign={"left"}
                                  fontSize={"14px"}
                                  color={"#848484"}
                                  justifyContent={"space-between"}
                                >
                                  <Flex>
                                    Allow members to trigger the API for
                                    authorization on specific actions.
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Flex>
                            <Flex>
                              <Flex
                                flexDir={"column"}
                                justify={"center"}
                                pointerEvents={"none"}
                              >
                                <Checkbox
                                  isChecked={editStepDrawerFormik.values?.triggerAPI}
                                ></Checkbox>
                              </Flex>
                            </Flex>
                          </Flex>
                        </AccordionButton>
                      </Flex>
                    </AccordionItem>
                  ) : (
                    ""
                  )}
                  {variant === "template" || variant === "workOrder" ? (
                    <AccordionItem>
                      <Flex flexDir={"column"}>
                        <AccordionButton
                          onClick={() => {
                            handleAccordionChange("sendWebhook");
                          }}
                        >
                          <Flex w={"100%"} justify={"space-between"}>
                            <Flex gap={"10px"} alignItems={"center"}>
                              <AccordionIcon visibility={"hidden"} />
                              <Flex flexDir={"column"}>
                                <Flex
                                  fontWeight={700}
                                  as="span"
                                  flex="1"
                                  alignItems={"center"}
                                  gap={"4px"}
                                >
                                  Send Webhook
                                  <Tooltip
                                    hasArrow
                                    placement="top"
                                    maxW={"none"}
                                    label={
                                      <Box whiteSpace="nowrap">
                                        Once this step is completed, we’ll send
                                        a request to the base URL you set in the
                                        developer menu.
                                      </Box>
                                    }
                                  >
                                    <Flex
                                      _hover={{ color: "black" }}
                                      color={"#848484"}
                                      fontSize={"20px"}
                                    >
                                      <IoMdInformationCircleOutline />
                                    </Flex>
                                  </Tooltip>
                                </Flex>
                                <Flex
                                  textAlign={"left"}
                                  fontSize={"14px"}
                                  color={"#848484"}
                                  justifyContent={"space-between"}
                                >
                                  <Flex>
                                    When this step is completed, we will send an
                                    API request to your server to inform you.
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Flex>
                            <Flex>
                              <Flex pointerEvents={"none"}>
                                <Checkbox
                                  isChecked={editStepDrawerFormik.values?.sendWebhook}
                                ></Checkbox>
                              </Flex>
                            </Flex>
                          </Flex>
                        </AccordionButton>
                      </Flex>
                    </AccordionItem>
                  ) : (
                    ""
                  )} */}
                        </Accordion>
                      </Flex>
                    </Flex>
                  </Flex>
                ) : selectedEditStepTab === "assignment" ? (
                  <StepDetailsDrawerAssignment
                    selectedEditStep={selectedEditStep}
                    editStepDrawerFormik={editStepDrawerFormik}
                    machineSelection={machineSelection}
                    memberSelection={memberSelection}
                    lockSelection={lockSelection}
                    index={stepIndex}
                    handleCallToAction={handleCallToAction}
                  />
                ) : (
                  ""
                )}
              </Flex>
            </Flex>
            {/* Footer */}
            <Flex
              borderTop={"1px solid #bababa"}
              py={"20px"}
              px={"20px"}
              bg={"white"}
              // position={"absolute"}
              gap={"20px"}
              justify={"end"}
              // bottom={0}
              // left={0}
              width={"100%"}
            >
              <Button
                border={"1px solid #dc143c"}
                color={"#dc143c"}
                bg={"white"}
                onClick={() => {
                  unselectAll();
                  editStepDisclosure.onClose();
                }}
              >
                Close
              </Button>
              <Button onClick={handleSubmit} color={"white"} bg={"#dc143c"}>
                Save
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Slide>
      <EditStepQuestionsModal
        editStepQuestionsDisclosure={editStepQuestionsDisclosure}
        selectedEditQuestions={selectedEditQuestions}
        editStepDrawerFormik={editStepDrawerFormik}
        stepType={"workOrderSteps"}
      />
      <ConfirmationModal
        header={saveChangesConfirmationLabel.header}
        header2={saveChangesConfirmationLabel.header2}
        body={saveChangesConfirmationLabel.body}
        confirmationLabel={saveChangesConfirmationLabel.confirmationLabel}
        confirmationDisclosure={saveChangesConfirmationDisclosure}
        confirmationFunction={() => saveChanges(false)}
      />
    </>
  );
}
