import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import { FaChevronDown, FaTriangleExclamation } from "react-icons/fa6";
import ReactSelect from "react-select";
import labelizeRole from "../../utils/labelizeRole";
import WorkFlowStepBadges from "../CreateTemplate/WorkFlowStepBadges";
import InspectionQuestionAccordion from "../InspectionQuestionAccordion";

import MemberGroupList from "../MemberGroupList";
import ReactSelectMemberSelection from "../ReactSelectMemberSelection";
import WorkOrderDetailsStepInspectionForm from "../WorkOrders/WorkOrderDetailsStepInspectionForm";

export default function SwitchRequestDetailStep({
  val,
  stepIndex,
  formik,
  openByDefault,
  machineOpenByDefault,
  memberSelection,
  selectHandler,
  selectedSwitchRequestStatus,
  requester,
  modalContentRef,
}) {
  const filteredMemberSelection = memberSelection?.filter((member) => {
    return (
      !val.work_order_step.assigned_members?.some(
        (assignedMember) => assignedMember.UID === member.UID
      ) && member.user.status === "verified"
    );
  });
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;

  const [openStates, setOpenStates] = useState(
    val?.work_order_step.work_order_step_machines?.map(() =>
      machineOpenByDefault ? [0] : null
    )
  );
  const getCustomReactSelectStyles = (variant) => {
    const customReactSelectStyle = {
      control: (provided, state) => ({
        ...provided,
        borderColor:
          formik.touched.switchRequestSteps?.[stepIndex]?.new_assignee_UID &&
          formik.errors.switchRequestSteps?.[stepIndex]?.new_assignee_UID
            ? "#dc143c"
            : "#039be5",
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
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    };
    return customReactSelectStyle;
  };
  const toggleAccordion = (index) => {
    setOpenStates((prevStates) =>
      prevStates.map((val2, i) => {
        if (i === index) {
          return val2 ? null : [0];
        }
        return val2;
      })
    );
  };
  // useEffect(() => {
  //   const node = document.querySelector('[role="dialog"]');
  //   if (node) setPortalTarget(node);
  // }, []);
  return (
    <Accordion defaultIndex={openByDefault ? [0] : ""} w={"100%"} allowToggle>
      <AccordionItem shadow={"0px 0px 3px rgba(50,50,93,0.5)"}>
        <AccordionButton
          //   opacity={status === "upcoming" ? "0.6" : "1"}
          p={0}
          _expanded={{ boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.2)" }}
        >
          <Flex
            w={"100%"}
            py={"8px"}
            px={"12px"}
            bg={"white"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Flex gap={"10px"}>
              <Flex color={"crimson"} fontWeight={700}>
                {val.no_work_order_step}.
              </Flex>
              <Flex>{val.work_order_step.name}</Flex>
            </Flex>
            <Flex
              cursor={"pointer"}
              color={"#bababa"}
              _hover={{ color: "black" }}
              gap={"10px"}
              alignItems={"center"}
            >
              <WorkFlowStepBadges val={val.work_order_step} />
              <AccordionIcon />
            </Flex>
          </Flex>
        </AccordionButton>
        <AccordionPanel py={"10px"}>
          <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
            {selectedSwitchRequestStatus === "approved" ? (
              <>
                <Flex flexDir={"column"} gap={"10px"}>
                  <Flex fontWeight={700}>Switched from :</Flex>
                  <Flex alignItems={"center"} gap={"10px"}>
                    {requester ? (
                      requester?.first_name ? (
                        <Avatar
                          outline={"1px solid #dc143c"}
                          border={"2px solid white"}
                          name={
                            requester?.first_name + " " + requester?.last_name
                          }
                          src={
                            requester?.profile_image_url
                              ? IMGURL + requester?.profile_image_url
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
                      )
                    ) : (
                      <Flex color={"#848484"}>No Suggested Assignee</Flex>
                    )}
                    <Flex flexDir={"column"} onClick={() => {}}>
                      <Flex>
                        {requester.first_name + " " + requester.last_name}
                      </Flex>
                      <Flex
                        fontWeight={400}
                        fontSize={"14px"}
                        color={"#848484"}
                      >
                        {requester?.super_admin?.id
                          ? "Super Admin"
                          : labelizeRole(requester?.role) +
                            " - " +
                            requester?.employee_id}
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex flexDir={"column"} gap={"10px"}>
                  <Flex fontWeight={700}>Reassigned to :</Flex>
                  <Flex alignItems={"center"} gap={"10px"}>
                    {val.new_assignee ? (
                      val.new_assignee?.user?.first_name ? (
                        <Avatar
                          outline={"1px solid #dc143c"}
                          border={"2px solid white"}
                          name={
                            val.new_assignee?.user?.first_name +
                            " " +
                            val.new_assignee?.user?.last_name
                          }
                          src={
                            val.new_assignee?.user?.profile_image_url
                              ? IMGURL +
                                val.new_assignee?.user?.profile_image_url
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
                      )
                    ) : (
                      <Flex color={"#848484"}>No Suggested Assignee</Flex>
                    )}

                    <Flex flexDir={"column"} onClick={() => {}}>
                      <Flex>
                        {val.new_assignee.user?.first_name +
                          " " +
                          val.new_assignee.user?.last_name}
                      </Flex>
                      <Flex
                        fontWeight={400}
                        fontSize={"14px"}
                        color={"#848484"}
                      >
                        {val.new_assignee.user?.super_admin?.id
                          ? "Super Admin"
                          : labelizeRole(val.new_assignee?.role) +
                            " - " +
                            val.new_assignee?.employee_id}
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              </>
            ) : (
              ""
            )}
            {selectedSwitchRequestStatus === "pending" ? (
              <Flex flexDir={"column"} gap={"10px"}>
                <Box
                  onClick={() => {
                    console.log(val);
                    console.log(selectedSwitchRequestStatus);
                  }}
                  fontWeight={700}
                  as="span"
                  flex="1"
                  textAlign="left"
                >
                  Current Assignees :
                </Box>

                <MemberGroupList
                  memberArray={val.work_order_step.assigned_members}
                />
              </Flex>
            ) : (
              ""
            )}
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex
                fontWeight={700}
                onClick={() => {
                  console.log(val.suggested_assignee);
                }}
              >
                Suggested Assignee :
              </Flex>
              <Flex alignItems={"center"} gap={"10px"}>
                {val.suggested_assignee ? (
                  <>
                    {val.suggested_assignee?.user?.first_name ? (
                      <Avatar
                        outline={"1px solid #dc143c"}
                        border={"2px solid white"}
                        name={
                          val.suggested_assignee?.user?.first_name +
                          " " +
                          val.suggested_assignee?.user?.last_name
                        }
                        src={
                          val.suggested_assignee?.user?.profile_image_url
                            ? IMGURL +
                              val.suggested_assignee?.user?.profile_image_url
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
                    <Flex flexDir={"column"} onClick={() => {}}>
                      <Flex>
                        {val.suggested_assignee?.user?.first_name +
                          " " +
                          val.suggested_assignee?.user?.last_name}
                      </Flex>
                      <Flex
                        fontWeight={400}
                        fontSize={"14px"}
                        color={"#848484"}
                      >
                        {val.suggested_assignee?.user_super_admin?.id
                          ? "Super Admin"
                          : labelizeRole(val.suggested_assignee?.role) +
                            " - " +
                            val.suggested_assignee?.employee_id}
                      </Flex>
                    </Flex>
                  </>
                ) : (
                  <Flex color={"#848484"}>No Suggested Assignee</Flex>
                )}
              </Flex>
            </Flex>
            {selectedSwitchRequestStatus === "approved" ? (
              <>
                <Flex flexDir={"column"} gap={"10px"}>
                  <Box
                    onClick={() => {
                      console.log(val);
                      console.log(selectedSwitchRequestStatus);
                    }}
                    fontWeight={700}
                    as="span"
                    flex="1"
                    textAlign="left"
                  >
                    Old Assignees :
                  </Box>

                  <MemberGroupList
                    memberArray={val.old_assignees.map((assignee) => ({
                      ...assignee,
                      user: {
                        first_name: assignee.first_name,
                        last_name: assignee.last_name,
                        profile_image_url: assignee.profile_image_url,
                      },
                    }))}
                  />
                </Flex>
                <Flex flexDir={"column"} gap={"10px"}>
                  <Box
                    onClick={() => {
                      console.log(val);
                      console.log(selectedSwitchRequestStatus);
                    }}
                    fontWeight={700}
                    as="span"
                    flex="1"
                    textAlign="left"
                  >
                    New Assignees :
                  </Box>

                  <MemberGroupList
                    memberArray={val.old_assignees.map((assignee) => {
                      if (requester.user.email === assignee.email) {
                        return {
                          ...val.new_assignee,
                        };
                      }
                      return {
                        ...assignee,
                        user: {
                          first_name: assignee.first_name,
                          last_name: assignee.last_name,
                          profile_image_url: assignee.profiel_image_url,
                        },
                      };
                    })}
                  />
                </Flex>
              </>
            ) : (
              ""
            )}

            {selectedSwitchRequestStatus === "pending" ? (
              <Flex flexDir={"column"} textAlign={"left"}>
                <Flex
                  onClick={() => {
                    console.log(filteredMemberSelection);
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
                  <Flex>Select the member you want to assign this step to</Flex>
                </Flex>
                {/* <Flex w={"100%"}> */}
                <ReactSelect
                  // isMulti
                  // menuIsOpen={true}
                  onBlur={async () => {
                    await formik.setFieldTouched(
                      `switchRequestSteps[${stepIndex}].new_assignee_UID`,
                      true
                    );
                    formik.validateForm();
                  }}
                  menuPosition="fixed"
                  menuPlacement="auto"
                  // menuPortalTarget={modalContentRef.current}
                  styles={getCustomReactSelectStyles("member")}
                  // styles={customReactSelectStyle}
                  isSearchable
                  isClearable
                  onChange={(e) => selectHandler(e, val.UID)}
                  options={filteredMemberSelection}
                  components={{
                    Option: ReactSelectMemberSelection,
                  }}
                />
                {formik.touched.switchRequestSteps?.[stepIndex]
                  ?.new_assignee_UID &&
                  formik.errors.switchRequestSteps?.[stepIndex]
                    ?.new_assignee_UID && (
                    <Flex
                      color="crimson"
                      fontSize="14px"
                      gap="5px"
                      alignItems="center"
                    >
                      <FaTriangleExclamation />
                      <Flex>
                        {
                          formik.errors.switchRequestSteps?.[stepIndex]
                            ?.new_assignee_UID
                        }
                      </Flex>
                    </Flex>
                  )}
                {/* </Flex> */}
              </Flex>
            ) : (
              ""
            )}

            {val.work_order_step.form ? (
              <Flex flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Form :
                  </Box>
                </Flex>
                <Flex w={"100%"}>
                  <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                    {/* supposed to use TemplateDetailsFormQuestion instead of WorkFlowFormQuestion */}
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
                      {val.work_order_step.work_order_form_questions.map(
                        (val, index) => (
                          <Flex
                            bg={"white"}
                            w={"100%"}
                            color={"#848484"}
                            shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                          >
                            <InspectionQuestionAccordion
                              question={val.question || val.title}
                              type={val.question_type || val.type.title}
                              required={val.required || val.is_required}
                              format={val?.format || val?.type?.format}
                              includeDate={val.include_date || val?.type?.date}
                              includeTime={val.include_time || val?.type?.time}
                              unit={val?.unit || val?.type?.unit}
                              options={val?.options || val?.type?.options}
                            />
                          </Flex>
                        )
                      )}
                    </Flex>
                    {/* <Flex>
                          <Button
                            onClick={addNewQuestion}
                            border={"dashed 2px #dc143c"}
                            p={0}
                          >
                            <Flex
                              py={"8px"}
                              px={"12px"}
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
                        </Flex> */}
                  </Flex>
                </Flex>
              </Flex>
            ) : (
              ""
            )}
            {val.work_order_step.notify ? (
              <>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Notified to :
                  </Box>
                  <MemberGroupList
                    memberArray={val.work_order_step.notified_members}
                  />
                </Flex>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Notification message :
                  </Box>
                  <Flex
                    color={
                      val.work_order_step.notification_message
                        ? "black"
                        : "#848484"
                    }
                  >
                    {val.work_order_step.notification_message || "Not Set"}
                  </Flex>
                </Flex>
              </>
            ) : (
              ""
            )}
            {val?.work_order_step.machine ? (
              <>
                <Box>
                  <Flex fontWeight={700} textAlign="left">
                    Assigned Machines :
                  </Flex>

                  <TableContainer
                    overflowX={"hidden"}
                    boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
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

                          <Th px={"12px"}></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {val.work_order_step.work_order_step_machines
                          ?.length === 0 ||
                        !val.work_order_step.work_order_step_machines ? (
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
                                  <Flex>No machine was selected!</Flex>
                                </Flex>
                                <Flex
                                  justify={"center"}
                                  // color={"#848484"}
                                  fontWeight={700}
                                >
                                  Please select the machines needed for this
                                  step next time!.
                                </Flex>
                              </Flex>
                            </Td>
                          </Tr>
                        ) : (
                          val.work_order_step.work_order_step_machines?.map(
                            (selectedMachine, index) => {
                              return (
                                <>
                                  <Tr
                                    cursor={"pointer"}
                                    bg={"#f9f9f9"}
                                    onClick={() => {
                                      toggleAccordion(index);
                                    }}
                                    _hover={{ background: "#ededed" }}
                                    transition={"background ease-in-out 0.1s"}
                                  >
                                    <Td fontWeight={700} px={"12px"}>
                                      {index + 1}.
                                    </Td>

                                    <Td whiteSpace={"normal"} px={"12px"}>
                                      {selectedMachine.name}
                                    </Td>
                                    <Td whiteSpace={"normal"} px={"12px"}>
                                      {selectedMachine.custom_machine_id}
                                    </Td>
                                    <Td whiteSpace={"normal"} px={"12px"}>
                                      {selectedMachine.model}
                                    </Td>

                                    <Td whiteSpace={"normal"} px={"12px"}>
                                      {selectedMachine.serial_number || "-"}
                                    </Td>
                                    <Td
                                      border={"none"}
                                      px={"24px"}
                                      display={"flex"}
                                      justifyContent="flex-end"
                                    >
                                      <Flex
                                        h={"20px"}
                                        transition="transform 0.3s ease"
                                        transform={
                                          openStates[index]
                                            ? "rotate(180deg)"
                                            : "rotate(0deg)"
                                        }
                                      >
                                        <FaChevronDown />
                                      </Flex>
                                    </Td>
                                  </Tr>
                                  <Tr>
                                    <Td
                                      // borderX={"1px solid #EDF2F7"}
                                      colSpan={7}
                                      p={0}
                                    >
                                      <Accordion
                                        index={openStates[index]}
                                        allowToggle
                                        allowMultiple
                                      >
                                        <AccordionItem>
                                          <AccordionButton
                                            display={"none"}
                                            p={0}
                                          ></AccordionButton>
                                          <AccordionPanel
                                            px={"20px"}
                                            pt={"10px"}
                                            pb={"20px"}
                                          >
                                            <Flex flexDir={"column"}>
                                              <Flex
                                                pb={"10px"}
                                                alignItems={"center"}
                                              >
                                                <Flex fontWeight={700}>
                                                  Assigned Inspection Form :
                                                </Flex>
                                              </Flex>

                                              {selectedMachine
                                                ?.selected_inspection_forms
                                                ?.length ? (
                                                <Flex flexDir={"column"}>
                                                  {selectedMachine.selected_inspection_forms.map(
                                                    (inspectionForm, index) => (
                                                      <WorkOrderDetailsStepInspectionForm
                                                        index={index}
                                                        inspectionForm={
                                                          inspectionForm
                                                        }
                                                      />
                                                    )
                                                  )}
                                                </Flex>
                                              ) : (
                                                <Flex
                                                  w={"100%"}
                                                  justifyContent={"center"}
                                                  py={"40px"}
                                                  boxShadow={
                                                    "0px 0px 3px rgba(50,50,93,0.5)"
                                                  }
                                                  flexDir={"column"}
                                                  alignItems={"center"}
                                                >
                                                  <Flex
                                                    color={"#dc143c"}
                                                    fontWeight={700}
                                                  >
                                                    No questions was assigned!
                                                  </Flex>
                                                  <Flex color={"#848484"}>
                                                    There was no assigned
                                                    inspection questions for
                                                    this machine!
                                                  </Flex>
                                                </Flex>
                                              )}
                                            </Flex>
                                          </AccordionPanel>
                                        </AccordionItem>
                                      </Accordion>
                                    </Td>
                                  </Tr>
                                </>
                              );
                            }
                          )
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              </>
            ) : (
              ""
            )}

            {val.work_order_step.access_lock ? (
              <>
                <Flex flexDir={"column"}>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Assigned Lock :
                    </Box>
                  </Flex>
                  <Flex flexDir={"column"}>
                    {val?.work_order_step.work_order_locks.map(
                      (val, lockIndex) => (
                        <Flex flexDir={"column"}>
                          <Flex gap={"10px"} flexDir={"column"}>
                            <Flex w={"100%"} alignItems={"center"}>
                              <Flex
                                whiteSpace={"nowrap"}
                                color={"#dc143c"}
                                fontWeight={700}
                              >
                                Lock {lockIndex + 1} : &nbsp;
                              </Flex>
                              <Flex
                                h={"40px"}
                                alignItems={"center"}
                                w={"100%"}
                                borderBottom={"1px solid black"}
                              >
                                {val.name}
                              </Flex>
                            </Flex>
                            {/* Disable Require Lock Image */}
                            {/* <Flex gap={"10px"}>
                              <Flex gap={"10px"} alignItems={"center"}>
                                <Checkbox
                                  isDisabled
                                  defaultChecked={val.require_lock_image}
                                />
                                <Flex
                                  // color={
                                  //   value.require_lock_image ? "#3182CE" : "#848484"
                                  // }
                                  fontWeight={700}
                                  fontSize={"14px"}
                                >
                                  Require Lock Image On Submission
                                </Flex>
                              </Flex>
                            </Flex> */}
                          </Flex>
                        </Flex>
                      )
                    )}
                  </Flex>
                </Flex>
              </>
            ) : (
              ""
            )}
            {val.work_order_step.multi_access_lock ? (
              <>
                {val?.work_order_step?.work_order_multi_lock_group
                  ?.is_pre_assigned ? (
                  <Flex flexDir={"column"}>
                    <Flex flexDir={"column"}>
                      <Box fontWeight={700} as="span" flex="1" textAlign="left">
                        Pre-Assigned Lock :
                      </Box>
                    </Flex>
                    <Flex flexDir={"column"}>
                      {val?.work_order_step?.work_order_multi_lock_group?.work_order_multi_lock_group_items.map(
                        (val, lockIndex) => (
                          <Flex flexDir={"column"}>
                            <Flex gap={"10px"} flexDir={"column"}>
                              <Flex w={"100%"} alignItems={"center"}>
                                <Flex
                                  whiteSpace={"nowrap"}
                                  color={"#dc143c"}
                                  fontWeight={700}
                                >
                                  Lock {lockIndex + 1} : &nbsp;
                                </Flex>
                                <Flex
                                  h={"40px"}
                                  alignItems={"center"}
                                  w={"100%"}
                                  borderBottom={"1px solid black"}
                                >
                                  {val.name}
                                </Flex>
                              </Flex>
                            </Flex>
                          </Flex>
                        )
                      )}
                    </Flex>
                  </Flex>
                ) : (
                  ""
                )}
              </>
            ) : (
              ""
            )}

            {val.work_order_step.trigger_api ? (
              <>
                {val.work_order_step.titleTriggerAPI && (
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Trigger API external system key :
                    </Box>
                    <Flex
                      color={
                        val.work_order_step.titleTriggerAPI
                          ? "black"
                          : "#848484"
                      }
                    >
                      {val.work_order_step.titleTriggerAPI || "Not Set"}
                    </Flex>
                  </Flex>
                )}
              </>
            ) : (
              ""
            )}

            {val.work_order_step.condition ? (
              <>
                {val.work_order_step.condition_question && (
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Condition Question :
                    </Box>
                    <Flex
                      color={
                        val.work_order_step.condition_question
                          ? "black"
                          : "#848484"
                      }
                    >
                      {val.work_order_step.condition_question}
                    </Flex>
                  </Flex>
                )}
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
