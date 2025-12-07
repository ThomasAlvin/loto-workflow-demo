import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
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
import { FaChevronDown } from "react-icons/fa6";
import ReactSelect from "react-select";
import labelizeRole from "../../utils/labelizeRole";
import WorkFlowStepBadges from "../CreateTemplate/WorkFlowStepBadges";
import InspectionQuestionAccordion from "../InspectionQuestionAccordion";
import MemberGroupList from "../MemberGroupList";
import ReactSelectMemberSelection from "../ReactSelectMemberSelection";
import WorkOrderDetailsStepInspectionForm from "./WorkOrderDetailsStepInspectionForm";

export default function SwitchAssigneeModalSelectedStep({
  mainRequireLockImage,
  mainLockLimit,
  index,
  val,
  openByDefault,
  memberSelection,
  selectHandler,
}) {
  const filteredMemberSelection = memberSelection.filter((member) => {
    return (
      !val.assigned_members?.some(
        (assignedMember) => assignedMember.UID === member.UID
      ) && member.user.status === "verified"
    );
  });
  const getCustomReactSelectStyles = (variant) => {
    const customReactSelectStyle = {
      control: (provided, state) => ({
        ...provided,
        borderColor: "#039be5",
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
    return customReactSelectStyle;
  };
  const isMultiAssign = import.meta.env.VITE_MULTI_ASSIGN === "true";
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;

  const [openStates, setOpenStates] = useState(
    val.work_order_step_machines?.map(() => [0])
  );
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
  console.log(openStates);

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
                {index + 1}.
              </Flex>
              <Flex>{val.name}</Flex>
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
        <AccordionPanel py={"16px"}>
          <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
            <Flex flexDir={"column"} gap={"10px"}>
              <Box
                onClick={() => console.log(val)}
                fontWeight={700}
                as="span"
                flex="1"
                textAlign="left"
              >
                Current Assignees :
              </Box>

              <MemberGroupList memberArray={val.assigned_members} />
            </Flex>
            <Flex flexDir={"column"} textAlign={"left"}>
              <Flex
                onClick={() => {
                  console.log(filteredMemberSelection);
                }}
                fontWeight={700}
                textAlign="left"
              >
                <Flex>Suggest a replacement</Flex>
              </Flex>
              <Flex
                textAlign={"center"}
                fontSize={"14px"}
                color={"#848484"}
                justifyContent={"space-between"}
              >
                <Flex>Suggest a member to take over your assignment</Flex>
              </Flex>
              {/* <Flex w={"100%"}> */}
              <ReactSelect
                // isMulti
                menuPosition="fixed"
                menuPlacement="auto"
                // menuPortalTarget={document.body}
                styles={getCustomReactSelectStyles("member")}
                // styles={customReactSelectStyle}
                isSearchable
                isClearable
                onChange={(e) => selectHandler(e, "memberId", val.UID)}
                options={filteredMemberSelection}
                components={{
                  Option: ReactSelectMemberSelection,
                }}
              />
              {/* </Flex> */}
            </Flex>
            {val.form ? (
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
                      {val.work_order_form_questions.map((val, index) => {
                        return (
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
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Notified to :
                  </Box>
                  {isMultiAssign ? (
                    <MemberGroupList memberArray={val.notified_members} />
                  ) : (
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Flex
                        onClick={() => {
                          console.log(val);
                        }}
                      >
                        blololsda
                      </Flex>
                      <Flex
                        bg={"#bababa"}
                        borderRadius={"100%"}
                        justifyContent={"center"}
                        alignItems={"center"}
                        h={"40px"}
                        w={"40px"}
                        border={"2px solid white"}
                      >
                        <Flex color={"white"} fontSize={"20px"}>
                          <FaUserAlt />
                        </Flex>
                      </Flex>
                      <Flex flexDir={"column"}>
                        <Flex>
                          {val.notify_to
                            ? val.notify_to?.user.first_name +
                              " " +
                              val.notify_to?.user.last_name
                            : "-"}
                        </Flex>
                        <Flex
                          fontWeight={400}
                          fontSize={"14px"}
                          color={"#848484"}
                        >
                          {labelizeRole(val.notify_to?.role)}
                        </Flex>
                      </Flex>
                    </Flex>
                  )}
                </Flex>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Notification message :
                  </Box>
                  <Flex color={val.notification_message ? "black" : "#848484"}>
                    {val.notification_message || "Not Set"}
                  </Flex>
                </Flex>
              </>
            ) : (
              ""
            )}
            {val.machine ? (
              <>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Machines :
                  </Box>

                  <TableContainer overflowX={"hidden"}>
                    <Table w={"100%"} variant="simple">
                      <Thead bg={"#ECEFF3"}>
                        <Tr>
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
                      <Tbody bg={"#F9F9F9"}>
                        {val.work_order_step_machines?.map(
                          (selectedMachine, index) => (
                            <>
                              <Tr
                                cursor={"pointer"}
                                bg={"#f9f9f9"}
                                onClick={() => {
                                  console.log(selectedMachine);
                                  toggleAccordion(index);
                                }}
                              >
                                <Td px={"12px"}>{index + 1}.</Td>
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
                                  {selectedMachine.serial_number}
                                  {/* pernah ganti serialNumber */}
                                  {/* pernah ganti serial_number because create work order sumamry */}
                                  {/* pernah ganti serial_number because create work order sumamry */}
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
                                  borderX={"1px solid #EDF2F7"}
                                  colSpan={6}
                                  p={0}
                                >
                                  <Accordion
                                    index={openStates[index]}
                                    allowMultiple
                                  >
                                    <AccordionItem>
                                      <AccordionButton
                                        display={"none"}
                                        p={0}
                                      ></AccordionButton>
                                      <AccordionPanel px={"10px"} py={"10px"}>
                                        <Flex flexDir={"column"} gap={"10px"}>
                                          <Flex alignItems={"center"}>
                                            <Flex
                                              onClick={() => {
                                                console.log(selectedMachine);
                                              }}
                                              fontWeight={700}
                                            >
                                              Selected Inspection Form :
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
                                                There was no assigned inspection
                                                questions for this machine!
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
                          )
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Flex>
              </>
            ) : (
              ""
            )}

            {val.lock_access ? (
              <>
                <Flex flexDir={"column"}>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Assigned Lock :
                    </Box>
                  </Flex>
                  <Flex flexDir={"column"}>
                    {val?.work_order_locks.map((val, lockIndex) => (
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
                    ))}
                  </Flex>
                </Flex>
              </>
            ) : (
              ""
            )}
            {val.multi_access_lock ? (
              <>
                {val.work_order_multi_lock_group.is_pre_assigned ? (
                  <Flex flexDir={"column"}>
                    <Flex flexDir={"column"}>
                      <Box fontWeight={700} as="span" flex="1" textAlign="left">
                        Pre-Assigned Lock :
                      </Box>
                    </Flex>
                    <Flex flexDir={"column"}>
                      {val?.work_order_multi_lock_group?.work_order_multi_lock_group_items.map(
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
            {val.triggerAPI ? (
              <>
                {val.titleTriggerAPI && (
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Trigger API external system key :
                    </Box>
                    <Flex color={val.titleTriggerAPI ? "black" : "#848484"}>
                      {val.titleTriggerAPI || "Not Set"}
                    </Flex>
                  </Flex>
                )}
              </>
            ) : (
              ""
            )}
            {val.condition ? (
              <>
                {val.condition_question && (
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Condition Question :
                    </Box>
                    <Flex color={val.condition_question ? "black" : "#848484"}>
                      {val.condition_question}
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
