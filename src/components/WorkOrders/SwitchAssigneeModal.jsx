import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react";
import { FaTriangleExclamation } from "react-icons/fa6";
import { IoPersonAddSharp, IoPersonRemoveSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import ReactSelect from "react-select";
import MemberGroupList from "../MemberGroupList";
import ReactSelectMemberMultiValue from "../ReactSelectMemberMultiValue";
import ReactSelectMemberSelection from "../ReactSelectMemberSelection";
import ReactSelectStepSelection from "../ReactSelectStepSelection";
import SwitchAssigneeModalSelectedStep from "./SwitchAssigneeModalSelectedStep";

export default function SwitchAssigneeModal({
  workOrderSteps,
  stepDetails,
  formik,
  handleModalClose,
  switchAssigneeButtonLoading,
  memberSelection,
  switchAssigneeDisclosure,
}) {
  const userSelector = useSelector((state) => state.login.auth);

  const filteredMemberSelection = memberSelection.filter(
    (member) => member?.user?.status === "verified"
  );
  const filteredStepSelection = workOrderSteps
    ?.map((step, index) => ({
      ...step,
      stepIndex: index,
      label: index + 1 + ". " + step.name,
      value: step.UID,
    }))
    .filter(
      (step) =>
        step?.assigned_members?.some(
          (member) => member?.user?.email === userSelector.email
        )
      // (step) => stepDetails?.assigned_member?.id === step?.assigned_member?.id
    )
    .filter((step) => step?.status === "ongoing" || step?.status === "pending");
  const getCustomReactSelectStyles = (variant) => {
    const customReactSelectStyle = {
      control: (provided, state) => ({
        ...provided,
        borderColor:
          variant === "member"
            ? formik.touched.memberUIDs && formik.errors.memberUIDs
              ? "#dc143c"
              : "#039be5"
            : variant === "workOrderSteps"
            ? formik.touched.workOrderSteps && formik.errors.workOrderSteps
              ? "#dc143c"
              : "#039be5"
            : "", // Default case
        borderRadius: "0px",
        boxShadow: state.isFocused ? "0 0 3px rgba(3, 154, 229, 0.8)" : "none",
        "&:hover": {
          boxShadow:
            variant === "member"
              ? formik.touched.memberUIDs && formik.errors.memberUIDs
                ? "0 0 3px rgba(220, 20, 60, 1)"
                : "0 0 3px rgba(3, 154, 229, 0.8)"
              : variant === "workOrderSteps"
              ? formik.touched.workOrderSteps && formik.errors.workOrderSteps
                ? "0 0 3px rgba(220, 20, 60, 1)"
                : "0 0 3px rgba(3, 154, 229, 0.8)"
              : "",
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

  async function selectHandler(value, id, workOrderStepUID) {
    if (id === "memberId") {
      if (stepDetails.isRequest) {
        formik.setValues((prevState) => ({
          ...prevState,
          workOrderSteps: prevState.workOrderSteps.map((step) => {
            if (step.UID === workOrderStepUID) {
              return { ...step, memberUID: value.UID };
            }
            return step;
          }),
        }));
      } else {
        formik.setValues((prevState) => ({
          ...prevState,
          memberUIDs: value,
        }));
      }
    } else if (id === "workOrderSteps") {
      formik.setValues((prevState) => ({ ...prevState, [id]: value }));
    }
  }

  async function handleSubmit() {
    formik.setFieldTouched("memberUIDs");
    formik.setFieldTouched("reason");
    formik.setFieldTouched("workOrderSteps");
    formik.handleSubmit();
  }
  async function inputHandler(e) {
    const { id, value } = e.target;
    formik.setValues((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }
  const initialSwitchAssignee = [
    ...(stepDetails?.assigned_members || [])?.map((member) => ({
      label: member.user.first_name + " " + member.user.last_name,
      value: member.id,
      ...member,
    })),
  ];

  return (
    <>
      <Modal
        closeOnOverlayClick={!switchAssigneeButtonLoading}
        isCentered
        isOpen={switchAssigneeDisclosure.isOpen}
        onClose={handleModalClose}
        closeOnEsc={!switchAssigneeButtonLoading}
      >
        <ModalOverlay />
        <ModalContent maxW="700px" maxH={"90vh"} overflow={"hidden"}>
          <ModalHeader color={"#dc143c"}>
            <Flex>
              <Flex>
                {stepDetails?.isRequest
                  ? "Request Switch Assignee"
                  : "Switch Assignee"}
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton isDisabled={switchAssigneeButtonLoading} />
          <ModalBody overflowY={"auto"}>
            <Flex flexDir={"column"} w={"100%"} gap={"20px"}>
              {stepDetails?.isRequest ? (
                ""
              ) : (
                <Flex flexDir={"column"} gap={"5px"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Current Assignees :
                  </Box>
                  <MemberGroupList memberArray={stepDetails.assigned_members} />
                </Flex>
              )}

              {stepDetails?.isRequest ? (
                <Flex flexDir={"column"}>
                  <Flex fontWeight={700} textAlign="left">
                    <Flex>
                      Steps to Reassign from&nbsp;
                      <Box as="span" color={"#dc143c"}>
                        *
                      </Box>
                    </Flex>
                  </Flex>
                  <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>
                      Select the steps you want to request a replacement for.
                    </Flex>
                  </Flex>
                  <ReactSelect
                    isMulti
                    //   menuPortalTarget={document.body}
                    onBlur={async () => {
                      await formik.setFieldTouched("workOrderSteps", true);
                      formik.validateForm();
                    }}
                    styles={getCustomReactSelectStyles("workOrderSteps")}
                    isSearchable
                    isClearable
                    value={formik.values.workOrderSteps}
                    onChange={(e) => selectHandler(e, "workOrderSteps")}
                    options={filteredStepSelection}
                    components={{ Option: ReactSelectStepSelection }}
                  />
                  {formik.touched.workOrderSteps &&
                    formik.errors.workOrderSteps && (
                      <Flex
                        color="crimson"
                        fontSize="14px"
                        gap="5px"
                        alignItems="center"
                      >
                        <FaTriangleExclamation />
                        <Flex>{formik.errors.workOrderSteps}</Flex>
                      </Flex>
                    )}
                </Flex>
              ) : (
                ""
              )}
              {stepDetails.isRequest ? (
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Selected Steps :
                  </Box>
                  <Flex flexDir={"column"}>
                    <Flex
                      flexDir={"column"}
                      gap={"10px"}
                      textAlign={"center"}
                      justifyContent={"space-between"}
                    >
                      {formik.values?.workOrderSteps?.map((val2) => {
                        const groupName = val2?.multiLockAccessGroup?.name; // or any name you want to match
                        const mainStep = formik.values.workOrderSteps.find(
                          (step) =>
                            step?.isMainMultiLockAccess === true &&
                            step?.multiLockAccessGroup?.name === groupName
                        );
                        const mainRequireLockImage =
                          mainStep?.multiLockAccessGroup?.require_lock_image ||
                          false;
                        const mainLockLimit =
                          mainStep?.multiLockAccessGroup?.lockLimit || 1;
                        return (
                          <SwitchAssigneeModalSelectedStep
                            memberSelection={memberSelection}
                            mainRequireLockImage={mainRequireLockImage}
                            mainLockLimit={mainLockLimit}
                            val={val2}
                            index={val2.stepIndex}
                            openByDefault={true}
                            selectHandler={selectHandler}
                          />
                        );
                      })}
                    </Flex>
                  </Flex>
                </Flex>
              ) : (
                ""
              )}
              {stepDetails.isRequest ? (
                ""
              ) : (
                <Flex flexDir={"column"} gap={"10px"}>
                  <Flex flexDir={"column"}>
                    <Flex fontWeight={700} textAlign="left">
                      <Flex>
                        Switch to&nbsp;
                        <Box as="span" color={"#dc143c"}>
                          *
                        </Box>
                      </Flex>
                    </Flex>
                    <Flex
                      textAlign={"center"}
                      fontSize={"14px"}
                      color={"#848484"}
                      justifyContent={"space-between"}
                    >
                      <Flex>
                        Select the members you want to reassign this step to
                      </Flex>
                    </Flex>
                    <ReactSelect
                      isMulti
                      //   menuPortalTarget={document.body}
                      onBlur={async () => {
                        await formik.setFieldTouched("memberUIDs", true);
                        formik.validateForm();
                      }}
                      styles={getCustomReactSelectStyles("member")}
                      // styles={customReactSelectStyle}
                      menuPosition="fixed"
                      isSearchable
                      isClearable
                      value={formik.values.memberUIDs}
                      onChange={(e) => selectHandler(e, "memberId")}
                      options={filteredMemberSelection}
                      components={{
                        Option: ReactSelectMemberSelection,
                        MultiValue: ReactSelectMemberMultiValue,
                      }}
                    />

                    {formik.touched.memberUIDs && formik.errors.memberUIDs && (
                      <Flex
                        color="crimson"
                        fontSize="14px"
                        gap="5px"
                        alignItems="center"
                      >
                        <FaTriangleExclamation />
                        <Flex>{formik.errors.memberUIDs}</Flex>
                      </Flex>
                    )}
                  </Flex>
                  <Flex fontSize={"14px"} flexDir={"column"} gap={"10px"}>
                    {formik.values.memberUIDs.filter(
                      (member) =>
                        !initialSwitchAssignee.some(
                          (init) => init?.value === member?.value
                        )
                    )?.length ? (
                      <Flex flexDir={"column"} gap={"5px"}>
                        <Flex
                          fontWeight={700}
                          alignItems={"center"}
                          gap={"5px"}
                          color={"#3D9666"}
                        >
                          <Flex>
                            <IoPersonAddSharp />
                          </Flex>
                          <Flex>Adding:</Flex>{" "}
                        </Flex>
                        <Flex flexWrap={"wrap"} gap={"10px"}>
                          {formik.values.memberUIDs
                            .filter(
                              (member) =>
                                !initialSwitchAssignee.some(
                                  (init) => init?.value === member?.value
                                )
                            )
                            .map((m) => (
                              <Flex
                                cursor={"default"}
                                bg={"#DBF6CB"}
                                fontSize={"13px"}
                                border={"1px solid #3D9666"}
                                color={"#3D9666"}
                                fontWeight={700}
                                px={"8px"}
                                py={"0px"}
                                borderRadius={"5px"}
                              >
                                {m?.label}
                              </Flex>
                            ))}
                        </Flex>
                      </Flex>
                    ) : (
                      ""
                    )}
                    {initialSwitchAssignee.filter(
                      (init) =>
                        !formik.values.memberUIDs.some(
                          (member) => member?.value === init?.value
                        )
                    )?.length ? (
                      <Flex flexDir={"column"}>
                        <Flex
                          fontWeight={700}
                          alignItems={"center"}
                          gap={"5px"}
                          color={"#dc143c"}
                        >
                          <Flex>
                            <IoPersonRemoveSharp />
                          </Flex>
                          <Flex>Removing:</Flex>{" "}
                        </Flex>
                        <Flex flexWrap={"wrap"} gap={"10px"}>
                          {initialSwitchAssignee
                            .filter(
                              (init) =>
                                !formik.values.memberUIDs.some(
                                  (member) => member?.value === init?.value
                                )
                            )
                            .map((m) => (
                              <Flex
                                cursor={"default"}
                                bg={"#FDE2E2"}
                                fontSize={"13px"}
                                border={"1px solid #dc143c"}
                                color={"#dc143c"}
                                fontWeight={700}
                                px={"8px"}
                                py={"0px"}
                                borderRadius={"5px"}
                              >
                                {m?.label}
                              </Flex>
                            ))}
                        </Flex>
                      </Flex>
                    ) : (
                      ""
                    )}
                  </Flex>
                </Flex>
              )}

              <Flex flexDir={"column"} gap={"10px"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Reassignment Reason&nbsp;
                  <Box as="span" color={"#dc143c"}>
                    *
                  </Box>
                </Box>
                <Flex flexDir={"column"}>
                  <Textarea
                    border={
                      formik.touched.reason && formik.errors.reason
                        ? "1px solid crimson"
                        : "1px solid #e2e8f0"
                    }
                    id="reason"
                    onBlur={formik.handleBlur}
                    onChange={inputHandler}
                    placeholder="I’m currently dealing with a medical emergency and won’t be able to complete this task as scheduled."
                  />
                  {formik.touched.reason && formik.errors.reason && (
                    <Flex
                      color="crimson"
                      fontSize="14px"
                      gap="5px"
                      alignItems="center"
                    >
                      <FaTriangleExclamation />
                      <Flex>{formik.errors.reason}</Flex>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Flex gap={"20px"}>
              <Button
                isLoading={switchAssigneeButtonLoading}
                bg={"white"}
                _hover={{ bg: "#dc143c", color: "white" }}
                border={"1px solid #dc143c"}
                color={"#dc143c"}
                onClick={handleModalClose}
              >
                Cancel
              </Button>
              <Button
                isLoading={switchAssigneeButtonLoading}
                onClick={handleSubmit}
                _hover={{ bg: "#bf1134" }}
                bg={"#dc143c"}
                color={"white"}
              >
                {stepDetails?.isRequest ? "Submit Request" : "Switch Assignee"}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
