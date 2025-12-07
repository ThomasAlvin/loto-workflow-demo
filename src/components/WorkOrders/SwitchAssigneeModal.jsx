import {
  Avatar,
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
import { FaUserAlt } from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";
import { useSelector } from "react-redux";
import ReactSelect from "react-select";
import labelizeRole from "../../utils/labelizeRole";
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
  const isMultiAssign = import.meta.env.VITE_MULTI_ASSIGN === "true";
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
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
    console.log(value);
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
          memberUIDs: value.map((val) => val.memberUID),
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
              <Flex
                onClick={() => {
                  console.log(filteredStepSelection);
                  console.log(workOrderSteps);
                  console.log(stepDetails);
                }}
              >
                {stepDetails?.isRequest
                  ? "Request Switch Assignee"
                  : "Switch Assignee"}
                {/* {stepDetails.index + 1}. {stepDetails.name} */}
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
                  {isMultiAssign ? (
                    <MemberGroupList
                      memberArray={stepDetails.assigned_members}
                    />
                  ) : (
                    <Flex alignItems={"center"} gap={"10px"}>
                      {stepDetails.assigned_member?.user.first_name ? (
                        <Avatar
                          outline={"1px solid #dc143c"}
                          border={"2px solid white"}
                          name={
                            stepDetails.assigned_member?.user.first_name +
                            " " +
                            stepDetails.assigned_member?.user.last_name
                          }
                          src={
                            stepDetails.assigned_member?.user.profile_image_url
                              ? IMGURL +
                                stepDetails.assigned_member?.user
                                  .profile_image_url
                              : null
                          }
                        ></Avatar>
                      ) : (
                        <Flex
                          outline={"1px solid #dc143c"}
                          bg={"#bababa"}
                          borderRadius={"100%"}
                          justifyContent={"center"}
                          alignItems={"center"}
                          h={"48px"}
                          w={"48px"}
                          border={"2px solid white"}
                        >
                          <Flex color={"white"} fontSize={"24px"}>
                            <FaUserAlt />
                          </Flex>
                        </Flex>
                      )}
                      <Flex
                        flexDir={"column"}
                        onClick={() => {
                          console.log(formik);
                          console.log(stepDetails);
                        }}
                      >
                        {stepDetails.assigned_member ? (
                          <>
                            <Flex>
                              {stepDetails.assigned_member?.user.first_name +
                                " " +
                                stepDetails.assigned_member?.user.last_name}
                            </Flex>
                            <Flex
                              fontWeight={400}
                              fontSize={"14px"}
                              color={"#848484"}
                            >
                              {labelizeRole(stepDetails.assigned_member.role)} -{" "}
                              {stepDetails.assigned_member.employee_id}
                            </Flex>
                          </>
                        ) : (
                          <Flex color={"#848484"}>Not assigned yet</Flex>
                        )}
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              )}

              {stepDetails?.isRequest ? (
                <Flex flexDir={"column"}>
                  <Flex
                    onClick={() => {
                      console.log(memberSelection);
                      console.log(stepDetails);
                    }}
                    fontWeight={700}
                    textAlign="left"
                  >
                    <Flex>Steps to Reassign from</Flex>
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
                    {/* <Flex flexDir={"column"} color={"#dc143c"}>
                    {workOrderFormik.values.workOrderSteps?.length >= 5 ? (
                      <>
                        <Flex h={"20px"} pl={"5px"} color={"#848484"}>
                          {summaryData.steps.length < 5 ? "..." : ""}
                        </Flex>
                        {summaryData.steps.length < 5 ? (
                          <Flex
                            textDecor={"underline"}
                            cursor={"pointer"}
                            onClick={() => showSteps()}
                          >
                            Show More
                          </Flex>
                        ) : (
                          <Flex
                            textDecor={"underline"}
                            cursor={"pointer"}
                            onClick={() => hideSteps()}
                          >
                            Show Less
                          </Flex>
                        )}
                      </>
                    ) : (
                      ""
                    )}
                  </Flex> */}
                  </Flex>
                </Flex>
              ) : (
                ""
              )}
              {stepDetails.isRequest ? (
                ""
              ) : (
                <Flex flexDir={"column"}>
                  <Flex
                    onClick={() => {
                      console.log(memberSelection);
                      console.log(stepDetails);
                    }}
                    fontWeight={700}
                    textAlign="left"
                  >
                    <Flex>Switch to</Flex>
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
                    defaultValue={stepDetails.assigned_to}
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
