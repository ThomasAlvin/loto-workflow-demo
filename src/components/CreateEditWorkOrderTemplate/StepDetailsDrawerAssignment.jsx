import {
  Box,
  Checkbox,
  Flex,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import ReactSelect from "react-select";
import { memo, useCallback, useState } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import AssignMachine from "../CreateWorkOrder/AssignMachine";
import ReactSelectMemberSelection from "../ReactSelectMemberSelection";
import { FieldArray, FormikProvider } from "formik";
import SelectLockAssignFormikProvider from "../CreateEditWorkOrderTemplate/SelectLockAssignFormikProvider";
import { debounce } from "lodash";
import ReactSelectMemberMultiValue from "../ReactSelectMemberMultiValue";
import dynamicPropsComparator from "../../utils/dynamicPropsComparator";
import { TbLineScan } from "react-icons/tb";

function StepDetailsDrawerAssignmentMemo({
  isHighlightedIndex,
  mainRequireLockImage,
  selectedEditStep,
  editStepDrawerFormik,
  machineSelection,
  memberSelection,
  lockSelection,
  index,
  val,
  openByDefault,
  assignRefs,
  handleCallToAction,
}) {
  const isMultiAssign = import.meta.env.VITE_MULTI_ASSIGN === "true";
  const toast = useToast();
  const [openAccordions, setOpenAccordions] = useState(
    editStepDrawerFormik.values?.selectedMachines?.map((val, index) => index)
  );

  const filteredLockSelection = lockSelection.filter(
    (lock) =>
      !editStepDrawerFormik.values?.multiLockAccessGroup?.multiLockAccessGroupItems
        ?.map((lock) => lock.id)
        .includes(lock.id)
  );
  const nav = useNavigate();
  const toggleAccordion = (index) => {
    setOpenAccordions(
      (prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index) // Close accordion if it's already open
          : [...prev, index] // Open accordion if it's closed
    );
  };

  const getCustomReactSelectStyles = (
    variant,
    lockIndex,
    selectedMachineIndex
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
            ? editStepDrawerFormik.errors?.selectedMachines &&
              editStepDrawerFormik.touched?.selectedMachines &&
              typeof editStepDrawerFormik.errors?.selectedMachines === "string"
              ? "#dc143c"
              : editStepDrawerFormik.values?.selectedMachines?.length
              ? "#bababa"
              : "#039be5"
            : variant === "assign"
            ? (
                isMultiAssign
                  ? editStepDrawerFormik.errors?.assigned_to &&
                    editStepDrawerFormik.touched?.assigned_to
                  : editStepDrawerFormik.errors?.assigned_to?.id &&
                    editStepDrawerFormik.touched?.assigned_to?.id
              )
              ? "#dc143c"
              : (
                  isMultiAssign
                    ? editStepDrawerFormik.values?.assigned_to?.length
                    : editStepDrawerFormik.values?.assigned_to?.id
                )
              ? "#bababa"
              : "#039be5"
            : variant === "notify"
            ? (
                isMultiAssign
                  ? editStepDrawerFormik.errors?.notify_to &&
                    editStepDrawerFormik.touched?.notify_to
                  : editStepDrawerFormik.errors?.notify_to?.id &&
                    editStepDrawerFormik.touched?.notify_to?.id
              )
              ? "#dc143c"
              : (
                  isMultiAssign
                    ? editStepDrawerFormik.values?.notify_to?.length
                    : editStepDrawerFormik.values?.notify_to?.id
                )
              ? "#bababa"
              : "#039be5"
            : variant === "lock"
            ? editStepDrawerFormik.errors?.work_order_locks?.[lockIndex]?.id &&
              editStepDrawerFormik.touched?.work_order_locks?.[lockIndex]?.id
              ? "#dc143c"
              : editStepDrawerFormik.values?.work_order_locks?.[lockIndex]?.id
              ? "#bababa"
              : "#039be5"
            : variant === "inspectionForm"
            ? editStepDrawerFormik.errors?.selectedMachines?.[
                selectedMachineIndex
              ]?.selectedInspectionForms &&
              editStepDrawerFormik.touched?.selectedMachines?.[
                selectedMachineIndex
              ]?.selectedInspectionForms
              ? "#dc143c"
              : editStepDrawerFormik.values?.selectedMachines?.[
                  selectedMachineIndex
                ]?.selectedInspectionForms.length
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

    editStepDrawerFormik.setValues((prevState) => ({
      ...prevState,
      titleTriggerAPI: value,
    }));
  }, 300);
  const selectHandler = useCallback((event, type, lockIndex) => {
    if (type === "assign") {
      editStepDrawerFormik.setValues((prevState) => ({
        ...prevState,
        assigned_to: isMultiAssign ? event || [] : event || { id: "" },
      }));
    } else if (type === "notify") {
      editStepDrawerFormik.setValues((prevState) => ({
        ...prevState,
        notify_to: isMultiAssign ? event || [] : event || { id: "" },
      }));
    } else if (type === "lock") {
      editStepDrawerFormik.setValues((prevState) => {
        return {
          ...prevState,
          multiLockAccessGroup: {
            ...prevState.multiLockAccessGroup,
            multiLockAccessGroupItems:
              prevState.multiLockAccessGroup.multiLockAccessGroupItems.map(
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
                }
              ),
          },
        };
      });
    }
  }, []);
  function machineSelectHandler(event) {
    const tempArr = [];
    event.map((val) => {
      tempArr.push(val);
    });

    editStepDrawerFormik.setValues((prevState) => ({
      ...prevState,
      selectedMachines: tempArr,
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
    editStepDrawerFormik.setValues((prevState) => ({
      ...prevState,
      work_order_locks: val.work_order_locks.map((val2, indexWorkOrderLock) => {
        if (indexWorkOrderLock === lockIndex) {
          return { ...val2, require_lock_image: checked };
        }
        return val2;
      }),
    }));
  }, []);
  function machineCheckboxHandler() {
    console.log("dskajaj");

    editStepDrawerFormik.setValues((prevState) => ({
      ...prevState,
      requireVerifyMachine: !prevState?.requireVerifyMachine,
    }));
  }
  // useEffect(() => {
  //   checkAndAddEmptyAssignLock();
  //   editStepDrawerFormik.validateForm();
  // }, [val]);
  return (
    <Flex pr={"16px"} w={"100%"} flexDir={"column"} gap={"20px"}>
      <Flex w={"100%"} fontSize={"14px"} flexDir={"column"}>
        <Flex width={"100%"} fontWeight={700} textAlign="left">
          <Flex>
            Assign to&nbsp;
            <Box as="span" color={"#dc143c"}>
              *
            </Box>
          </Flex>
        </Flex>
        <Flex
          textAlign={"center"}
          fontSize={"13px"}
          color={"#848484"}
          justifyContent={"space-between"}
        >
          <Flex>Select the members you want to assign this step to</Flex>
        </Flex>
        <ReactSelect
          classNamePrefix={"react-select"}
          isMulti={isMultiAssign}
          placeholder="Select members to assign"
          onBlur={() => {
            setTimeout(() => {
              editStepDrawerFormik.setFieldTouched(
                isMultiAssign ? `assigned_to` : `assigned_to.id`,
                true
              );
              editStepDrawerFormik.validateForm();
            }, 0);
          }}
          styles={getCustomReactSelectStyles("assign")}
          isSearchable
          isClearable
          {...(isMultiAssign
            ? { value: editStepDrawerFormik.values?.assigned_to }
            : {
                value: editStepDrawerFormik.values?.assigned_to?.id
                  ? {
                      value:
                        editStepDrawerFormik.values.assigned_to?.id || null,
                      label:
                        editStepDrawerFormik.values?.assigned_to?.user
                          ?.first_name +
                        " " +
                        editStepDrawerFormik.values?.assigned_to?.user
                          ?.last_name,
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
        {editStepDrawerFormik?.errors?.assigned_to &&
        editStepDrawerFormik?.touched?.assigned_to ? (
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
            <Flex>{editStepDrawerFormik?.errors?.assigned_to}</Flex>
          </Flex>
        ) : (
          ""
        )}
      </Flex>

      {editStepDrawerFormik.values.notify ? (
        <>
          <Flex fontSize={"14px"} flexDir={"column"}>
            <Box fontWeight={700} as="span" flex="1" textAlign="left">
              Notify to&nbsp;
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
              <Flex>Select which members to notify about this step</Flex>
            </Flex>
            <ReactSelect
              classNamePrefix={"react-select"}
              isMulti={isMultiAssign}
              placeholder="Select members to notify"
              onBlur={() => {
                setTimeout(() => {
                  editStepDrawerFormik.setFieldTouched(
                    isMultiAssign ? `notify_to` : `notify_to.id`,
                    true
                  );
                  editStepDrawerFormik.validateForm();
                }, 0);
              }}
              styles={getCustomReactSelectStyles("notify")}
              isSearchable
              isClearable
              {...(isMultiAssign
                ? { value: editStepDrawerFormik.values?.notify_to }
                : {
                    value: editStepDrawerFormik.values?.notify_to?.id
                      ? {
                          value:
                            editStepDrawerFormik.values.notify_to?.id || null,
                          label:
                            editStepDrawerFormik.values?.notify_to?.user
                              ?.first_name +
                            " " +
                            editStepDrawerFormik.values?.notify_to?.user
                              ?.last_name,
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

            {editStepDrawerFormik?.errors?.notify_to &&
            editStepDrawerFormik?.touched?.notify_to ? (
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
                <Flex>{editStepDrawerFormik?.errors?.notify_to}</Flex>
              </Flex>
            ) : (
              ""
            )}
          </Flex>
          <Flex fontSize={"14px"} flexDir={"column"}>
            <Box fontWeight={700} as="span" flex="1" textAlign="left">
              Notification message
            </Box>
            <Input
              fontSize={"14px"}
              bg={"white"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              _hover={{
                background: "none", // Prevent background color change
                borderColor: "none", // Prevent border color change
              }}
              pointerEvents={"none"}
              value={editStepDrawerFormik.values.notificationMessage}
            ></Input>
          </Flex>
        </>
      ) : (
        ""
      )}
      {editStepDrawerFormik.values.machine ? (
        <>
          <Flex flexDir={"column"} gap={"0px"}>
            <Box
              fontSize={"14px"}
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
            <Flex
              textAlign={"center"}
              fontSize={"13px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>Select the machines you want to assign in this step</Flex>
            </Flex>
            <Flex fontSize={"14px"} flexDir={"column"} gap={"16px"} w={"100%"}>
              <Flex gap={"5px"} flexDir={"column"}>
                <ReactSelect
                  classNamePrefix={"react-select"}
                  placeholder="Assign machines for this step "
                  onBlur={() => {
                    setTimeout(() => {
                      editStepDrawerFormik.validateForm();
                      editStepDrawerFormik.setFieldTouched(
                        `selectedMachines`,
                        true
                      );
                    }, 0);
                  }}
                  styles={getCustomReactSelectStyles("machine")}
                  isSearchable
                  isClearable
                  isMulti
                  value={editStepDrawerFormik.values.selectedMachines}
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
                            handleCallToAction("/equipment-machine/create")
                          }
                        >
                          Add a new machine
                        </Flex>
                        <Flex>&nbsp;now to get started!</Flex>
                      </Flex>
                    </Flex>
                  )}
                />

                {editStepDrawerFormik?.errors?.selectedMachines &&
                editStepDrawerFormik?.touched?.selectedMachines &&
                typeof editStepDrawerFormik?.errors?.selectedMachines ===
                  "string" ? (
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
                      {editStepDrawerFormik?.errors?.selectedMachines}
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
                  isChecked={editStepDrawerFormik.values.requireVerifyMachine}
                  size="lg"
                  onChange={machineCheckboxHandler}
                  defaultChecked
                ></Checkbox>
                <Flex
                  onClick={machineCheckboxHandler}
                  color={
                    editStepDrawerFormik.values.requireVerifyMachine
                      ? "#3182CE"
                      : "black"
                  }
                  alignItems={"center"}
                  gap={"5px"}
                >
                  <Flex
                    fontWeight={700}
                    fontSize={"14px"}
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
                w={"100%"}
              >
                <Table w={"100%"} variant="simple">
                  <Thead>
                    <Tr bg={"#ECEFF3"}>
                      <Th fontSize={"10px"} color={"black"} px={"8px"}>
                        Machine
                      </Th>
                      <Th fontSize={"10px"} color={"black"} px={"8px"}>
                        Machine ID
                      </Th>
                      <Th fontSize={"10px"} color={"black"} px={"8px"}>
                        Model
                      </Th>
                      <Th fontSize={"10px"} color={"black"} px={"8px"}>
                        Serial Number
                      </Th>
                      <Th px={"8px"}></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {editStepDrawerFormik.values.selectedMachines?.length ===
                      0 || !editStepDrawerFormik.values.selectedMachines ? (
                      <Tr>
                        <Td colSpan={5} bg={"#f8f9fa"}>
                          <Flex
                            w={"100%"}
                            h={"100px"}
                            justify={"center"}
                            flexDir={"column"}
                            fontSize={"14px"}
                          >
                            <Flex
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
                              fontSize={"12px"}
                            >
                              Please select the machines needed for this step.
                            </Flex>
                          </Flex>
                        </Td>
                      </Tr>
                    ) : (
                      editStepDrawerFormik.values.selectedMachines?.map(
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
                            editStepDrawerFormik={editStepDrawerFormik}
                          />
                        )
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

      {editStepDrawerFormik.values.lockAccess ? (
        <>
          <Flex flexDir={"column"}>
            <Flex flexDir={"column"}>
              <Box
                fontWeight={700}
                fontSize={"14px"}
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

            <FormikProvider value={editStepDrawerFormik}>
              <FieldArray name={`work_order_locks`}>
                {({ remove, push }) => {
                  function updatedPush(lock) {
                    editStepDrawerFormik.setValues((prevState) => ({
                      ...prevState,
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
                    }));
                    push(lock);
                  }
                  function updatedRemove(lockIndex) {
                    editStepDrawerFormik.setValues((prevState) => {
                      return {
                        ...prevState,
                        work_order_locks:
                          editStepDrawerFormik.values.work_order_locks.filter(
                            (val3, indexWorkOrderLock) =>
                              indexWorkOrderLock !== lockIndex
                          ),
                      };
                    });
                    remove(lockIndex);
                  }
                  return (
                    <SelectLockAssignFormikProvider
                      editStepDrawerFormik={editStepDrawerFormik}
                      removeFn={updatedRemove}
                      pushFn={updatedPush}
                      lockCheckboxHandler={lockCheckboxHandler}
                      selectHandler={selectHandler}
                      filteredLockSelection={filteredLockSelection}
                      index={index}
                      getCustomReactSelectStyles={getCustomReactSelectStyles}
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
      {editStepDrawerFormik.values.multiLockAccess ? (
        <>
          {editStepDrawerFormik.values?.multiLockAccessGroup?.isPreAssigned ? (
            <Flex flexDir={"column"}>
              <Flex flexDir={"column"}>
                <Box
                  fontWeight={700}
                  fontSize={"14px"}
                  as="span"
                  flex="1"
                  textAlign="left"
                  onClick={() => {
                    console.log(filteredLockSelection);
                  }}
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

              <FormikProvider value={editStepDrawerFormik}>
                <FieldArray
                  name={`workOrderSteps.${index}.multiLockAccessGroup.multiLockAccessGroupItems`}
                >
                  {({ remove, push }) => {
                    function updatedPush(lock) {
                      editStepDrawerFormik.setValues((prevState) => ({
                        ...prevState,
                        multiLockAccessGroup: {
                          ...prevState.multiLockAccessGroup,
                          multiLockAccessGroupItems: [
                            ...(prevState?.multiLockAccessGroup
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
                      }));
                      push(lock);
                    }
                    function updatedRemove(lockIndex) {
                      editStepDrawerFormik.setValues((prevState) => {
                        return {
                          ...prevState,
                          multiLockAccessGroup: {
                            ...editStepDrawerFormik.values.multiLockAccessGroup,
                            multiLockAccessGroupItems:
                              editStepDrawerFormik.values.multiLockAccessGroup.multiLockAccessGroupItems.filter(
                                (val3, indexWorkOrderLock) =>
                                  indexWorkOrderLock !== lockIndex
                              ),
                          },
                        };
                      });
                      remove(lockIndex);
                    }
                    return (
                      <SelectLockAssignFormikProvider
                        editStepDrawerFormik={editStepDrawerFormik}
                        removeFn={updatedRemove}
                        pushFn={updatedPush}
                        lockCheckboxHandler={lockCheckboxHandler}
                        selectHandler={selectHandler}
                        filteredLockSelection={filteredLockSelection}
                        index={index}
                        getCustomReactSelectStyles={getCustomReactSelectStyles}
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
      {editStepDrawerFormik.values.triggerAPI ? (
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
              defaultValue={editStepDrawerFormik.values.titleTriggerAPI}
              onBlur={() => {
                setTimeout(() => {
                  editStepDrawerFormik.validateForm();
                  editStepDrawerFormik.setFieldTouched(`titleTriggerAPI`, true);
                }, 0);
              }}
              placeholder="Provide the key name we should validate from the JSON payload that will be sent by your external system."
              border={
                editStepDrawerFormik.errors?.titleTriggerAPI &&
                editStepDrawerFormik.touched?.titleTriggerAPI
                  ? "1px solid #dc143c"
                  : editStepDrawerFormik.values?.titleTriggerAPI
                  ? "1px solid #bababa"
                  : "1px solid #039be5"
              }
            />
            {editStepDrawerFormik.errors?.titleTriggerAPI &&
            editStepDrawerFormik.touched?.titleTriggerAPI ? (
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
                <Flex>{editStepDrawerFormik.errors?.titleTriggerAPI}</Flex>
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
  );
}
const StepDetailsDrawerAssignment = memo(
  StepDetailsDrawerAssignmentMemo,
  dynamicPropsComparator
);

// Export the memoized component
export default StepDetailsDrawerAssignment;
