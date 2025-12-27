import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useReactFlow } from "@xyflow/react";
import { useFormik } from "formik";
import { memo, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { FaPlus } from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";
import { GoPencil } from "react-icons/go";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoAccessibility } from "react-icons/io5";
import { VscEmptyWindow } from "react-icons/vsc";
import { v4 as uuid } from "uuid";
import * as Yup from "yup";
import defaultNodeSettings from "../../constants/defaultNodeSettings";
import computeNodeOrder from "../../utils/computeNodeOrder";
import dynamicPropsComparator from "../../utils/dynamicPropsComparator";
import getConditionalEdge from "../../utils/getConditionalEdge";
import getConditionalNode from "../../utils/getConditionalNode";
import getConditionalStepValue from "../../utils/getConditionalStepValue";
import getConnectedNodes from "../../utils/getConnectedNodes";
import setAllFieldsTouched from "../../utils/setAllFieldsTouched";
import StepModalFormDraggable from "./StepModalFormDraggable";

function AddStepModalMemo({
  setColumns,
  nextAlphabeticalSequence,
  formikSetValues,
  variant,
  steps,
  flowWrapperRef,
}) {
  const { screenToFlowPosition, getNodes, getEdges, setNodes, setEdges } =
    useReactFlow();
  const formikErrorRefs = useRef([]);
  const modalUnsavedChanges = useDisclosure();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const formik = useFormik({
    initialValues: {
      name: "",
      assigned_to: [],
      form: false,
      notify: false,
      notify_to: [],
      machine: false,
      requireVerifyMachine: false,
      multiLockAccess: false,
      isMainMultiLockAccess: false,
      condition: false,
      formQuestions: [
        {
          id: uuid(),
          title: "",
          required: true,
          type: { title: "Text", format: "Short Answer" },
        },
      ],
      notificationMessage: "",
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
            otherwise: () => Yup.string().trim().nullable(), // Make it optional if notify is not true
          }),
        condition_question: Yup.string()
          .trim()
          .when("condition", {
            is: true,
            then: () =>
              Yup.string().trim().required("Condition Question is required"),
            otherwise: () => Yup.string().trim().nullable(), // Make it optional if notify is not true
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
            ),
          otherwise: () => Yup.array().nullable(), // Make it optional if forms is not true
        }),

        formQuestionsSize: Yup.number().when("formQuestions", {
          is: (data) => {
            return data?.length < 1;
          },
          then: (schema) =>
            schema.required("At least one question is required"),
        }),
      })
      .test("atleastOne", "null", (obj) => {
        if (
          obj.form ||
          obj.notify ||
          obj.machine ||
          obj.multiLockAccess ||
          obj.condition
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
  const [addStepInput, setAddStepInput] = useState(createInitialStepInput());

  function createInitialStepInput(name = "", linkedStepIndex = "") {
    const initialStepInput = {
      // switch id to UID
      UID: uuid(),
      name: name + linkedStepIndex,
      description: "",
      form: false,
      assigned_to: [],
      notify: false,
      notificationMessage: "",
      notify_to: [],
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
      condition: false,
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

  function onDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    const copiedItems = [...formik.values.formQuestions];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);
    formik.setValues((prevState) => ({
      ...prevState,
      formQuestions: copiedItems,
    }));
  }

  const handleKeyUp = (event) => {
    if (event.key === " ") {
      event.preventDefault();
    }
  };

  function inputHandler(event) {
    const { id, value } = event.target;
    formik.setFieldValue(id, value);
  }

  function handleAccordionChange(type) {
    switch (type) {
      case "form":
        formik.setFieldValue("form", !formik.values.form);
        break;
      case "notify":
        formik.setFieldValue("notify", !formik.values.notify);
        break;
      case "condition":
        formik.setFieldValue("condition", !formik.values.condition);
        break;
      case "machine":
        formik.setFieldValue("machine", !formik.values.machine);
        break;
      case "multiLockAccess":
        formik.setValues((prevState) => ({
          ...prevState,
          multiLockAccess: !prevState.multiLockAccess,
          isMainMultiLockAccess: !prevState.multiLockAccess,
          multiLockAccessStepIndex: !prevState.multiLockAccess ? 0 : null,
          multiLockAccessGroup: !prevState.multiLockAccess
            ? {
                name: nextAlphabeticalSequence,
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

      default:
        return;
    }
  }

  async function addNewQuestion() {
    const newQuestion = {
      id: uuid(),
      title: "",
      required: true,
      type: {
        title: "Text",
        format: "Short Answer",
      },
    };
    const updatedItems = [...formik.values.formQuestions, newQuestion];

    await formik.setFieldValue("formQuestions", updatedItems);
    formik.validateForm();
  }

  function saveChanges() {
    const linkedSteps = [];
    const count = formik.values?.multiLockAccessGroup?.totalStep;

    const conditionalNodeUuid = [uuid(), uuid()];
    const conditionalDataUuid = [uuid(), uuid()];

    const linkedStepNodeUuid = Array.from({ length: count }, () => uuid());
    const linkedStepDataUuid = Array.from({ length: count }, () => uuid());
    for (let i = 0; i < count; i++) {
      linkedSteps.push(
        createInitialStepInput(
          formik.values?.multiLockAccessGroup?.name,
          i + 1,
          linkedStepDataUuid[i]
        )
      );
    }

    const rect = flowWrapperRef.current.getBoundingClientRect();
    const containerCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const center = screenToFlowPosition(containerCenter);

    formikSetValues((prevState) => {
      return {
        ...prevState,
        [variant === "template" ? "templateSteps" : "workOrderSteps"]: [
          ...(variant === "template"
            ? prevState.templateSteps
            : prevState.workOrderSteps),
          formik.values,
          ...(formik.values.condition
            ? // switch id to UID
              getConditionalStepValue(formik.values.UID, conditionalDataUuid)
            : []),
          ...linkedSteps,
        ],
      };
    });
    const newNodeUuid = uuid();
    const newLinkedNodeUuid = linkedSteps.map(() => uuid());
    const nodes = getNodes();
    const startNode = nodes.find((n) => n.data.isStart);
    const orderedNodes = startNode
      ? getConnectedNodes(startNode, getEdges())
      : [];
    const lastOrderedNode = nodes.find(
      (nd) => nd.id === Array.from(orderedNodes).pop()
    );

    // Calculate Edge value first
    const newMainStepEdge =
      lastOrderedNode && !lastOrderedNode.data.condition_value
        ? [
            {
              id: `edge-${lastOrderedNode.id}-${newNodeUuid}`,
              source: lastOrderedNode.id,
              target: newNodeUuid,
              type: defaultNodeSettings.edgeType,
              markerEnd: defaultNodeSettings.defaultMarkerEnd,
            },
          ]
        : [];
    const linkedEdge = linkedSteps.map((linkStep, linkStepIndex) => ({
      id: `edge-${
        linkStepIndex ? newLinkedNodeUuid[linkStepIndex - 1] : newNodeUuid
      }-${newLinkedNodeUuid[linkStepIndex]}`,
      source: linkStepIndex
        ? newLinkedNodeUuid[linkStepIndex - 1]
        : newNodeUuid,
      target: newLinkedNodeUuid[linkStepIndex],
      sourceHandle: "normal",
      type: defaultNodeSettings.edgeType,
      markerEnd: defaultNodeSettings.defaultMarkerEnd,
    }));

    const updatedEdge = [
      ...getEdges(),
      ...newMainStepEdge,
      ...(formik.values.condition ? [] : linkedEdge),
      ...(formik.values.condition
        ? getConditionalEdge(conditionalNodeUuid, newNodeUuid)
        : []),
    ];
    // Calculate Edge value first

    // Calculate Node value after edge because edge is needed to determine node order
    let updatedNodes = [
      ...getNodes(),
      {
        id: newNodeUuid,
        type: "step",
        position: {
          x: lastOrderedNode?.position?.x || center.x,
          y:
            lastOrderedNode?.position?.y + defaultNodeSettings.newStepGap ||
            center.y,
        },
        data: {
          ...formik.values,
          label: formik.values.name,
          isStart: getNodes().length ? false : true,
          isEnd: linkedSteps.length ? false : true,
        },
      },
      ...(formik.values.condition
        ? getConditionalNode(
            conditionalNodeUuid,
            {
              x: lastOrderedNode?.position?.x || center.x,
              y:
                lastOrderedNode?.position?.y + defaultNodeSettings.newStepGap ||
                center.y,
            },
            // newNodeUuid,
            // switch id to UID
            formik.values.UID,
            conditionalDataUuid
          )
        : []),
      ...linkedSteps.map((linkStep, linkStepIndex) => ({
        id: newLinkedNodeUuid[linkStepIndex],
        type: "step",
        position: {
          x: lastOrderedNode?.position?.x || center.x,
          y:
            (formik.values.condition ? defaultNodeSettings.newStepGap : 0) +
            (lastOrderedNode?.position?.y + defaultNodeSettings.newStepGap ||
              center.y) +
            defaultNodeSettings.newStepGap * (linkStepIndex + 1),
        },
        data: {
          ...linkStep,
          label: linkStep.name,
          isEnd: linkedSteps.length === linkStepIndex + 1,
          // order: 1,
        },
      })),
    ];

    updatedNodes = computeNodeOrder(
      updatedNodes,
      updatedEdge,
      getNodes().length === 0 ? newNodeUuid : updatedNodes[0].id
    );
    // Calculate Node value after edge because edge is needed to determine node order

    setNodes(updatedNodes);
    setEdges(updatedEdge);
    closeModal();
  }
  function checkUnsavedChanges() {
    //UNFINISHED AND UNSURE IF FEATURE IS NEEDED
    if (false) {
      modalUnsavedChanges.onOpen();
    } else {
      closeModal();
    }
  }

  function closeModal() {
    modalUnsavedChanges.onClose();
    formik.resetForm();
    onClose();
  }
  async function handleSubmit(e) {
    e.preventDefault();
    formik.setTouched(setAllFieldsTouched(formik.values));
    const errors = await formik.validateForm();
    const errorPaths = getFieldPaths(errors);

    if (errorPaths.length > 0) {
      scrollToFirstError(errorPaths);
    } else {
      formik.handleSubmit();
    }
  }
  function handleSlider(value, type) {
    formik.setValues((prevState) => {
      return {
        ...prevState,
        multiLockAccessGroup: {
          ...prevState.multiLockAccessGroup,
          [type]: value,
        },
      };
    });
  }
  // Hide preassign feature
  // function handlePreAssignSwitch() {
  //   setAddStepInput((prevState) => {
  //     return {
  //       ...prevState,
  //       multiLockAccessGroup: {
  //         ...prevState.multiLockAccessGroup,
  //         isPreAssigned: !prevState.multiLockAccessGroup.isPreAssigned,
  //         multiLockAccessGroupItems: !prevState.multiLockAccessGroup
  //           .isPreAssigned
  //           ? [
  //               {
  //                 name: "",
  //                 id: "",
  //                 label: "",
  //                 value: "",
  //               },
  //             ]
  //           : [],
  //       },
  //     };
  //   });
  // }
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
          formik.setValues((prevState) => {
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
        // ✅ Scroll the field into view
        ref.scrollIntoView({ behavior: "auto", block: "center" });
        break;
      }
    }
  }
  useEffect(() => {
    formik.setValues(createInitialStepInput());
  }, [nextAlphabeticalSequence]);
  return (
    <Flex justify={"center"}>
      <Button
        h={"32px"}
        fontSize={"14px"}
        _hover={{ bg: "#dc143c", color: "white" }}
        bg={"white"}
        border={"2px dashed #dc143c"}
        color={"#dc143c"}
        onClick={onOpen}
      >
        <Flex alignItems={"center"} gap={"5px"}>
          <Flex>
            <FaPlus />
          </Flex>
          <Flex>Add Step</Flex>
        </Flex>
      </Button>
      <Modal isOpen={isOpen} onClose={checkUnsavedChanges} isCentered>
        <ModalOverlay />
        <ModalContent
          bg={"white"}
          maxW="60%"
          maxH={"90vh"}
          style={{ overflow: "auto" }}
          // overflow={"auto"}
        >
          <ModalHeader
            py={"5px"}
            px={"16px"}
            display={"flex"}
            flexDir={"column"}
          >
            <Flex color={"crimson"}>Add Step</Flex>
            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>Check the components you want to add</Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex flexDir={"column"}>
                <Flex
                  justify={"space-between"}
                  px={"10px"}
                  alignItems={"center"}
                  fontWeight={700}
                  fontSize={"20px"}
                >
                  <Flex>Step Details</Flex>
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
                  border={
                    formik.touched.name && formik.errors.name
                      ? "1px solid crimson"
                      : "1px solid #e2e8f0"
                  }
                  onChange={inputHandler}
                  onBlur={formik.handleBlur}
                  id="name"
                  value={formik.values.name}
                  px={"20px"}
                  placeholder="name"
                ></Input>
                {formik.touched.name && formik.errors.name && (
                  <Flex
                    ref={(el) => (formikErrorRefs.current[`name`] = el)}
                    color="crimson"
                    fontSize="14px"
                    gap="5px"
                    alignItems="center"
                  >
                    <FaTriangleExclamation />
                    <Flex>{formik.errors.name}</Flex>
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
                  onChange={inputHandler}
                  id="description"
                  value={formik.values.description}
                  px={"20px"}
                  placeholder="Description"
                ></Textarea>
              </Flex>

              <Flex px={"10px"} flexDir={"column"}>
                <Flex
                  justify={"space-between"}
                  alignItems={"center"}
                  fontWeight={700}
                  fontSize={"20px"}
                >
                  <Flex>
                    Actions&nbsp;
                    <Box as="span" color={"#dc143c"}>
                      *
                    </Box>
                  </Flex>
                  <Flex>
                    <IoAccessibility />
                  </Flex>
                </Flex>
                {formik.touched.actions && formik.errors.actions ? (
                  <Flex
                    ref={(el) => (formikErrorRefs.current[`actions`] = el)}
                    bg={"#FDE2E2"}
                    px={"10px"}
                    alignItems={"center"}
                    gap={"5px"}
                    py={"5px"}
                    fontSize={"14px"}
                    color={"crimson"}
                  >
                    <FaTriangleExclamation />
                    {formik.errors.actions}
                  </Flex>
                ) : (
                  ""
                )}
              </Flex>
              <Flex gap={"15px"} flexDir={"column"}>
                <Accordion
                  onKeyUp={handleKeyUp}
                  index={[
                    formik.values.form ? 0 : null,
                    formik.values.machine ? 1 : null,
                    formik.values.multiLockAccess ? 2 : null,
                    formik.values.notify ? 3 : null,
                    formik.values.condition ? 4 : null,
                  ]}
                  allowMultiple
                  gap={"0px"}
                >
                  <AccordionItem>
                    <Flex flexDir={"column"}>
                      <AccordionButton>
                        <Flex
                          onClick={() => {
                            handleAccordionChange("form");
                          }}
                          w={"100%"}
                          justify={"space-between"}
                        >
                          <Flex gap={"10px"} alignItems={"center"}>
                            <AccordionIcon />
                            <Flex flexDir={"column"}>
                              <Box
                                fontWeight={700}
                                as="span"
                                flex="1"
                                textAlign="left"
                              >
                                Forms
                              </Box>
                              <Flex
                                textAlign={"center"}
                                fontSize={"14px"}
                                color={"#848484"}
                                justifyContent={"space-between"}
                              >
                                <Flex>
                                  Provide a form for members to fill out before
                                  they finish this step
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
                                isChecked={formik.values.form}
                              ></Checkbox>
                            </Flex>
                          </Flex>
                        </Flex>
                      </AccordionButton>
                    </Flex>
                    <AccordionPanel pb={4}>
                      <Flex gap={"20px"} flexDir={"column"}>
                        <Flex flexDir={"column"} gap={"10px"}>
                          <Flex flexDir={"column"}>
                            <Flex fontSize={"14px"} color={"#bababa"}>
                              Questions can be dragged and dropped to adjust
                              their order.
                            </Flex>
                            {formik.touched.formQuestionsSize &&
                              formik.errors.formQuestionsSize && (
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
                                  <Flex>{formik.errors.formQuestionsSize}</Flex>
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
                                formik.touched.formQuestionsSize &&
                                formik.errors.formQuestionsSize
                                  ? "#fde2e2"
                                  : "#F8F9FA"
                              }
                              w={"100%"}
                              color={
                                formik.touched.formQuestionsSize &&
                                formik.errors.formQuestionsSize
                                  ? "#dc143c"
                                  : "#848484"
                              }
                              fontSize={"14px"}
                              shadow={
                                formik.touched.formQuestionsSize &&
                                formik.errors.formQuestionsSize
                                  ? "0px 0px 3px rgba(220,20,60,1)"
                                  : "0px 0px 3px rgba(50,50,93,0.5)"
                              }
                            >
                              <Flex
                                borderRight={"#E2E8F0 1px solid"}
                                px={"10px"}
                                py={"5px"}
                                w={"50%"}
                              >
                                Question
                              </Flex>

                              <Flex
                                borderRight={"#E2E8F0 1px solid"}
                                px={"10px"}
                                py={"5px"}
                                w={"25%"}
                              >
                                Type of response
                              </Flex>
                              <Flex px={"10px"} py={"5px"} w={"25%"}>
                                Manage
                              </Flex>
                            </Flex>
                            <DragDropContext
                              onDragEnd={(result) => onDragEnd(result)}
                            >
                              <Droppable
                                droppableId={"question"}
                                key={"question"}
                              >
                                {(provided, snapshot) => {
                                  return (
                                    <Flex
                                      flexDir={"column"}
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      style={{
                                        width: "100%",
                                        background: snapshot.isDraggingOver
                                          ? "#ffb0b0"
                                          : "",
                                      }}
                                    >
                                      {formik.values.formQuestions.length ===
                                      0 ? (
                                        <Flex
                                          justifyContent={"center"}
                                          flexDir={"column"}
                                          p={"20px"}
                                          bg={"#f8f9fa"}
                                          border={
                                            formik.touched.formQuestionsSize &&
                                            formik.errors.formQuestionsSize
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
                                          <Flex flexDir={"column"} gap={"5px"}>
                                            <Flex
                                              justify={"center"}
                                              fontWeight={700}
                                              fontSize={"20px"}
                                            >
                                              Form Questions is Empty!
                                            </Flex>
                                            <Flex justify={"center"}>
                                              Create questions to gather the
                                              information needed for this step.
                                            </Flex>
                                          </Flex>
                                        </Flex>
                                      ) : (
                                        formik.values.formQuestions.map(
                                          (val, index) => {
                                            return (
                                              <StepModalFormDraggable
                                                formikErrorRefs={
                                                  formikErrorRefs
                                                }
                                                id={val.id}
                                                title={val.title}
                                                required={val.required}
                                                accordionOpen={
                                                  val?.accordionOpen
                                                }
                                                type={val.type}
                                                index={index}
                                                formik={formik}
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
                              onClick={addNewQuestion}
                              border={"dashed 2px #dc143c"}
                              p={0}
                              h={"auto"}
                            >
                              <Flex
                                py={"6px"}
                                px={"10px"}
                                bg={"white"}
                                alignItems={"center"}
                                justifyContent={"space-between"}
                              >
                                <Flex gap={"10px"} alignItems={"center"}>
                                  <Flex color={"crimson"} fontWeight={700}>
                                    <FaPlus />
                                  </Flex>
                                  <Flex color={"crimson"} fontWeight={"700"}>
                                    Add Question
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Button>
                          </Flex>
                        </Flex>
                      </Flex>
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem>
                    <Flex flexDir={"column"}>
                      <AccordionButton
                        onClick={() => {
                          handleAccordionChange("machine");
                        }}
                      >
                        <Flex w={"100%"} justify={"space-between"}>
                          <Flex gap={"10px"} alignItems={"center"}>
                            <AccordionIcon visibility={"hidden"} />
                            <Flex flexDir={"column"}>
                              <Box
                                fontWeight={700}
                                as="span"
                                flex="1"
                                textAlign="left"
                              >
                                Machine
                              </Box>
                              <Flex
                                textAlign={"center"}
                                fontSize={"14px"}
                                color={"#848484"}
                                justifyContent={"space-between"}
                              >
                                <Flex>
                                  Include machines in this step for members to
                                  finish
                                </Flex>
                                <Flex></Flex>
                              </Flex>
                            </Flex>
                          </Flex>
                          <Flex>
                            <Flex pointerEvents={"none"}>
                              <Checkbox
                                isChecked={formik.values.machine}
                              ></Checkbox>
                            </Flex>
                          </Flex>
                        </Flex>
                      </AccordionButton>
                    </Flex>
                  </AccordionItem>
                  <AccordionItem>
                    <Flex flexDir={"column"}>
                      <AccordionButton
                        onClick={() => {
                          handleAccordionChange("multiLockAccess");
                        }}
                      >
                        <Flex w={"100%"} justify={"space-between"}>
                          <Flex gap={"10px"} alignItems={"center"}>
                            <AccordionIcon />
                            <Flex flexDir={"column"}>
                              <Box
                                fontWeight={700}
                                as="span"
                                flex="1"
                                textAlign="left"
                              >
                                Lock Access
                              </Box>
                              <Flex
                                textAlign={"center"}
                                fontSize={"14px"}
                                color={"#848484"}
                                justifyContent={"space-between"}
                              >
                                <Flex>
                                  Allow giving lock access to members for
                                  completing this step
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
                                isChecked={formik.values.multiLockAccess}
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
                            <Flex w={"100%"} gap={"5px"} flexDir={"column"}>
                              <Flex flexDir={"column"}>
                                <Flex alignItems={"center"} justify={"left"}>
                                  <Box
                                    fontWeight={700}
                                    as="span"
                                    flex="1"
                                    textAlign="left"
                                  >
                                    Linked Step Count&nbsp;
                                    <Box as="span" color={"#dc143c"}>
                                      *&nbsp;
                                    </Box>
                                  </Box>
                                  <Flex>
                                    <Tooltip
                                      hasArrow
                                      placement="top"
                                      maxW={"none"}
                                      label={
                                        <Box whiteSpace="nowrap">
                                          The number of steps that will share
                                          the same lock(s) chosen or preassigned
                                          by the assignee.
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
                                </Flex>
                                <Flex fontSize={"14px"} color={"#848484"}>
                                  Number of steps to create and link under this
                                  lock access.
                                </Flex>
                              </Flex>
                              <Flex pt={"24px"} px={"10px"}>
                                <Slider
                                  // mx={"200px"}
                                  onChange={(val) => {
                                    handleSlider(val, "totalStep");
                                  }}
                                  value={
                                    formik.values?.multiLockAccessGroup
                                      ?.totalStep
                                  }
                                  defaultValue={0}
                                  min={0}
                                  max={10}
                                  step={1}
                                >
                                  <SliderMark
                                    fontSize={"14px"}
                                    value={
                                      formik.values?.multiLockAccessGroup
                                        ?.totalStep
                                    }
                                    textAlign="center"
                                    bg="#dc143c"
                                    color="white"
                                    // width={"200px"}
                                    mt="-10"
                                    ml="-4"
                                    w="32px"
                                  >
                                    {
                                      formik.values?.multiLockAccessGroup
                                        ?.totalStep
                                    }
                                  </SliderMark>
                                  <SliderTrack bg="red.100">
                                    <SliderFilledTrack bg="#dc143c" />
                                  </SliderTrack>
                                  <SliderThumb boxSize={6} />
                                </Slider>
                              </Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                      </AccordionPanel>
                    </Flex>
                  </AccordionItem>
                  <AccordionItem>
                    <Flex flexDir={"column"}>
                      <AccordionButton
                        onClick={() => {
                          handleAccordionChange("notify");
                        }}
                      >
                        <Flex w={"100%"} justify={"space-between"}>
                          <Flex gap={"10px"} alignItems={"center"}>
                            <AccordionIcon />
                            <Flex flexDir={"column"}>
                              <Box
                                fontWeight={700}
                                as="span"
                                flex="1"
                                textAlign="left"
                              >
                                Notify
                              </Box>
                              <Flex
                                textAlign={"center"}
                                fontSize={"14px"}
                                color={"#848484"}
                                justifyContent={"space-between"}
                              >
                                <Flex>
                                  {variant === "workflow"
                                    ? "This step allows sending notifications to other members when this step is finished"
                                    : "Allow sending notifications to other members when this step is finished"}
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
                                isChecked={formik.values.notify}
                              ></Checkbox>
                            </Flex>
                          </Flex>
                        </Flex>
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Flex flexDir={"column"} gap={"20px"}>
                          <Flex fontSize={"14px"} flexDir={"column"} w={"100%"}>
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
                                border={
                                  formik.touched.notificationMessage &&
                                  formik.errors.notificationMessage
                                    ? "1px solid crimson"
                                    : "1px solid #e2e8f0"
                                }
                                value={formik.values.notificationMessage}
                                id="notificationMessage"
                                onBlur={formik.handleBlur}
                                onChange={inputHandler}
                                placeholder='Step 3 on "Fixing AC in Room 317" is Finished '
                              ></Input>
                              {formik.touched.notificationMessage &&
                                formik.errors.notificationMessage && (
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
                                      {formik.errors.notificationMessage}
                                    </Flex>
                                  </Flex>
                                )}
                            </Flex>
                          </Flex>
                        </Flex>
                      </AccordionPanel>
                    </Flex>
                  </AccordionItem>
                  <AccordionItem>
                    <Flex flexDir={"column"}>
                      <AccordionButton
                        onClick={() => {
                          handleAccordionChange("condition");
                        }}
                      >
                        <Flex w={"100%"} justify={"space-between"}>
                          <Flex gap={"10px"} alignItems={"center"}>
                            <AccordionIcon />
                            <Flex flexDir={"column"}>
                              <Box
                                fontWeight={700}
                                as="span"
                                flex="1"
                                textAlign="left"
                              >
                                Condition
                              </Box>
                              <Flex
                                textAlign={"center"}
                                fontSize={"14px"}
                                color={"#848484"}
                                justifyContent={"space-between"}
                              >
                                <Flex>
                                  Mark this step as conditional to branch the
                                  workflow based on an answer.
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
                                isChecked={formik.values.condition}
                              ></Checkbox>
                            </Flex>
                          </Flex>
                        </Flex>
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Flex flexDir={"column"} gap={"20px"}>
                          <Flex fontSize={"14px"} flexDir={"column"} w={"100%"}>
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
                                    Note : Assignee can only answer the question
                                    with Yes or No
                                  </Flex>
                                  <Flex></Flex>
                                </Flex>
                              </Flex>
                              <Input
                                border={
                                  formik.touched.condition_question &&
                                  formik.errors.condition_question
                                    ? "1px solid crimson"
                                    : "1px solid #e2e8f0"
                                }
                                value={formik.values.condition_question}
                                id="condition_question"
                                onBlur={formik.handleBlur}
                                onChange={inputHandler}
                                placeholder="Does the machine require cleaning maintenance?"
                              ></Input>
                              {formik.touched.condition_question &&
                                formik.errors.condition_question && (
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
                                      {formik.errors.condition_question}
                                    </Flex>
                                  </Flex>
                                )}
                            </Flex>
                          </Flex>
                        </Flex>
                      </AccordionPanel>
                    </Flex>
                  </AccordionItem>
                </Accordion>
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter w={"100%"} justifyContent={"center"}>
            <Flex w={"100%"} alignItems={"center"} justifyContent={"end"}>
              <Flex>
                <Button
                  _hover={{ background: "#b80d2f", color: "white" }}
                  width={"95px"}
                  color={"#dc143c"}
                  background={"transparent"}
                  border={"1px solid #dc143c"}
                  mr={3}
                  onClick={checkUnsavedChanges}
                >
                  Cancel
                </Button>

                <Button
                  _hover={{ background: "#ff1443" }}
                  width={"95px"}
                  border={"1px solid #dc143c"}
                  color={"white"}
                  bgColor={"#dc143c"}
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
const AddStepModal = memo(AddStepModalMemo, dynamicPropsComparator);

export default AddStepModal;
