import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Checkbox,
  Flex,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import {
  FaChevronCircleDown,
  FaChevronCircleUp,
  FaChevronDown,
  FaFilter,
} from "react-icons/fa";
import tinycolor from "tinycolor2";
import formatString from "../../utils/formatString";
import ListEmptyState from "../ListEmptyState";

import { debounce } from "lodash";
import moment from "moment";
import {
  BiCaretLeft,
  BiCaretRight,
  BiSkipNext,
  BiSkipPrevious,
} from "react-icons/bi";
import { FiZoomIn } from "react-icons/fi";
import { TbLineScan } from "react-icons/tb";
import getLockImageByModel from "../../utils/getLockImageByModel";
import tableStatusStyleMapper from "../../utils/tableStatusStyleMapper";
import MemberGroupList from "../MemberGroupList";
import StepDetailsDrawerStepInspectionForm from "./StepDetailsDrawerStepInspectionForm";
import WorkOrderDetailsFormQuestion from "./WorkOrderDetailsFormQuestion";

export default function StepDetailsDrawerSubmissions({
  selectedEditStep,
  setImageFocusURL,
  machineOpenByDefault,
  workOrderStatus,
}) {
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(0);
  const [submissionInput, setSubmissionInput] = useState(1);
  const [showMore, setShowMore] = useState(false);
  const [submissionChangeLoading, setSubmissionChangeLoading] = useState(false);
  const [openStates, setOpenStates] = useState(
    selectedEditStep?.work_order_step_machines?.map(() =>
      machineOpenByDefault ? [0] : null
    )
  );
  const [multiLockAccessFilter, setMultiLockAccessFilter] = useState("");

  const imageFocusDisclosure = useDisclosure();

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
  function handleImageFocus(imageURL) {
    setImageFocusURL(imageURL);
    imageFocusDisclosure.onOpen();
  }

  const multiLockAccessIds =
    selectedEditStep?.work_order_multi_lock_group?.work_order_multi_lock_group_items?.map(
      (item) => item.lockId
    ) || [];
  const multiLockAccessAuditLogs = selectedEditStep?.audit_trails?.filter(
    (log) => {
      return multiLockAccessIds.includes(log.lock?.id);
    }
  );
  function filterByLockName(name, arrList) {
    return arrList.filter((auditLog) => {
      return auditLog.lock.name === name;
    });
  }

  function submissionInputHandler(e) {
    let { value } = e.target;
    let inputValue = value.replace(/[^0-9]/g, "");
    if (inputValue.length > 1 && inputValue.startsWith("0")) {
      inputValue = inputValue.replace(/^0+/, "");
    }
    if (inputValue > selectedEditStep.work_order_step_submissions.length - 1) {
      setSubmissionInput(selectedEditStep.work_order_step_submissions.length);
    } else if (inputValue < 0) {
      setSubmissionInput(1);
    } else {
      setSubmissionInput(inputValue);
    }
  }

  const hideLoading = useCallback(
    debounce(() => {
      setSubmissionChangeLoading(false);
    }, 500),
    [selectedSubmissionIndex]
  );
  function changePageHandler(
    submissionIndex,
    withoutSetSubmissionInput = false
  ) {
    setSubmissionChangeLoading(true);
    if (!withoutSetSubmissionInput) {
      setSubmissionInput(submissionIndex + 1);
    }
    setSelectedSubmissionIndex(submissionIndex);
    hideLoading();
  }

  const submission =
    selectedEditStep.work_order_step_submissions?.[selectedSubmissionIndex];

  useEffect(() => {
    setOpenStates(
      selectedEditStep.work_order_step_machines.map(() =>
        machineOpenByDefault ? [0] : null
      )
    );
  }, [selectedEditStep.work_order_step_machines, machineOpenByDefault]);

  useEffect(() => {
    changePageHandler(0);
  }, [selectedEditStep]);
  return (
    <Flex flexDir={"column"} gap={"20px"}>
      <Flex flexDir={"column"} gap={"5px"}>
        <Box fontWeight={700} as="span" flex="1" textAlign="left">
          Submissions :
        </Box>
        <Flex
          py={"5px"}
          pb={"10px"}
          px={"10px"}
          borderBottom={"1px solid #bababa"}
          // bg={"#f8f9fa"}
          // boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          alignItems={"center"}
          gap={"10px"}
          fontSize={"12px"}
        >
          {selectedSubmissionIndex !== 0 ? (
            <Flex
              _hover={{ bg: "#ededed" }}
              cursor={"pointer"}
              color={"#dc143c"}
              fontSize={"24px"}
              onClick={() => {
                changePageHandler(0);
              }}
            >
              <BiSkipPrevious />
            </Flex>
          ) : (
            ""
          )}

          <Flex
            opacity={selectedSubmissionIndex === 0 ? 0.5 : 1}
            cursor={selectedSubmissionIndex === 0 ? "not-allowed" : "pointer"}
            w={"24px"}
            h={"24px"}
            justify={"center"}
            alignItems={"center"}
            _hover={{ bg: "#ededed" }}
            color={"#dc143c"}
            fontSize={"20px"}
            onClick={() => {
              if (selectedSubmissionIndex !== 0) {
                changePageHandler(selectedSubmissionIndex - 1);
              }
            }}
          >
            <BiCaretLeft />
          </Flex>

          <Flex alignItems={"center"} gap={"10px"}>
            <Input
              fontSize={"12px"}
              h={"30px"}
              px={"4px"}
              onChange={submissionInputHandler}
              onBlur={(e) => {
                changePageHandler(submissionInput - 1, true);
              }}
              value={submissionInput}
              textAlign={"center"}
              w={"30px"}
            ></Input>
            <Flex color={"#848484"}>of</Flex>
            <Flex color={"#848484"} w={"14px"}>
              {selectedEditStep.work_order_step_submissions.length}
            </Flex>
          </Flex>
          <Flex
            opacity={
              selectedSubmissionIndex ===
              selectedEditStep.work_order_step_submissions.length - 1
                ? 0.5
                : 1
            }
            cursor={
              selectedSubmissionIndex ===
              selectedEditStep.work_order_step_submissions.length - 1
                ? "not-allowed"
                : "pointer"
            }
            w={"24px"}
            h={"24px"}
            justify={"center"}
            alignItems={"center"}
            _hover={{ bg: "#ededed" }}
            color={"#dc143c"}
            fontSize={"20px"}
            onClick={() => {
              if (
                selectedSubmissionIndex !==
                selectedEditStep.work_order_step_submissions.length - 1
              ) {
                changePageHandler(selectedSubmissionIndex + 1);
              }
            }}
          >
            <BiCaretRight />
          </Flex>

          {selectedSubmissionIndex !==
          selectedEditStep.work_order_step_submissions.length - 1 ? (
            <Flex
              _hover={{ bg: "#ededed" }}
              cursor={"pointer"}
              color={"#dc143c"}
              fontSize={"24px"}
              onClick={() => {
                changePageHandler(
                  selectedEditStep.work_order_step_submissions.length - 1
                );
              }}
            >
              <BiSkipNext />
            </Flex>
          ) : (
            ""
          )}
        </Flex>
      </Flex>
      <Flex
        gap={"10px"}
        flexDir={"column"}
        bg={"#f8f9fa"}
        p={"16px"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
      >
        {submissionChangeLoading ? (
          <Flex justify={"center"} alignItems={"center"} h={"500px"}>
            <Spinner
              thickness="4px"
              size={"xl"}
              emptyColor="gray.200"
              color="#dc143c"
            />
          </Flex>
        ) : (
          <Flex flexDir={"column"} gap={"10px"}>
            {submission?.user ? (
              <Flex flexDir={"column"} gap={"5px"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Submitted By :
                </Box>
                <MemberGroupList
                  memberArray={[submission?.user]}
                  isDataUserFirst={true}
                  grayBg={false}
                />
              </Flex>
            ) : (
              ""
            )}
            {submission?.user ? (
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Submitted At :
                </Box>
                <Flex>
                  {moment(submission?.finished_at).format(
                    "MM/DD/YYYY, hh:mm A"
                  )}
                </Flex>
              </Flex>
            ) : (
              ""
            )}
            <Flex flexDir={"column"} gap={"20px"}>
              {selectedEditStep.notify ? (
                <>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Notification message :
                    </Box>
                    <Flex>{selectedEditStep?.notification_message}</Flex>
                  </Flex>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Notified At :
                    </Box>
                    <Flex>
                      {" "}
                      {moment(submission?.notify_at).format(
                        "MM/DD/YYYY, hh:mm A"
                      )}
                    </Flex>
                  </Flex>
                </>
              ) : (
                ""
              )}
              {selectedEditStep.form ? (
                <Flex flexDir={"column"}>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Form :
                    </Box>
                  </Flex>
                  <Flex w={"100%"}>
                    <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                      <Flex flexDir={"column"}>
                        <Flex
                          flexDir={"column"}
                          w={"100%"}
                          gap={"20px"}
                          color={"#dc143c"}
                        >
                          {selectedEditStep.work_order_form_questions.map(
                            (val2, index) => {
                              return (
                                <WorkOrderDetailsFormQuestion
                                  val={val2}
                                  workOrderStatus={selectedEditStep.status}
                                  index={index}
                                  submissionIndex={selectedSubmissionIndex}
                                  handleImageFocus={handleImageFocus}
                                />
                              );
                            }
                          )}
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              ) : (
                ""
              )}
              {selectedEditStep?.machine ? (
                <>
                  <Flex flexDir={"column"} gap={"5px"}>
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
                            <Th fontSize={"10px"} color={"black"} px={"12px"}>
                              No
                            </Th>
                            <Th fontSize={"10px"} color={"black"} px={"12px"}>
                              Machine
                            </Th>
                            <Th fontSize={"10px"} color={"black"} px={"12px"}>
                              Machine ID
                            </Th>
                            <Th fontSize={"10px"} color={"black"} px={"12px"}>
                              Model
                            </Th>
                            <Th fontSize={"10px"} color={"black"} px={"12px"}>
                              Serial Number
                            </Th>

                            <Th px={"12px"}></Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {selectedEditStep.work_order_step_machines?.length ===
                            0 || !selectedEditStep.work_order_step_machines ? (
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
                            selectedEditStep.work_order_step_machines?.map(
                              (selectedMachine, index) => {
                                return (
                                  <>
                                    <Tr
                                      cursor={"pointer"}
                                      bg={"#f9f9f9"}
                                      onClick={() => {
                                        toggleAccordion(index);
                                      }}
                                      _hover={{
                                        background: "#ededed",
                                      }}
                                      transition={"background ease-in-out 0.1s"}
                                      fontSize={"13px"}
                                    >
                                      <Td fontWeight={700} px={"12px"}>
                                        {index + 1}.
                                      </Td>

                                      <Td whiteSpace={"normal"} px={"12px"}>
                                        {workOrderStatus === "draft"
                                          ? selectedMachine.machine.name
                                          : selectedMachine.name}
                                      </Td>
                                      <Td whiteSpace={"normal"} px={"12px"}>
                                        {workOrderStatus === "draft"
                                          ? selectedMachine.machine
                                              .custom_machine_id
                                          : selectedMachine.custom_machine_id}
                                      </Td>
                                      <Td whiteSpace={"normal"} px={"12px"}>
                                        {workOrderStatus === "draft"
                                          ? selectedMachine.machine.model
                                          : selectedMachine.model}
                                      </Td>

                                      <Td whiteSpace={"normal"} px={"12px"}>
                                        {workOrderStatus === "draft"
                                          ? selectedMachine.machine
                                              .serial_number || "-"
                                          : selectedMachine.serial_number ||
                                            "-"}
                                      </Td>
                                      <Td px={"12px"}>
                                        <FaChevronDown />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td
                                        // borderX={"1px solid #EDF2F7"}
                                        colSpan={7}
                                        p={0}
                                        whiteSpace={"normal"}
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
                                            <AccordionPanel
                                              px={"20px"}
                                              pt={"10px"}
                                              pb={"20px"}
                                            >
                                              <Flex
                                                flexDir={"column"}
                                                // gap={"10px"}
                                              >
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
                                                      (
                                                        inspectionForm,
                                                        index
                                                      ) => (
                                                        <StepDetailsDrawerStepInspectionForm
                                                          index={index}
                                                          submissionIndex={
                                                            selectedSubmissionIndex
                                                          }
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
                  </Flex>
                  <Flex gap={"10px"}>
                    <Checkbox
                      bg={"white"}
                      borderColor={"#039be5"}
                      isChecked={selectedEditStep?.require_verify_machine}
                      isDisabled
                      size="lg"
                    ></Checkbox>
                    <Flex
                      // fontSize={"14px"}
                      color={
                        selectedEditStep?.require_verify_machine
                          ? "#3182CE"
                          : "black"
                      }
                      alignItems={"center"}
                      gap={"5px"}
                    >
                      <Flex
                        fontWeight={700}
                        // color={"black"}
                      >
                        Enable machine UID/QR verification
                      </Flex>
                      <Flex fontSize={"20px"}>
                        <TbLineScan />
                      </Flex>
                    </Flex>
                  </Flex>{" "}
                </>
              ) : (
                ""
              )}
              {selectedEditStep.multi_access_lock ? (
                <>
                  <Flex flexDir={"column"}>
                    <Flex flexDir={"column"}>
                      <Box fontWeight={700} as="span" flex="1" textAlign="left">
                        {selectedEditStep.work_order_multi_lock_group
                          .is_pre_assigned
                          ? "Pre-Assigned Locks"
                          : "Assigned Locks"}
                        &nbsp;
                        <Box
                          as="span"
                          fontSize={"14px"}
                          color={"#848484"}
                          fontWeight={700}
                        >
                          (
                          {selectedEditStep.work_order_multi_lock_group
                            ?.work_order_multi_lock_group_items?.length + " "}
                          Locks Selected)
                        </Box>{" "}
                        :
                      </Box>
                    </Flex>

                    <Flex flexDir={"column"} gap={"10px"}>
                      <Flex flexDir={"column"}>
                        <Flex gap={"10px"} flexDir={"column"}>
                          {selectedEditStep.work_order_multi_lock_group
                            .work_order_multi_lock_group_items?.length ? (
                            selectedEditStep.work_order_multi_lock_group.work_order_multi_lock_group_items.map(
                              (multiLock, multiLockIndex) => (
                                <Flex gap={"10px"} flexDir={"column"}>
                                  <Flex w={"100%"} alignItems={"center"}>
                                    <Flex
                                      whiteSpace={"nowrap"}
                                      color={"#dc143c"}
                                      fontWeight={700}
                                    >
                                      Lock {multiLockIndex + 1} : &nbsp;
                                    </Flex>
                                    <Flex
                                      h={"40px"}
                                      alignItems={"center"}
                                      w={"100%"}
                                      borderBottom={"1px solid black"}
                                    >
                                      {multiLock?.name ||
                                      multiLock?.lock?.name ? (
                                        workOrderStatus === "draft" ? (
                                          multiLock?.lock?.name
                                        ) : (
                                          multiLock.name
                                        )
                                      ) : (
                                        <Flex color={"#848484"}>
                                          Not assigned yet
                                        </Flex>
                                      )}
                                    </Flex>
                                  </Flex>
                                  <Flex gap={"20px"}>
                                    {multiLock.work_order_multi_lock_group_item_responses
                                      ?.filter(
                                        (itemResponses) =>
                                          itemResponses.work_order_stepId ===
                                          selectedEditStep.id
                                      )

                                      .map((responseImageURL) =>
                                        responseImageURL.submissions[
                                          selectedSubmissionIndex
                                        ]?.response?.map((responseURL) => (
                                          <Flex
                                            onClick={() => {
                                              handleImageFocus(responseURL);
                                            }}
                                            cursor={"pointer"}
                                            position={"relative"}
                                            role="group"
                                          >
                                            <Flex
                                              _groupHover={{
                                                display: "block",
                                              }}
                                              w={"100%"}
                                              display={"none"}
                                              h={"100%"}
                                              bg={"black"}
                                              opacity={0.1}
                                              position={"absolute"}
                                            ></Flex>
                                            <Flex
                                              p={"3px"}
                                              _groupHover={{
                                                display: "block",
                                              }}
                                              display={"none"}
                                              top={0}
                                              right={0}
                                              position={"absolute"}
                                              fontSize={"32px"}
                                              color={"#f8f9fa"}
                                            >
                                              <FiZoomIn />
                                            </Flex>
                                            <Image
                                              w={"120px"}
                                              bg={"#f5f5f5"}
                                              h={"100px"}
                                              boxShadow={
                                                "0px 0px 3px rgba(50,50,93,0.5)"
                                              }
                                              src={responseURL}
                                            ></Image>
                                          </Flex>
                                        ))
                                      )}
                                  </Flex>
                                </Flex>
                              )
                            )
                          ) : (
                            <Flex color={"#848484"}>No locks assigned</Flex>
                          )}
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex flexDir={"column"} gap={"10px"}>
                    <Flex justify={"space-between"}>
                      <Box
                        fontWeight={700}
                        as="span"
                        flex="1"
                        textAlign="left"
                        alignItems={"center"}
                      >
                        Lock Access Audit Logs :
                      </Box>
                      <Flex gap={"10px"} alignItems={"center"}>
                        {multiLockAccessFilter ? (
                          <Button
                            h={"28px"}
                            border={"1px solid #dc143c"}
                            color={"#dc143c"}
                            bg={"white"}
                            gap={"5px"}
                            px={"12px"}
                            fontSize={"14px"}
                            onClick={() => {
                              setMultiLockAccessFilter("");
                            }}
                          >
                            <FaRegTrashAlt />
                            Remove Filter
                          </Button>
                        ) : (
                          ""
                        )}

                        <Menu>
                          <MenuButton
                            _hover={{
                              bg: tinycolor("#dc143c").darken(8).toString(),
                            }}
                            _active={{
                              bg: tinycolor("#dc143c").darken(8).toString(),
                            }}
                            as={Button}
                            color={"white"}
                            bg={"#dc143c"}
                            h={"28px"}
                            px={"12px"}
                            alignContent={"center"}
                            fontSize={"14px"}
                          >
                            <Flex alignItems={"center"} gap={"5px"}>
                              <Flex>
                                <FaFilter />
                              </Flex>
                              <Flex>
                                {multiLockAccessFilter || "Filter by lock"}
                              </Flex>
                            </Flex>
                          </MenuButton>
                          <MenuList>
                            {selectedEditStep.work_order_multi_lock_group_items?.map(
                              (multiLockAccess) => (
                                <MenuItem
                                  onClick={() =>
                                    setMultiLockAccessFilter(
                                      multiLockAccess.name
                                    )
                                  }
                                >
                                  <Flex alignItems={"center"} gap={"10px"}>
                                    <Flex flexDir={"column"}>
                                      <Flex fontWeight={700}>
                                        {multiLockAccess.name}
                                      </Flex>
                                      <Flex
                                        fontWeight={400}
                                        fontSize={"14px"}
                                        color={"#848484"}
                                      >
                                        {multiLockAccess.serial_number}
                                      </Flex>
                                    </Flex>
                                  </Flex>
                                </MenuItem>
                              )
                            )}
                          </MenuList>
                        </Menu>
                      </Flex>
                    </Flex>
                    <Flex flexDir={"column"} gap={"10px"}>
                      <TableContainer
                        overflow={"auto"}
                        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                      >
                        <Table variant="simple">
                          <Thead bg={"#ECEFF3"}>
                            <Tr>
                              <Th borderBottomColor={"#bababa"} px={"8px"}>
                                Lock
                              </Th>
                              <Th borderBottomColor={"#bababa"} px={"8px"}>
                                Date & Time
                              </Th>
                              <Th borderBottomColor={"#bababa"} px={"8px"}>
                                Action
                              </Th>
                              <Th borderBottomColor={"#bababa"} px={"8px"}>
                                Method
                              </Th>
                              <Th borderBottomColor={"#bababa"} px={"8px"}>
                                Location
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {multiLockAccessAuditLogs?.length ? (
                              (showMore
                                ? multiLockAccessFilter
                                  ? filterByLockName(
                                      multiLockAccessFilter,
                                      multiLockAccessAuditLogs
                                    )
                                  : multiLockAccessAuditLogs
                                : (multiLockAccessFilter
                                    ? filterByLockName(
                                        multiLockAccessFilter,
                                        multiLockAccessAuditLogs
                                      )
                                    : multiLockAccessAuditLogs
                                  ).slice(0, 3)
                              ).map((val, index) => {
                                const { bgColor, textColor, icon, text } =
                                  tableStatusStyleMapper(val.status);
                                return (
                                  <Tr
                                    w={"100%"}
                                    bg={index % 2 ? "white" : "#f8f9fa"}
                                  >
                                    <Td
                                      borderBottomColor={"#bababa"}
                                      whiteSpace="normal"
                                      wordBreak="break-word"
                                      px={"8px"}
                                      fontSize={"14px"}
                                    >
                                      <Flex alignItems={"center"} gap={"10px"}>
                                        <Flex
                                          aspectRatio={1}
                                          bg={"#dedede"}
                                          justifyContent={"center"}
                                          alignItems={"center"}
                                          // h={"48px"}
                                          maxW={"48px"}
                                        >
                                          <Flex
                                            color={"white"}
                                            fontSize={"20px"}
                                          >
                                            {val.lock.model ? (
                                              <Image
                                                src={getLockImageByModel(
                                                  val.lock.model
                                                )}
                                              />
                                            ) : (
                                              <IoIosLock />
                                            )}
                                          </Flex>
                                        </Flex>
                                        <Flex flexDir={"column"}>
                                          <Flex fontWeight={700}>
                                            {val.lock.name}
                                          </Flex>
                                          <Flex
                                            fontWeight={400}
                                            fontSize={"14px"}
                                            color={"#848484"}
                                          >
                                            {val.lock.serial_number}
                                          </Flex>
                                        </Flex>
                                      </Flex>
                                    </Td>
                                    <Td
                                      px={"8px"}
                                      borderBottomColor={"#bababa"}
                                      color={"#848484"}
                                      overflowWrap="break-word"
                                      maxWidth="50px"
                                      whiteSpace="normal"
                                      fontSize={"14px"}
                                    >
                                      <Flex flexDir={"column"}>
                                        <Flex color={"black"} fontWeight={700}>
                                          {moment(val.time).format(
                                            "YYYY-MM-DD"
                                          )}
                                        </Flex>
                                        <Flex
                                          color={"#848484"}
                                          fontSize={"14px"}
                                        >
                                          {moment(val.time).format("hh:mm A")}
                                        </Flex>
                                      </Flex>
                                    </Td>

                                    <Td
                                      borderBottomColor={"#bababa"}
                                      fontSize={"13px"}
                                      px={"8px"}
                                    >
                                      <Flex>
                                        <Flex
                                          fontWeight={700}
                                          borderRadius={"10px"}
                                          px={"8px"}
                                          py={"2px"}
                                          alignItems={"center"}
                                          gap={"4px"}
                                          bg={bgColor}
                                          color={textColor}
                                        >
                                          <Flex fontSize={"20px"}>{icon}</Flex>
                                          <Flex>{text}</Flex>
                                        </Flex>
                                      </Flex>
                                    </Td>
                                    <Td
                                      borderBottomColor={"#bababa"}
                                      color={"#848484"}
                                      whiteSpace="normal"
                                      wordBreak="break-word"
                                      px={"8px"}
                                      fontSize={"14px"}
                                    >
                                      <Flex flexDir={"column"}>
                                        <Flex
                                          color={"black"}
                                          fontWeight={700}
                                          fontSize={"14px"}
                                        >
                                          {formatString(val.method)}
                                        </Flex>
                                        <Flex>{val.method_info}</Flex>
                                      </Flex>
                                    </Td>
                                    <Td
                                      borderBottomColor={"#bababa"}
                                      color={"#848484"}
                                      whiteSpace="normal"
                                      wordBreak="break-word"
                                      px={"8px"}
                                      fontSize={"14px"}
                                    >
                                      <Flex maxW={"150px"}>
                                        {val.placemark || "-"}
                                      </Flex>
                                    </Td>
                                  </Tr>
                                );
                              })
                            ) : (
                              <ListEmptyState
                                size={"sm"}
                                colSpan={6}
                                header1={"No history found."}
                                header2={"to begin tracking them."}
                                linkText={"Create an action"}
                              />
                            )}
                          </Tbody>
                        </Table>
                      </TableContainer>
                      {(multiLockAccessFilter
                        ? filterByLockName(
                            multiLockAccessFilter,
                            multiLockAccessAuditLogs
                          )
                        : multiLockAccessAuditLogs
                      )?.length > 3 ? (
                        <Flex justify={"end"}>
                          <Flex
                            cursor={"pointer"}
                            _hover={{
                              color: tinycolor("#dc143c").darken(8).toString(),
                            }}
                            pr={"10px"}
                            alignItems={"center"}
                            color={"#dc143c"}
                            fontWeight={700}
                            gap={"5px"}
                            onClick={() =>
                              setShowMore((prevState) => !prevState)
                            }
                          >
                            <Flex>{showMore ? "Show less" : "Show all"}</Flex>
                            <Flex fontSize={"20px"}>
                              {showMore ? (
                                <FaChevronCircleUp />
                              ) : (
                                <FaChevronCircleDown />
                              )}
                            </Flex>
                          </Flex>
                        </Flex>
                      ) : (
                        ""
                      )}
                    </Flex>
                  </Flex>
                </>
              ) : (
                ""
              )}
              {selectedEditStep.condition ? (
                <>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Condition Question :
                    </Box>
                    <Flex
                      color={
                        selectedEditStep.condition_question
                          ? "black"
                          : "#848484"
                      }
                    >
                      {selectedEditStep.condition_question}
                    </Flex>
                  </Flex>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Condition Response :
                    </Box>
                    <Flex
                      color={
                        submission?.response_conditional ? "black" : "#848484"
                      }
                    >
                      {submission?.response_conditional}
                    </Flex>
                  </Flex>
                </>
              ) : (
                ""
              )}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
