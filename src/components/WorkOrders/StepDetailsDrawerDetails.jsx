import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Button,
  Checkbox,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Slide,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import {
  FaChevronCircleDown,
  FaChevronCircleUp,
  FaChevronDown,
  FaFilter,
  FaFlag,
  FaUserAlt,
  FaUserCircle,
} from "react-icons/fa";
import tinycolor from "tinycolor2";
import formatString from "../../utils/formatString";
import ListEmptyState from "../ListEmptyState";

import { useReactFlow } from "@xyflow/react";
import moment from "moment";
import { FiZoomIn } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { TbLineScan } from "react-icons/tb";
import { TiWarning } from "react-icons/ti";
import { useSelector } from "react-redux";
import { useDeleteContext } from "../../service/DeleteMultiLockAccessContext";
import Can from "../../components/Can";
import getLockImageByModel from "../../utils/getLockImageByModel";
import labelizeRole from "../../utils/labelizeRole";
import tableStatusStyleMapper from "../../utils/tableStatusStyleMapper";
import ImageFocusOverlay from "../ImageFocusOverlay";
import MemberGroupList from "../MemberGroupList";
import StepDetailsDrawerStepInspectionForm from "./StepDetailsDrawerStepInspectionForm";
import StepDetailsDrawerSubmissions from "./StepDetailsDrawerSubmissions";
import WorkOrderDetailsFormQuestion from "./WorkOrderDetailsFormQuestion";

