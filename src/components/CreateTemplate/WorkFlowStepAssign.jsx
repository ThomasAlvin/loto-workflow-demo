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
  Flex,
  Input,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
} from "@chakra-ui/react";
import ReactSelect, { components } from "react-select";
import { FaCogs, FaUserAlt } from "react-icons/fa";
import { memo, useCallback, useEffect, useState } from "react";
import { FaPlus, FaRegBell, FaTriangleExclamation } from "react-icons/fa6";
import { TiClipboard } from "react-icons/ti";
import { MdLockOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AssignMachine from "../CreateWorkOrder/AssignMachine";
import ReactSelectMemberSelection from "../ReactSelectMemberSelection";
import WorkFlowStepBadges from "./WorkFlowStepBadges";
import { FieldArray, FormikProvider } from "formik";
import SelectLockAssignFormikProvider from "../CreateEditWorkOrderTemplate/SelectLockAssignFormikProvider";
import { IoMdCheckmark, IoMdInformationCircleOutline } from "react-icons/io";
import { debounce } from "lodash";
import InspectionQuestionAccordion from "../InspectionQuestionAccordion";
import ReactSelectMemberMultiValue from "../ReactSelectMemberMultiValue";
import DynamicPropsComparator from "../../utils/DynamicPropsComparator";
import { TbLineScan } from "react-icons/tb";

function WorkFlowStepAssign({
  isHighlightedIndex,
  mainRequireLockImage,
  workOrderFormikSetValues,
  formik,
  machineSelection,
  memberSelection,
  lockSelection,
  index,
  val,
  openByDefault,
  assignRefs,
  handleCallToAction,
}) {
  console.log("Step " + (index + 1) + " is Rerendered");

  const isMultiAssign = import.meta.env.VITE_MULTI_ASSIGN === "true";
  const toast = useToast();
  const [openAccordions, setOpenAccordions] = useState(
    val.selectedMachines?.map((val, index) => index),
  );

  const hasError =
    (formik.errors.workOrderSteps?.[index]?.work_order_locks &&
      formik.touched.workOrderSteps?.[index]?.work_order_locks &&
      typeof formik.errors.workOrderSteps?.[index]?.work_order_locks ===
        "string") ||
    formik.errors.workOrderSteps?.[index]?.work_order_locks?.some(
      (machine, lockIndex) =>
        formik.touched.workOrderSteps?.[index]?.work_order_locks?.[lockIndex] &&
        formik.errors.workOrderSteps?.[index]?.work_order_locks?.[lockIndex],
    ) ||
    (formik.errors.workOrderSteps?.[index]?.multiLockAccessGroup
      ?.multiLockAccessGroupItems &&
      formik.touched.workOrderSteps?.[index]?.multiLockAccessGroup
        ?.multiLockAccessGroupItems &&
      typeof formik.errors.workOrderSteps?.[index]?.multiLockAccessGroup
        ?.multiLockAccessGroupItems === "string") ||
    (Array.isArray(
      formik.errors.workOrderSteps?.[index]?.multiLockAccessGroup
        ?.multiLockAccessGroupItems,
    ) &&
      formik.errors.workOrderSteps[
        index
      ].multiLockAccessGroup.multiLockAccessGroupItems.some(
        (machine, lockIndex) =>
          formik.touched.workOrderSteps?.[index]?.multiLockAccessGroup
            ?.multiLockAccessGroupItems?.[lockIndex] &&
          formik.errors.workOrderSteps?.[index]?.multiLockAccessGroup
            ?.multiLockAccessGroupItems?.[lockIndex],
      )) ||
    (formik.errors.workOrderSteps?.[index]?.assigned_to &&
      formik.touched.workOrderSteps?.[index]?.assigned_to) ||
    (formik.errors.workOrderSteps?.[index]?.titleTriggerAPI &&
      formik.touched.workOrderSteps?.[index]?.titleTriggerAPI) ||
    (formik.errors.workOrderSteps?.[index]?.notify_to &&
      formik.touched.workOrderSteps?.[index]?.notify_to) ||
    (formik.errors.workOrderSteps?.[index]?.selectedMachines &&
      formik.touched.workOrderSteps?.[index]?.selectedMachines &&
      typeof formik.errors.workOrderSteps?.[index]?.selectedMachines ===
        "string") ||
    (Array.isArray(formik.errors.workOrderSteps?.[index]?.selectedMachines) &&
      formik.errors.workOrderSteps?.[index]?.selectedMachines.some(
        (machine, machineIndex) =>
          formik.touched.workOrderSteps?.[index]?.selectedMachines?.[
            machineIndex
          ]?.selectedInspectionForms &&
          formik.errors.workOrderSteps?.[index]?.selectedMachines?.[
            machineIndex
          ]?.selectedInspectionForms,
      ));

  const filteredLockSelection = lockSelection.filter(
    (lock) =>
      !val?.multiLockAccessGroup?.multiLockAccessGroupItems
        ?.map((lock) => lock.id)
        .includes(lock.id),
  );
  const nav = useNavigate();
  const toggleAccordion = (index) => {
    setOpenAccordions(
      (prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index) // Close accordion if it's already open
          : [...prev, index], // Open accordion if it's closed
    );
  };

  const getCustomReactSelectStyles = (
    variant,
    lockIndex,
    selectedMachineIndex,
  ) => {
    const customReactSelectStyle = {
      control: (provided, state) => ({
        ...provided,
        minHeight: isMultiAssign
          ? variant === "notify" || variant === "assign"
            ? "42px"
            : "40px"
          : "40px",
        borderColor:
          variant === "machine"
            ? formik.errors.workOrderSteps?.[index]?.selectedMachines &&
              formik.touched.workOrderSteps?.[index]?.selectedMachines &&
              typeof formik.errors.workOrderSteps?.[index]?.selectedMachines ===
                "string"
              ? "#dc143c"
              : formik.values.workOrderSteps?.[index]?.selectedMachines?.length
                ? "#bababa"
                : "#039be5"
            : variant === "assign"
              ? (
                  isMultiAssign
                    ? formik.errors.workOrderSteps?.[index]?.assigned_to &&
                      formik.touched.workOrderSteps?.[index]?.assigned_to
                    : formik.errors.workOrderSteps?.[index]?.assigned_to?.id &&
                      formik.touched.workOrderSteps?.[index]?.assigned_to?.id
                )
                ? "#dc143c"
                : (
                      isMultiAssign
                        ? formik.values.workOrderSteps?.[index]?.assigned_to
                            ?.length
                        : formik.values.workOrderSteps?.[index]?.assigned_to?.id
                    )
                  ? "#bababa"
                  : "#039be5"
              : variant === "notify"
                ? (
                    isMultiAssign
                      ? formik.errors.workOrderSteps?.[index]?.notify_to &&
                        formik.touched.workOrderSteps?.[index]?.notify_to
                      : formik.errors.workOrderSteps?.[index]?.notify_to?.id &&
                        formik.touched.workOrderSteps?.[index]?.notify_to?.id
                  )
                  ? "#dc143c"
                  : (
                        isMultiAssign
                          ? formik.values.workOrderSteps?.[index]?.notify_to
                              ?.length
                          : formik.values.workOrderSteps?.[index]?.notify_to?.id
                      )
                    ? "#bababa"
                    : "#039be5"
                : variant === "lock"
                  ? formik.errors.workOrderSteps?.[index]?.work_order_locks?.[
                      lockIndex
                    ]?.id &&
                    formik.touched.workOrderSteps?.[index]?.work_order_locks?.[
                      lockIndex
                    ]?.id
                    ? "#dc143c"
                    : formik.values.workOrderSteps?.[index]?.work_order_locks?.[
                          lockIndex
                        ]?.id
                      ? "#bababa"
                      : "#039be5"
                  : variant === "inspectionForm"
                    ? formik.errors.workOrderSteps?.[index]?.selectedMachines?.[
                        selectedMachineIndex
                      ]?.selectedInspectionForms &&
                      formik.touched.workOrderSteps?.[index]
                        ?.selectedMachines?.[selectedMachineIndex]
                        ?.selectedInspectionForms
                      ? "#dc143c"
                      : formik.values.workOrderSteps?.[index]
                            ?.selectedMachines?.[selectedMachineIndex]
                            ?.selectedInspectionForms.length
                        ? "#bababa"
                        : "#039be5"
                    : "", // Default case
        borderRadius: "0px",
        boxShadow: state.isFocused ? "0 0 3px rgba(3, 154, 229, 0.8)" : "none",
        "&:hover": {
          boxShadow: "0 0 3px rgba(3, 154, 229, 0.8)",
          width: "100%",
        },
      }),
      menuList: (provided) => ({
        ...provided,
        maxHeight: 200, // Ensure the inner menu list also respects the height limit
      }),
    };

    if (variant === "lock") {
      return {
        ...customReactSelectStyle,
        control: (provided, state) => ({
          ...customReactSelectStyle.control(provided, state), // Call base styles
          borderTop: "none", // Remove all borders
          borderLeft: "none", // Remove all borders
          borderRight: "none", // Remove all borders
          borderWidth: "2px",
        }),
      };
    }

    return customReactSelectStyle;
  };

  const inputHandler = debounce((event) => {
    const { value } = event.target;

    workOrderFormikSetValues((prevState) => ({
      ...prevState,
      workOrderSteps: prevState.workOrderSteps.map((val, indexStep) => {
        if (indexStep === index) {
          return {
            ...val,
            titleTriggerAPI: value,
          };
        }
        return val;
      }),
    }));
  }, 300);
  const selectHandler = useCallback((event, type, lockIndex) => {
    if (type === "assign") {
      workOrderFormikSetValues((prevState) => ({
        ...prevState,
        workOrderSteps: prevState.workOrderSteps.map((val, indexStep) => {
          if (indexStep === index) {
            return {
              ...val,
              assigned_to: isMultiAssign ? event || [] : event || { id: "" },
            };
          }
          return val;
        }),
      }));
    } else if (type === "notify") {
      workOrderFormikSetValues((prevState) => ({
        ...prevState,
        workOrderSteps: prevState.workOrderSteps.map((val, indexStep) => {
          if (indexStep === index) {
            return {
              ...val,
              notify_to: isMultiAssign ? event || [] : event || { id: "" },
            };
          }
          return val;
        }),
      }));
    } else if (type === "lock") {
      workOrderFormikSetValues((prevState) => {
        return {
          ...prevState,
          workOrderSteps: prevState.workOrderSteps.map((val, indexStep) => {
            if (indexStep === index) {
              return {
                ...val,
                multiLockAccessGroup: {
                  ...val.multiLockAccessGroup,
                  multiLockAccessGroupItems:
                    val.multiLockAccessGroup.multiLockAccessGroupItems.map(
                      (val2, indexItem) => {
                        if (indexItem === lockIndex) {
                          return {
                            ...val2,
                            id: event?.id || "",
                            value: event?.id || "",
                            label: event?.name || "",
                            name: event?.name || "",
                          };
                        }
                        return val2;
                      },
                    ),
                },
              };
            }
            return val;
          }),
        };
      });
    }
  }, []);
  function machineSelectHandler(event, stepIndex) {
    const tempArr = [];
    event.map((val) => {
      tempArr.push(val);
    });

    workOrderFormikSetValues((prevState) => ({
      ...prevState,
      workOrderSteps: prevState.workOrderSteps.map(
        (workStep, workStepIndex) => {
          if (workStepIndex === stepIndex) {
            return { ...workStep, selectedMachines: tempArr };
          }
          return workStep;
        },
      ),
    }));

    setOpenAccordions((prevState) => {
      if (!prevState.includes(tempArr.length - 1)) {
        return [...prevState, tempArr.length - 1];
      }
      return prevState;
    });
  }
  const lockCheckboxHandler = useCallback((event, lockIndex) => {
    const { checked } = event.target;
    workOrderFormikSetValues((prevState) => ({
      ...prevState,
      workOrderSteps: prevState.workOrderSteps.map((val, indexStep) => {
        if (indexStep === index) {
          // Update only the specified step
          return {
            ...val,
            work_order_locks: val.work_order_locks.map(
              (val2, indexWorkOrderLock) => {
                if (indexWorkOrderLock === lockIndex) {
                  return { ...val2, require_lock_image: checked };
                }
                return val2;
              },
            ),
          };
        }
        return val;
      }),
    }));
  }, []);
  function multiLockAccessCheckboxHandler() {
    workOrderFormikSetValues((prevState) => ({
      ...prevState,
      workOrderSteps: prevState.workOrderSteps.map((workStep) => {
        if (
          workStep?.multiLockAccessGroup?.name ===
            val?.multiLockAccessGroup?.name &&
          workStep?.isMainMultiLockAccess
        ) {
          return {
            ...workStep,
            multiLockAccessGroup: {
              ...workStep.multiLockAccessGroup,
              require_lock_image:
                !workStep.multiLockAccessGroup.require_lock_image,
            },
          };
        }
        return workStep;
      }),
    }));
  }
  function machineCheckboxHandler() {
    workOrderFormikSetValues((prevState) => ({
      ...prevState,
      workOrderSteps: prevState.workOrderSteps.map((val, indexStep) => {
        if (indexStep === index) {
          return {
            ...val,
            requireVerifyMachine: !val.requireVerifyMachine,
          };
        }
        return val;
      }),
    }));
  }
  const isFinished = !formik.errors?.workOrderSteps?.[index];

  // useEffect(() => {
  //   checkAndAddEmptyAssignLock();
  //   formik.validateForm();
  // }, [val]);

  return (
    <Accordion defaultIndex={openByDefault ? [0] : ""} w={"100%"} allowToggle>
      <AccordionItem
        ref={assignRefs}
        shadow={
          hasError
            ? "0px 0px 3px rgba(220, 20, 60,1)"
            : isHighlightedIndex
              ? "0px 0px 3px rgba(0, 145, 207,1)"
              : "0px 0px 3px rgba(50, 50, 93,0.5)"
        }
      >
        <AccordionButton
          // ref={assignRefs}
          p={0}
          _expanded={{
            borderBottom: "1px solid #bababa",
          }}
          bg={isFinished ? "#e1f5d5" : hasError ? "#FFE6E6" : "#ECEFF3"}
        >
          <Flex
            w={"100%"}
            // borderRadius={"5px"}
            py={"8px"}
            px={"12px"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Flex gap={"10px"}>
              <Flex color={"crimson"} fontWeight={700}>
                {index + 1}.
              </Flex>
              <Flex
                textAlign={"start"}
                fontWeight={700}
                color={hasError ? "#dc143c" : "black"}
              >
                {val.name}
              </Flex>{" "}
              {isFinished ? (
                <Flex fontSize={"20px"} color={"#3D9666"}>
                  <IoMdCheckmark />
                </Flex>
              ) : (
                ""
              )}
            </Flex>
            <Flex
              cursor={"pointer"}
              color={"#bababa"}
              _hover={{ color: "black" }}
              gap={"10px"}
              alignItems={"center"}
            >
              <WorkFlowStepBadges val={val} />
              <AccordionIcon />
            </Flex>
          </Flex>
        </AccordionButton>
        <AccordionPanel
          bg={isHighlightedIndex ? "#f8f9fa" : "white"}
          // _hover={{ bg: "#f7f9fa" }}
          pt={"10px"}
          transition={"0.2s ease-in-out"}
          pb={"15px"}
        >
          <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
            <Flex flexDir={"column"}>
              <Flex fontWeight={700} textAlign="left">
                <Flex fontSize={"15px"}>
                  Assign to&nbsp;
                  <Box as="span" color={"#dc143c"}>
                    *
                  </Box>
                </Flex>
              </Flex>
              {/* <Flex
                textAlign={"center"}
                fontSize={"14px"}
                color={"#848484"}
                justifyContent={"space-between"}
              >
                <Flex>Select the members you want to assign this step to</Flex>
              </Flex> */}
              <ReactSelect
                isMulti={isMultiAssign}
                placeholder="Select the members you want to assign"
                menuPortalTarget={document.body}
                onBlur={() => {
                  setTimeout(() => {
                    formik.setFieldTouched(
                      isMultiAssign
                        ? `workOrderSteps[${index}].assigned_to`
                        : `workOrderSteps[${index}].assigned_to.id`,
                      true,
                    );
                    formik.validateForm();
                  }, 0);
                }}
                styles={getCustomReactSelectStyles("assign")}
                isSearchable
                isClearable
                {...(isMultiAssign
                  ? { value: val?.assigned_to }
                  : {
                      value: val?.assigned_to?.id
                        ? {
                            value: val.assigned_to?.id || null,
                            label:
                              val?.assigned_to?.user?.first_name +
                              " " +
                              val?.assigned_to?.user?.last_name,
                          }
                        : "",
                    })}
                onChange={(event) => {
                  selectHandler(event, "assign");
                }}
                options={memberSelection}
                components={{
                  Option: ReactSelectMemberSelection,
                  ...(isMultiAssign && {
                    MultiValue: ReactSelectMemberMultiValue,
                  }),
                }}
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
                    <Flex color={"#848484"}>
                      <Flex>Please&nbsp;</Flex>
                      <Flex
                        color={"#dc143c"}
                        cursor={"pointer"}
                        textDecoration={"underline"}
                        onClick={() => handleCallToAction("/member/create")}
                      >
                        Add a new member
                      </Flex>
                      <Flex>&nbsp;now to get started!</Flex>
                    </Flex>
                  </Flex>
                )}
              />
              {formik.errors.workOrderSteps?.[index]?.assigned_to &&
              formik.touched.workOrderSteps?.[index]?.assigned_to ? (
                <Flex
                  py={"4px"}
                  alignItems={"center"}
                  gap={"5px"}
                  color={"#dc143c"}
                  fontSize={"14px"}
                >
                  <Flex>
                    <FaTriangleExclamation />
                  </Flex>
                  <Flex>
                    {isMultiAssign
                      ? formik.errors.workOrderSteps[index]?.assigned_to
                      : formik.errors.workOrderSteps[index]?.assigned_to?.id}
                  </Flex>
                </Flex>
              ) : (
                ""
              )}
            </Flex>

            {val.form ? (
              <Flex flexDir={"column"} gap={"5px"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Form
                  </Box>
                  {/* <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>
                      Provide a form for members to fill out after they finished
                      this step
                    </Flex>
                  </Flex> */}
                </Flex>
                <Flex w={"100%"}>
                  <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                    <Flex fontSize={"14px"} flexDir={"column"} w={"100%"}>
                      <Flex
                        bg={"#F8F9FA"}
                        w={"100%"}
                        color={"#848484"}
                        fontSize={"14px"}
                        shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
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
                          Setup
                        </Flex>
                      </Flex>
                      {val.formQuestions?.map((val2, index) => {
                        return (
                          <Flex
                            bg={"white"}
                            w={"100%"}
                            color={"#848484"}
                            shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                          >
                            <InspectionQuestionAccordion
                              question={val2.question || val2.title}
                              type={val2.question_type || val2.type.title}
                              required={val2.required || val2.is_required}
                              format={val2?.format || val2?.type?.format}
                              includeDate={
                                val2.include_date || val2?.type?.date
                              }
                              includeTime={
                                val2.include_time || val2?.type?.time
                              }
                              unit={val2?.unit || val2?.type?.unit}
                              options={val2?.options || val2?.type?.options}
                            />
                          </Flex>
                        );
                      })}
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            ) : (
              ""
            )}

            {val.notify ? (
              <>
                <Flex flexDir={"column"}>
                  <Box
                    fontSize={"15px"}
                    fontWeight={700}
                    as="span"
                    flex="1"
                    textAlign="left"
                  >
                    Notify to&nbsp;
                    <Box as="span" color={"#dc143c"}>
                      *
                    </Box>
                  </Box>
                  {/* <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>
                      Select the members you want to notify when this step is
                      finished
                    </Flex>
                  </Flex> */}
                  <ReactSelect
                    isMulti={isMultiAssign}
                    placeholder="Select the members you want to notify for this step"
                    menuPortalTarget={document.body}
                    onBlur={() => {
                      setTimeout(() => {
                        formik.setFieldTouched(
                          isMultiAssign
                            ? `workOrderSteps[${index}].notify_to`
                            : `workOrderSteps[${index}].notify_to.id`,
                          true,
                        );
                        formik.validateForm();
                      }, 0);
                    }}
                    styles={getCustomReactSelectStyles("notify")}
                    isSearchable
                    isClearable
                    {...(isMultiAssign
                      ? { value: val?.notify_to }
                      : {
                          value: val?.notify_to?.id
                            ? {
                                value: val.notify_to?.id || null,
                                label:
                                  val?.notify_to?.user?.first_name +
                                  " " +
                                  val?.notify_to?.user?.last_name,
                              }
                            : "",
                        })}
                    onChange={(event) => {
                      selectHandler(event, "notify");
                    }}
                    options={memberSelection}
                    components={{
                      Option: ReactSelectMemberSelection,
                      ...(isMultiAssign && {
                        MultiValue: ReactSelectMemberMultiValue,
                      }),
                    }}
                    noOptionsMessage={() => (
                      <Flex
                        flexDir={"column"}
                        justify={"center"}
                        alignItems={"center"}
                        py={"30px"}
                      >
                        <Flex fontWeight={700} color={"#dc143c"}>
                          No Members found!
                        </Flex>

                        <Flex fontSize={"14px"} color={"#848484"}>
                          <Flex>Please&nbsp;</Flex>
                          <Flex
                            color={"#dc143c"}
                            cursor={"pointer"}
                            textDecoration={"underline"}
                            onClick={() => handleCallToAction("/member/create")}
                          >
                            Add a new member
                          </Flex>
                          <Flex>&nbsp;now to get started!</Flex>
                        </Flex>
                      </Flex>
                    )}
                  />

                  {formik.errors.workOrderSteps?.[index]?.notify_to &&
                  formik.touched.workOrderSteps?.[index]?.notify_to ? (
                    <Flex
                      py={"4px"}
                      px={"8px"}
                      alignItems={"center"}
                      gap={"5px"}
                      fontSize={"14px"}
                      color={"#dc143c"}
                    >
                      <Flex>
                        <FaTriangleExclamation />
                      </Flex>
                      <Flex>
                        {isMultiAssign
                          ? formik.errors.workOrderSteps[index]?.notify_to
                          : formik.errors.workOrderSteps[index]?.notify_to?.id}
                      </Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex>
                <Flex flexDir={"column"}>
                  <Box
                    fontSize={"15px"}
                    fontWeight={700}
                    as="span"
                    flex="1"
                    textAlign="left"
                  >
                    Notification message
                  </Box>
                  {/* <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>
                      The notification message to the selected members
                    </Flex>
                  </Flex> */}
                  <Input
                    bg={"white"}
                    boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                    _hover={{
                      background: "none", // Prevent background color change
                      borderColor: "none", // Prevent border color change
                    }}
                    pointerEvents={"none"}
                    value={val.notificationMessage}
                  ></Input>
                </Flex>
              </>
            ) : (
              ""
            )}
            {val.machine ? (
              <>
                <Flex flexDir={"column"} gap={"0px"}>
                  <Box
                    fontSize={"15px"}
                    fontWeight={700}
                    as="span"
                    flex="1"
                    textAlign="left"
                  >
                    Assign Machines&nbsp;
                    <Box as="span" color={"#dc143c"}>
                      *
                    </Box>
                  </Box>
                  {/* <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>
                      Assign machines in this step for members to finish
                    </Flex>
                  </Flex> */}
                  <Flex
                    fontSize={"14px"}
                    flexDir={"column"}
                    gap={"16px"}
                    w={"100%"}
                  >
                    <Flex gap={"5px"} flexDir={"column"}>
                      <ReactSelect
                        placeholder="Assign machines for this step "
                        onBlur={() => {
                          setTimeout(() => {
                            formik.validateForm();
                            formik.setFieldTouched(
                              `workOrderSteps[${index}].selectedMachines`,
                              true,
                            );
                          }, 0);
                        }}
                        styles={getCustomReactSelectStyles("machine")}
                        isSearchable
                        isClearable
                        isMulti
                        value={val.selectedMachines}
                        onChange={(event) => {
                          machineSelectHandler(event, index);
                        }}
                        options={machineSelection}
                        noOptionsMessage={() => (
                          <Flex
                            flexDir={"column"}
                            justify={"center"}
                            alignItems={"center"}
                            fontWeight={700}
                            py={"30px"}
                          >
                            <Flex fontSize={"16px"} color={"#dc143c"}>
                              No Machines found!
                            </Flex>
                            <Flex fontWeight={400} color={"#848484"}>
                              <Flex>Please&nbsp;</Flex>
                              <Flex
                                color={"#dc143c"}
                                cursor={"pointer"}
                                textDecoration={"underline"}
                                onClick={() =>
                                  handleCallToAction(
                                    "/equipment-machine/create",
                                  )
                                }
                              >
                                Add a new machine
                              </Flex>
                              <Flex>&nbsp;now to get started!</Flex>
                            </Flex>
                          </Flex>
                        )}
                      />

                      {formik.errors.workOrderSteps?.[index]
                        ?.selectedMachines &&
                      formik.touched.workOrderSteps?.[index]
                        ?.selectedMachines &&
                      typeof formik.errors.workOrderSteps?.[index]
                        ?.selectedMachines === "string" ? (
                        <Flex
                          py={"4px"}
                          px={"8px"}
                          alignItems={"center"}
                          gap={"5px"}
                          color={"#dc143c"}
                          fontSize={"14px"}
                        >
                          <Flex>
                            <FaTriangleExclamation />
                          </Flex>
                          <Flex>
                            {
                              formik.errors.workOrderSteps[index]
                                ?.selectedMachines
                            }
                          </Flex>
                        </Flex>
                      ) : (
                        ""
                      )}
                    </Flex>
                    <Flex cursor={"pointer"} gap={"10px"} w={"fit-content"}>
                      <Checkbox
                        bg={"white"}
                        borderColor={"#039be5"}
                        isChecked={val.requireVerifyMachine}
                        size="lg"
                        onChange={machineCheckboxHandler}
                        defaultChecked
                      ></Checkbox>
                      <Flex
                        onClick={machineCheckboxHandler}
                        color={val.requireVerifyMachine ? "#3182CE" : "black"}
                        alignItems={"center"}
                        gap={"5px"}
                      >
                        <Flex
                          fontWeight={700}
                          fontSize={"15px"}
                          // color={"black"}
                        >
                          Enable machine UID/QR verification
                        </Flex>
                        <Flex fontSize={"20px"}>
                          <TbLineScan />
                        </Flex>
                      </Flex>
                    </Flex>{" "}
                    <TableContainer
                      minH={"200px"}
                      border={"1px solid #E2E8F0"}
                      overflowX={"hidden"}
                    >
                      <Table w={"100%"} variant="simple">
                        <Thead>
                          <Tr bg={"#ECEFF3"}>
                            <Th color={"black"} px={"12px"}>
                              No
                            </Th>
                            <Th color={"black"} px={"12px"}>
                              Machine
                            </Th>
                            <Th color={"black"} px={"12px"}>
                              Machine ID
                            </Th>
                            <Th color={"black"} px={"12px"}>
                              Model
                            </Th>
                            <Th color={"black"} px={"12px"}>
                              Serial Number
                            </Th>
                            <Th></Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {val.selectedMachines?.length === 0 ||
                          !val.selectedMachines ? (
                            <Tr>
                              <Td colSpan={7} bg={"#f8f9fa"}>
                                <Flex
                                  w={"100%"}
                                  h={"100px"}
                                  justify={"center"}
                                  flexDir={"column"}
                                  gap={"5px"}
                                >
                                  <Flex
                                    fontSize={"16px"}
                                    fontWeight={700}
                                    justify={"center"}
                                    alignItems={"center"}
                                    color={"#dc143c"}
                                  >
                                    <Flex>No machine selected yet!</Flex>
                                  </Flex>
                                  <Flex
                                    justify={"center"}
                                    // color={"#848484"}
                                    fontWeight={700}
                                  >
                                    Please select the machines needed for this
                                    step.
                                  </Flex>
                                </Flex>
                              </Td>
                            </Tr>
                          ) : (
                            val.selectedMachines?.map(
                              (selectedMachine, selectedMachineIndex) => (
                                <AssignMachine
                                  key={selectedMachineIndex}
                                  openAccordions={openAccordions}
                                  toggleAccordion={toggleAccordion}
                                  selectedMachine={selectedMachine}
                                  selectedMachineIndex={selectedMachineIndex}
                                  getCustomReactSelectStyles={
                                    getCustomReactSelectStyles
                                  }
                                  handleCallToAction={handleCallToAction}
                                  stepIndex={index}
                                  workOrderFormikSetValues={
                                    workOrderFormikSetValues
                                  }
                                  formik={formik}
                                />
                              ),
                            )
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Flex>
                </Flex>
              </>
            ) : (
              ""
            )}

            {val.lockAccess ? (
              <>
                <Flex flexDir={"column"}>
                  <Flex flexDir={"column"}>
                    <Box
                      fontWeight={700}
                      fontSize={"15px"}
                      as="span"
                      flex="1"
                      textAlign="left"
                    >
                      Assign Lock&nbsp;
                      <Box as="span" color={"#dc143c"}>
                        *
                      </Box>
                    </Box>
                    {/* <Flex
                      textAlign={"center"}
                      fontSize={"14px"}
                      color={"#848484"}
                      justifyContent={"space-between"}
                    >
                      <Flex>
                        Select the lock you want to assign this step to
                      </Flex>
                    </Flex> */}
                  </Flex>

                  <FormikProvider value={formik}>
                    <FieldArray
                      name={`workOrderSteps.${index}.work_order_locks`}
                    >
                      {({ remove, push }) => {
                        function updatedPush(lock) {
                          workOrderFormikSetValues((prevState) => ({
                            ...prevState,
                            workOrderSteps: prevState.workOrderSteps.map(
                              (val, indexStep) => {
                                if (indexStep === index) {
                                  return {
                                    ...val,
                                    work_order_locks: [
                                      ...(val?.work_order_locks ?? []),
                                      {
                                        name: "",
                                        id: "",
                                        require_lock_image: false,
                                        label: "",
                                        value: "",
                                      },
                                    ],
                                  };
                                }
                                return val;
                              },
                            ),
                          }));
                          push(lock);
                        }
                        function updatedRemove(lockIndex) {
                          workOrderFormikSetValues((prevState) => {
                            return {
                              ...prevState,
                              workOrderSteps: prevState.workOrderSteps.map(
                                (val2, indexStep) => {
                                  if (indexStep === index) {
                                    return {
                                      ...val2,
                                      work_order_locks:
                                        val.work_order_locks.filter(
                                          (val3, indexWorkOrderLock) =>
                                            indexWorkOrderLock !== lockIndex,
                                        ),
                                    };
                                  }
                                  return val2;
                                },
                              ),
                            };
                          });
                          remove(lockIndex);
                        }
                        return (
                          <SelectLockAssignFormikProvider
                            formik={formik}
                            removeFn={updatedRemove}
                            pushFn={updatedPush}
                            lockCheckboxHandler={lockCheckboxHandler}
                            selectHandler={selectHandler}
                            filteredLockSelection={filteredLockSelection}
                            index={index}
                            getCustomReactSelectStyles={
                              getCustomReactSelectStyles
                            }
                            handleCallToAction={handleCallToAction}
                          />
                        );
                      }}
                    </FieldArray>
                  </FormikProvider>
                </Flex>
              </>
            ) : (
              ""
            )}
            {val.multiLockAccess ? (
              <>
                {val?.multiLockAccessGroup?.isPreAssigned ? (
                  <Flex flexDir={"column"}>
                    <Flex flexDir={"column"}>
                      <Box
                        fontWeight={700}
                        fontSize={"15px"}
                        as="span"
                        flex="1"
                        textAlign="left"
                      >
                        Assign Lock&nbsp;
                        <Box as="span" color={"#dc143c"}>
                          *
                        </Box>
                      </Box>
                      {/* <Flex
                      textAlign={"center"}
                      fontSize={"14px"}
                      color={"#848484"}
                      justifyContent={"space-between"}
                    >
                      <Flex>
                        Select the lock you want to assign this step to
                      </Flex>
                    </Flex> */}
                    </Flex>

                    <FormikProvider value={formik}>
                      <FieldArray
                        name={`workOrderSteps.${index}.multiLockAccessGroup.multiLockAccessGroupItems`}
                      >
                        {({ remove, push }) => {
                          function updatedPush(lock) {
                            workOrderFormikSetValues((prevState) => ({
                              ...prevState,
                              workOrderSteps: prevState.workOrderSteps.map(
                                (val, indexStep) => {
                                  if (indexStep === index) {
                                    return {
                                      ...val,
                                      multiLockAccessGroup: {
                                        ...val.multiLockAccessGroup,
                                        multiLockAccessGroupItems: [
                                          ...(val?.multiLockAccessGroup
                                            .multiLockAccessGroupItems ?? []),
                                          {
                                            name: "",
                                            id: "",
                                            require_lock_image: false,
                                            label: "",
                                            value: "",
                                          },
                                        ],
                                      },
                                    };
                                  }
                                  return val;
                                },
                              ),
                            }));
                            push(lock);
                          }
                          function updatedRemove(lockIndex) {
                            workOrderFormikSetValues((prevState) => {
                              return {
                                ...prevState,
                                workOrderSteps: prevState.workOrderSteps.map(
                                  (val2, indexStep) => {
                                    if (indexStep === index) {
                                      return {
                                        ...val2,
                                        multiLockAccessGroup: {
                                          ...val.multiLockAccessGroup,
                                          multiLockAccessGroupItems:
                                            val.multiLockAccessGroup.multiLockAccessGroupItems.filter(
                                              (val3, indexWorkOrderLock) =>
                                                indexWorkOrderLock !==
                                                lockIndex,
                                            ),
                                        },
                                      };
                                    }
                                    return val2;
                                  },
                                ),
                              };
                            });
                            remove(lockIndex);
                          }
                          return (
                            <SelectLockAssignFormikProvider
                              formik={formik}
                              removeFn={updatedRemove}
                              pushFn={updatedPush}
                              lockCheckboxHandler={lockCheckboxHandler}
                              selectHandler={selectHandler}
                              filteredLockSelection={filteredLockSelection}
                              index={index}
                              getCustomReactSelectStyles={
                                getCustomReactSelectStyles
                              }
                              handleCallToAction={handleCallToAction}
                            />
                          );
                        }}
                      </FieldArray>
                    </FormikProvider>
                  </Flex>
                ) : (
                  ""
                )}
              </>
            ) : (
              ""
            )}
            {val.triggerAPI ? (
              <>
                <Flex flexDir={"column"}>
                  <Flex flexDir={"column"}>
                    <Flex fontWeight={700} alignItems={"center"} gap={"4px"}>
                      Trigger API external system key
                      <Box as="span" color={"#dc143c"}>
                        *
                      </Box>
                      {/* <Tooltip
                        hasArrow
                        placement="top"
                        maxW={"none"}
                        label={
                          <Box whiteSpace="nowrap">
                            This key will be verified from the JSON payload sent
                            by your external system.
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
                      </Tooltip> */}
                    </Flex>
                    {/* <Flex
                      textAlign={"center"}
                      fontSize={"14px"}
                      color={"#848484"}
                      justifyContent={"space-between"}
                    >
                      <Flex>
                        Provide the key name we should validate from the JSON
                        payload that will be sent by your external system.
                      </Flex>
                    </Flex> */}
                  </Flex>
                  <Input
                    bg={"white"}
                    onChange={inputHandler}
                    defaultValue={val.titleTriggerAPI}
                    onBlur={() => {
                      setTimeout(() => {
                        formik.validateForm();
                        formik.setFieldTouched(
                          `workOrderSteps[${index}].titleTriggerAPI`,
                          true,
                        );
                      }, 0);
                    }}
                    placeholder="Provide the key name we should validate from the JSON payload that will be sent by your external system."
                    border={
                      formik.errors.workOrderSteps?.[index]?.titleTriggerAPI &&
                      formik.touched.workOrderSteps?.[index]?.titleTriggerAPI
                        ? "1px solid #dc143c"
                        : formik.values.workOrderSteps?.[index]?.titleTriggerAPI
                          ? "1px solid #bababa"
                          : "1px solid #039be5"
                    }
                  />
                  {formik.errors.workOrderSteps?.[index]?.titleTriggerAPI &&
                  formik.touched.workOrderSteps?.[index]?.titleTriggerAPI ? (
                    <Flex
                      py={"4px"}
                      px={"8px"}
                      alignItems={"center"}
                      fontSize={"14px"}
                      gap={"5px"}
                      color={"#dc143c"}
                    >
                      <Flex>
                        <FaTriangleExclamation />
                      </Flex>
                      <Flex>
                        {formik.errors.workOrderSteps[index]?.titleTriggerAPI}
                      </Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex>
              </>
            ) : (
              ""
            )}
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
const MemoizedStepModalFormQuestion = memo(
  WorkFlowStepAssign,
  // DynamicPropsComparator
  (prevProps, nextProps) => {
    const prevWorkOrderStep = JSON.stringify(
      prevProps.formik.errors?.workOrderSteps?.[prevProps.index],
    );
    const nextWorkOrderStep = JSON.stringify(
      nextProps.formik.errors?.workOrderSteps?.[nextProps.index],
    );
    const prevTouched = JSON.stringify(
      prevProps.formik.touched?.workOrderSteps?.[prevProps.index],
    );
    const nextTouched = JSON.stringify(
      nextProps.formik.touched?.workOrderSteps?.[nextProps.index],
    );
    const prevValue = JSON.stringify(
      prevProps.formik.values?.workOrderSteps?.[prevProps.index],
    );
    const nextValue = JSON.stringify(
      nextProps.formik.values?.workOrderSteps?.[nextProps.index],
    );
    // return false;
    return (
      prevProps.isHighlightedIndex === nextProps.isHighlightedIndex &&
      prevProps.mainRequireLockImage === nextProps.mainRequireLockImage &&
      prevProps.workOrderFormikSetValues ===
        nextProps.workOrderFormikSetValues &&
      JSON.stringify(prevProps.machineSelection) ===
        JSON.stringify(nextProps.machineSelection) &&
      JSON.stringify(prevProps.memberSelection) ===
        JSON.stringify(nextProps.memberSelection) &&
      JSON.stringify(prevProps.lockSelection) ===
        JSON.stringify(nextProps.lockSelection) &&
      JSON.stringify(prevProps.val) === JSON.stringify(nextProps.val) &&
      (prevWorkOrderStep || !prevWorkOrderStep) ===
        (nextWorkOrderStep || !nextWorkOrderStep) &&
      (prevTouched || !prevTouched) === (nextTouched || !nextTouched) &&
      (prevValue || !prevValue) === (nextValue || !nextValue)
    );
  },
);

// Export the memoized component
export default MemoizedStepModalFormQuestion;