export default function StepDetailsDrawerDetails({
  pageModule,
  hasManagePermission,
  stepIndex,
  editStepDisclosure,
  selectedEditStep,
  variant = "workOrder",
  handleOpenSendReminder,
  workOrderStatus,
  machineOpenByDefault,
  handleOpenAbortStep,
  handleOpenSwitchAssignee,
  abortStepDisclosure,
  switchAssigneeDisclosure,
  workOrderReviewerStatus,
  isFlagged,
  handleFlagSteps,
}) {
  const { isOpen } = useDeleteContext();
  const drawerRef = useRef();
  const [showMore, setShowMore] = useState(false);
  const [openStates, setOpenStates] = useState(
    selectedEditStep?.work_order_step_machines?.map(() =>
      machineOpenByDefault ? [0] : null
    )
  );
  const [multiLockAccessFilter, setMultiLockAccessFilter] = useState("");

  const [imageFocusURL, setImageFocusURL] = useState();
  const imageFocusDisclosure = useDisclosure();

  const userSelector = useSelector((state) => state.login.auth);
  const { bgColor, textColor, icon, text } = tableStatusStyleMapper(
    selectedEditStep?.status
  );
  const editStepQuestionsDisclosure = useDisclosure();
  const { screenToFlowPosition, setNodes, setEdges, getNodes, getEdges } =
    useReactFlow();

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
  const userIsCurrentAssignee = selectedEditStep.assigned_members.some(
    (member) => member?.user?.email === userSelector.email
  );
  const isRemindable =
    selectedEditStep.status === "ongoing" ||
    selectedEditStep.status === "pending";

  function unselectAll() {
    setNodes(getNodes().map((node) => ({ ...node, selected: false })));
    setEdges(getEdges().map((edge) => ({ ...edge, selected: false })));
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !editStepQuestionsDisclosure.isOpen &&
        !abortStepDisclosure?.isOpen &&
        !switchAssigneeDisclosure?.isOpen &&
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
    abortStepDisclosure?.isOpen,
    switchAssigneeDisclosure?.isOpen,
    isOpen,
  ]);
  useEffect(() => {
    setOpenStates(
      selectedEditStep.work_order_step_machines.map(() =>
        machineOpenByDefault ? [0] : null
      )
    );
  }, [selectedEditStep.work_order_step_machines, machineOpenByDefault]);

  return (
    <>
      <Slide
        direction="right"
        in={editStepDisclosure.isOpen}
        style={{ zIndex: 1000, width: "700px" }}
      >
        <Box
          ref={drawerRef}
          position="fixed"
          top="0"
          right="0"
          w={"700px"}
          height="100vh"
          bg="white"
          shadow="md"
          pl={4}
          pt={4}
          zIndex={1000}
        >
          <Flex h={"100%"} w={"100%"} position={"relative"} flexDir={"column"}>
            <Flex
              fontWeight={700}
              borderBottom={"2px solid #bababa"}
              justify={"space-between"}
              // pr={"10px"}
              pr={"10px"}
              pb={"10px"}
            >
              <Flex
                alignItems={"center"}
                gap={"10px"}
                color={"#dc143c"}
                fontSize={"24px"}
                fontWeight={700}
              >
                <Flex gap={"5px"} alignItems={"center"}>
                  <Flex>
                    {selectedEditStep.order ? selectedEditStep.order + "." : ""}
                  </Flex>
                  <Flex>{selectedEditStep.label}</Flex>
                </Flex>
                {variant === "workOrder" ? (
                  <Flex
                    fontWeight={700}
                    borderRadius={"10px"}
                    px={"8px"}
                    py={"4px"}
                    alignItems={"center"}
                    gap={"5px"}
                    bg={bgColor}
                    color={textColor}
                    fontSize={"16px"}
                  >
                    <Flex fontSize={"20px"}>{icon}</Flex>
                    <Flex>{text}</Flex>
                  </Flex>
                ) : (
                  ""
                )}
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
            <Flex
              w={"100%"}
              pt={"20px"}
              pb={"100px"}
              px={"10px"}
              flexDir={"column"}
              fontSize={"14px"}
              overflowY={"auto"}
              gap={"20px"}
            >
              {selectedEditStep?.description ? (
                <Flex flexDir={"column"}>
                  <Flex fontWeight={700}>
                    <Flex alignItems={"center"} gap={"5px"}>
                      Description :
                    </Flex>
                  </Flex>
                  <Flex color={"#848484"}>{selectedEditStep.description}</Flex>
                </Flex>
              ) : (
                ""
              )}

              <Flex flexDir={"column"} gap={"5px"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Assigned to :
                </Box>
                {
                  <MemberGroupList
                    memberArray={selectedEditStep?.assigned_members}
                    hasManagePermission={hasManagePermission}
                    handleOpenSendReminder={
                      isRemindable ? handleOpenSendReminder : ""
                    }
                  />
                }
              </Flex>
              {selectedEditStep?.submitted_by_user ? (
                <Flex flexDir={"column"} gap={"5px"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Submitted By :
                  </Box>
                  <MemberGroupList
                    memberArray={[selectedEditStep?.submitted_by_user]}
                    hasManagePermission={hasManagePermission}
                    handleOpenSendReminder={
                      isRemindable ? handleOpenSendReminder : ""
                    }
                    isDataUserFirst={true}
                  />
                </Flex>
              ) : (
                ""
              )}
              {selectedEditStep?.aborted_by_user ? (
                <Flex flexDir={"column"} gap={"5px"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Aborted By :
                  </Box>
                  <MemberGroupList
                    memberArray={[selectedEditStep?.aborted_by_user]}
                    hasManagePermission={hasManagePermission}
                    handleOpenSendReminder={
                      isRemindable ? handleOpenSendReminder : ""
                    }
                    isDataUserFirst={true}
                  />
                </Flex>
              ) : (
                ""
              )}
              {selectedEditStep.notify ? (
                <>
                  <Flex flexDir={"column"} gap={"5px"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Notified to :
                    </Box>
                    <MemberGroupList
                      memberArray={selectedEditStep.notified_members}
                      hasManagePermission={hasManagePermission}
                      // handleOpenSendReminder={handleOpenSendReminder}
                    />
                  </Flex>
                  {!selectedEditStep.work_order_step_submissions?.length ? (
                    <Flex flexDir={"column"}>
                      <Box fontWeight={700} as="span" flex="1" textAlign="left">
                        Notification message :
                      </Box>
                      <Flex>{selectedEditStep?.notification_message}</Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </>
              ) : (
                ""
              )}
              {selectedEditStep.work_order_step_submissions?.length ? (
                <StepDetailsDrawerSubmissions
                  selectedEditStep={selectedEditStep}
                  setImageFocusURL={setImageFocusURL}
                  machineOpenByDefault={machineOpenByDefault}
                  workOrderStatus={workOrderStatus}
                />
              ) : (
                ""
              )}

              {selectedEditStep.form &&
              !selectedEditStep.work_order_step_submissions?.length ? (
                <Flex flexDir={"column"} gap={"10px"}>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Form :
                    </Box>
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
                        {selectedEditStep.work_order_form_questions.map(
                          (val2, index) => {
                            return (
                              <WorkOrderDetailsFormQuestion
                                val={val2}
                                workOrderStatus={selectedEditStep.status}
                                index={index}
                              />
                            );
                          }
                        )}
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              ) : (
                ""
              )}

              {selectedEditStep?.machine &&
              !selectedEditStep.work_order_step_submissions?.length ? (
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
                                      _hover={{ background: "#ededed" }}
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
              {selectedEditStep.multi_access_lock &&
              !selectedEditStep.work_order_step_submissions?.length ? (
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
                                        responseImageURL.response_image_url.map(
                                          (responseURL) => (
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
                                          )
                                        )
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

              {selectedEditStep.condition &&
              !selectedEditStep.work_order_step_submissions?.length ? (
                <>
                  {selectedEditStep.condition_question && (
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
                  )}
                  {selectedEditStep.status === "completed" ? (
                    <Flex flexDir={"column"}>
                      <Box fontWeight={700} as="span" flex="1" textAlign="left">
                        Condition Response :
                      </Box>
                      <Flex
                        color={
                          selectedEditStep?.response_conditional
                            ? "black"
                            : "#848484"
                        }
                      >
                        {selectedEditStep?.response_conditional}
                      </Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </>
              ) : (
                ""
              )}

              {variant === "review" ? (
                workOrderReviewerStatus === "pending" ? (
                  <Can module={pageModule} permission={["manage"]}>
                    <Flex w={"100%"} gap={"20px"}>
                      <Button
                        position={"static"}
                        onClick={() => handleFlagSteps(stepIndex)}
                        _hover={
                          isFlagged
                            ? { bg: "#b80d2f" }
                            : { bg: "#dc143c", color: "white" }
                        }
                        color={isFlagged ? "white" : "#dc143c"}
                        border={"1px solid #dc143c"}
                        // boxShadow={"0px 0px 3px rgba(220,20,60,1)"}
                        alignItems={"center"}
                        bg={isFlagged ? "#dc143c" : "white"}
                        gap={"8px"}
                      >
                        <Flex fontSize={"20px"}>
                          <FaFlag />
                        </Flex>
                        <Flex fontWeight={700} fontSize={"16px"}>
                          {isFlagged ? "Remove flag" : "Flag as problematic"}
                        </Flex>
                      </Button>
                    </Flex>
                  </Can>
                ) : null
              ) : hasManagePermission &&
                (selectedEditStep.status === "pending" ||
                  selectedEditStep.status === "ongoing") &&
                (workOrderStatus === "ongoing" ||
                  workOrderStatus === "overdue") ? (
                <Can module={pageModule} permission={["manage"]}>
                  <Flex w={"100%"} gap={"20px"}>
                    <Button
                      position={"static"}
                      onClick={() =>
                        handleOpenAbortStep({ ...selectedEditStep, stepIndex })
                      }
                      _hover={{ bg: "#dc143c", color: "white" }}
                      color={"#dc143c"}
                      border={"1px solid #dc143c"}
                      // boxShadow={"0px 0px 3px rgba(220,20,60,1)"}
                      alignItems={"center"}
                      bg={"white"}
                      gap={"8px"}
                    >
                      <Flex fontSize={"20px"}>
                        <TiWarning />
                      </Flex>
                      <Flex fontWeight={700} fontSize={"16px"}>
                        Abort Step
                      </Flex>
                    </Button>
                    <Button
                      position={"static"}
                      onClick={() =>
                        handleOpenSwitchAssignee(
                          { ...selectedEditStep, stepIndex },
                          false
                        )
                      }
                      _hover={{ bg: "#039be5", color: "white" }}
                      color={"#039be5"}
                      border={"1px solid #039be5"}
                      // boxShadow={"0px 0px 3px rgba(220,20,60,1)"}
                      alignItems={"center"}
                      bg={"white"}
                      gap={"8px"}
                    >
                      <Flex fontSize={"20px"}>
                        <FaUserCircle />
                      </Flex>
                      <Flex fontWeight={700} fontSize={"16px"}>
                        Switch Assignee
                      </Flex>
                    </Button>
                  </Flex>
                </Can>
              ) : userIsCurrentAssignee &&
                (selectedEditStep.status === "ongoing" ||
                  selectedEditStep.status === "pending") &&
                (workOrderStatus === "ongoing" ||
                  workOrderStatus === "overdue") ? (
                <Flex w={"100%"} gap={"20px"}>
                  <Button
                    position={"static"}
                    onClick={() =>
                      handleOpenSwitchAssignee(
                        { ...selectedEditStep, stepIndex },
                        true
                      )
                    }
                    _hover={{ bg: "#039be5", color: "white" }}
                    color={"#039be5"}
                    border={"1px solid #039be5"}
                    // boxShadow={"0px 0px 3px rgba(220,20,60,1)"}
                    alignItems={"center"}
                    bg={"white"}
                    gap={"8px"}
                  >
                    <Flex fontSize={"20px"}>
                      <FaUserCircle />
                    </Flex>
                    <Flex fontWeight={700} fontSize={"16px"}>
                      Request Switch Assignee
                    </Flex>
                  </Button>
                </Flex>
              ) : (
                ""
              )}
            </Flex>
          </Flex>
        </Box>
        <ImageFocusOverlay
          imageFocusDisclosure={imageFocusDisclosure}
          imageFocusURL={imageFocusURL}
        />
      </Slide>
    </>
  );
}
