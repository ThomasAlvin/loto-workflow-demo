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
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FaChevronCircleDown,
  FaChevronCircleUp,
  FaChevronDown,
  FaFilter,
  FaRegTrashAlt,
  FaUserAlt,
  FaUserCircle,
} from "react-icons/fa";

import moment from "moment";
import { memo, useState } from "react";
import { FaFlag, FaRegFlag } from "react-icons/fa6";
import { TiWarning } from "react-icons/ti";
import labelizeRole from "../../utils/labelizeRole";
import WorkOrderDetailsFormQuestion from "./WorkOrderDetailsFormQuestion";

import { FiZoomIn } from "react-icons/fi";
import { IoIosLock } from "react-icons/io";
import { TbLineScan } from "react-icons/tb";
import { useSelector } from "react-redux";
import tinycolor from "tinycolor2";
import Can from "../../components/Can";
import dynamicPropsComparator from "../../utils/dynamicPropsComparator";
import formatString from "../../utils/formatString";
import getLockImageByModel from "../../utils/getLockImageByModel";
import tableStatusStyleMapper from "../../utils/tableStatusStyleMapper";
import WorkFlowStepBadges from "../CreateTemplate/WorkFlowStepBadges";
import ImageFocusOverlay from "../ImageFocusOverlay";
import ListEmptyState from "../ListEmptyState";
import MemberGroupList from "../MemberGroupList";
import StepDetailsDrawerSubmissions from "./StepDetailsDrawerSubmissions";
import WorkOrderDetailsStepInspectionForm from "./WorkOrderDetailsStepInspectionForm";

function WorkOrderDetailsStepMemo({
  variant,
  handleFlagSteps,
  isFlagged,
  pageModule,
  index,
  val,
  workOrderStatus,
  workOrderReviewerStatus,
  openByDefault,
  machineOpenByDefault,
  handleOpenAbortStep,
  handleOpenSwitchAssignee,
  isPDF,
  handleOpenSendReminder,
  hasManagePermission,
}) {
  const isMultiAssign = import.meta.env.VITE_MULTI_ASSIGN === "true";

  const userSelector = useSelector((state) => state.login.auth);
  const [showMore, setShowMore] = useState(false);
  const [openStates, setOpenStates] = useState(
    val.work_order_step_machines.map(() => (machineOpenByDefault ? [0] : null))
  );
  const [lockAccessFilter, setLockAccessFilter] = useState("");
  const [multiLockAccessFilter, setMultiLockAccessFilter] = useState("");
  const [imageFocusURL, setImageFocusURL] = useState();
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
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;

  const { bgColor, textColor, icon, text } = tableStatusStyleMapper(
    val?.status
  );
  const multiLockAccessIds =
    val?.work_order_multi_lock_group?.work_order_multi_lock_group_items?.map(
      (item) => item.lockId
    ) || [];
  const lockAccessIds =
    val?.work_order_locks.map((item) => item.lock?.id) || [];
  const multiLockAccessAuditLogs = val?.audit_trails?.filter((log) => {
    return multiLockAccessIds.includes(log.lock?.id);
  });
  const lockAccessAuditLogs = val?.audit_trails?.filter((log) => {
    return lockAccessIds.includes(log.lock?.id);
  });
  function filterByLockName(name, arrList) {
    return arrList.filter((auditLog) => {
      return auditLog.lock.name === name;
    });
  }
  const userIsCurrentAssignee = isMultiAssign
    ? val.assigned_members.some(
        (member) => member?.user?.email === userSelector.email
      )
    : val?.assigned_member?.user?.email === userSelector.email;
  const isRemindable = val.status === "ongoing" || val.status === "pending";
  return (
    <Accordion
      color={"black"}
      defaultIndex={openByDefault ? [0] : ""}
      w={"100%"}
      allowToggle
    >
      <AccordionItem
        shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        border={isPDF ? "1px solid #bababa" : ""}
      >
        <AccordionButton
          opacity={val.status === "upcoming" ? "0.6" : "1"}
          p={0}
          _expanded={{
            boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.2)",
            border: isPDF ? "1px solid #bababa" : "",
          }}
        >
          <Flex
            w={"100%"}
            // borderRadius={"5px"}
            py={"8px"}
            px={"12px"}
            bg={"white"}
            alignItems={"center"}
            justifyContent={"space-between"}
            gap={"10px"}
          >
            <Flex gap={"10px"} alignItems={"center"}>
              <Flex color={"crimson"} fontWeight={700}>
                {index + 1}.
              </Flex>
              <Flex textAlign={"start"} alignItems={"center"} gap={"10px"}>
                <Flex>{val.name}</Flex>
                {variant !== "review" ? (
                  <Flex
                    fontWeight={700}
                    borderRadius={"10px"}
                    px={"8px"}
                    py={"4px"}
                    alignItems={"center"}
                    gap={"8px"}
                    bg={bgColor}
                    color={textColor}
                    fontSize={"14px"}
                  >
                    <Flex fontSize={"18px"}>{icon}</Flex>
                    <Flex>{text}</Flex>
                  </Flex>
                ) : (
                  ""
                )}
              </Flex>
            </Flex>
            <Flex
              cursor={"pointer"}
              color={"#bababa"}
              _hover={{ color: "black" }}
              gap={"10px"}
              alignItems={"center"}
            >
              <WorkFlowStepBadges val={val} />
              {variant === "review" ? (
                workOrderReviewerStatus === "pending" ? (
                  <Tooltip
                    placement="top"
                    hasArrow
                    bg={"#dc143c"}
                    label={isFlagged ? "Remove Flag" : "Flag as problematic"}
                  >
                    <Flex
                      onClick={(event) => {
                        event.stopPropagation();
                        handleFlagSteps(index);
                      }}
                      color={"#dc143c"}
                      fontSize={"20px"}
                    >
                      {isFlagged ? <FaFlag /> : <FaRegFlag />}
                    </Flex>
                  </Tooltip>
                ) : null
              ) : null}
              <AccordionIcon />
            </Flex>
          </Flex>
        </AccordionButton>
        <AccordionPanel py={"16px"}>
          <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
            {val.description ? (
              <Flex flexDir={"column"}>
                <Flex fontWeight={700}>
                  <Flex alignItems={"center"} gap={"5px"}>
                    Description :
                  </Flex>
                </Flex>
                <Flex color={"#848484"}>{val.description}</Flex>
              </Flex>
            ) : (
              ""
            )}

            <Flex flexDir={"column"} gap={"5px"}>
              <Box fontWeight={700} as="span" flex="1" textAlign="left">
                Assigned to :
              </Box>
              {isMultiAssign ? (
                <MemberGroupList
                  memberArray={val.assigned_members}
                  hasManagePermission={hasManagePermission}
                  handleOpenSendReminder={
                    isRemindable ? handleOpenSendReminder : ""
                  }
                />
              ) : (
                <Flex alignItems={"center"} gap={"10px"}>
                  {val.assigned_members?.user.first_name ? (
                    <Avatar
                      key={val.assigned_members.UID + "-" + val.UID}
                      outline={"1px solid #dc143c"}
                      border={"2px solid white"}
                      name={
                        val.assigned_members?.user.first_name +
                        " " +
                        val.assigned_members?.user.last_name
                      }
                      src={
                        val.assigned_members?.user.profile_image_url
                          ? IMGURL +
                            val.assigned_members?.user.profile_image_url
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
                  <Flex flexDir={"column"}>
                    {val.assigned_members ? (
                      <>
                        <Flex>
                          {val.assigned_members?.user.first_name +
                            " " +
                            val.assigned_members?.user.last_name}
                        </Flex>
                        <Flex
                          fontWeight={400}
                          fontSize={"14px"}
                          color={"#848484"}
                        >
                          {val.assigned_members.employee_id +
                            " - " +
                            labelizeRole(val.assigned_members.role)}
                        </Flex>
                      </>
                    ) : (
                      <Flex color={"#848484"}>Not assigned yet</Flex>
                    )}
                  </Flex>
                </Flex>
              )}
            </Flex>
            {val?.submitted_by_user ? (
              <Flex flexDir={"column"} gap={"5px"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Submitted By :
                </Box>
                <MemberGroupList
                  memberArray={[val?.submitted_by_user]}
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
            {val?.aborted_by_user ? (
              <Flex flexDir={"column"} gap={"5px"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Aborted By :
                </Box>
                <MemberGroupList
                  memberArray={[val?.aborted_by_user]}
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

            {val.notify ? (
              <>
                <Flex flexDir={"column"} gap={"5px"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Notified to :
                  </Box>
                  {isMultiAssign ? (
                    <MemberGroupList
                      memberArray={val.notified_members}
                      hasManagePermission={hasManagePermission}
                      // handleOpenSendReminder={handleOpenSendReminder}
                    />
                  ) : (
                    <Flex alignItems={"center"} gap={"10px"}>
                      {val.notified_members?.user.first_name ? (
                        <Avatar
                          outline={"1px solid #dc143c"}
                          border={"2px solid white"}
                          name={
                            val.notified_members?.user.first_name +
                            " " +
                            val.notified_members?.user.last_name
                          }
                          src={
                            val.notified_members?.user.profile_image_url
                              ? IMGURL +
                                val.notified_members?.user.profile_image_url
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
                      <Flex flexDir={"column"}>
                        {val.notified_members ? (
                          <>
                            <Flex>
                              {val.notified_members?.user.first_name +
                                " " +
                                val.notified_members?.user.last_name}
                            </Flex>
                            <Flex
                              fontWeight={400}
                              fontSize={"14px"}
                              color={"#848484"}
                            >
                              {val.notified_members.employee_id +
                                " - " +
                                labelizeRole(val.notified_members.role)}
                            </Flex>
                          </>
                        ) : (
                          <Flex color={"#848484"}>Not assigned yet</Flex>
                        )}
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              </>
            ) : (
              ""
            )}

            {val.work_order_step_submissions?.length ? (
              <StepDetailsDrawerSubmissions
                selectedEditStep={val}
                setImageFocusURL={setImageFocusURL}
                machineOpenByDefault={machineOpenByDefault}
                workOrderStatus={val.status}
              />
            ) : (
              ""
            )}

            {val.form && !val.work_order_step_submissions?.length ? (
              <Flex flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Form :
                  </Box>
                </Flex>
                <Flex w={"100%"}>
                  <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                    {val.status === "completed" ? (
                      <Flex
                        fontSize={"16px"}
                        flexDir={"column"}
                        w={"100%"}
                        gap={"20px"}
                      >
                        {val.work_order_form_questions.map((val2, index) => {
                          return (
                            <WorkOrderDetailsFormQuestion
                              val={val2}
                              workOrderStatus={val.status}
                              index={index}
                              handleImageFocus={handleImageFocus}
                            />
                          );
                        })}
                      </Flex>
                    ) : (
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
                        {val.work_order_form_questions.map((val2, index) => {
                          return (
                            <WorkOrderDetailsFormQuestion
                              val={val2}
                              workOrderStatus={val.status}
                              index={index}
                            />
                          );
                        })}
                      </Flex>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            ) : (
              ""
            )}

            {val?.machine && !val.work_order_step_submissions?.length ? (
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
                        {val.work_order_step_machines?.length === 0 ||
                        !val.work_order_step_machines ? (
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
                          val.work_order_step_machines?.map(
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
                                        : selectedMachine.serial_number || "-"}
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
                </Flex>
                <Flex gap={"10px"}>
                  <Checkbox
                    bg={"white"}
                    borderColor={"#039be5"}
                    isChecked={val?.require_verify_machine}
                    isDisabled
                    size="lg"
                  ></Checkbox>
                  <Flex
                    // fontSize={"14px"}
                    color={val?.require_verify_machine ? "#3182CE" : "black"}
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
                {val?.require_verify_machine && variant !== "review" ? (
                  <Flex flexDir={"column"} gap={"5px"}>
                    <Flex fontWeight={700} textAlign="left">
                      Machine QR/UID Verified By :
                    </Flex>
                    {val?.machine_verified_by_member ? (
                      <Flex alignItems={"center"} gap={"10px"}>
                        {val?.machine_verified_by_member?.user.first_name ? (
                          <Avatar
                            outline={"1px solid #dc143c"}
                            border={"2px solid white"}
                            name={
                              val?.machine_verified_by_member.user.first_name +
                              " " +
                              val?.machine_verified_by_member.user.last_name
                            }
                            src={
                              val?.machine_verified_by_member?.user
                                .profile_image_url
                                ? IMGURL +
                                  val?.machine_verified_by_member.user
                                    ?.profile_image_url
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

                        <Flex flexDir={"column"}>
                          <Flex alignItems={"center"} fontWeight={700}>
                            <Flex>
                              {val?.machine_verified_by_member.user.first_name +
                                " " +
                                val?.machine_verified_by_member.user.last_name}
                            </Flex>
                          </Flex>
                          <Flex
                            color={"#848484"}
                            fontWeight={400}
                            fontSize={"14px"}
                            alignItems={"center"}
                          >
                            {labelizeRole(
                              val?.machine_verified_by_member.role
                            ) +
                              (val?.machine_verified_by_member?.employee_id
                                ? " - " +
                                  val?.machine_verified_by_member.employee_id
                                : "")}
                          </Flex>
                        </Flex>
                      </Flex>
                    ) : (
                      <Flex color={"#848484"}>Not verified yet</Flex>
                    )}
                  </Flex>
                ) : (
                  ""
                )}
              </>
            ) : (
              ""
            )}
            {val.access_lock ? (
              <>
                <Flex flexDir={"column"}>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Assigned Lock :
                    </Box>
                  </Flex>
                  <Flex flexDir={"column"}>
                    {val.work_order_locks.length ? (
                      val.work_order_locks.map((val, lockIndex) => (
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
                                {val.lock?.name || val.name ? (
                                  workOrderStatus === "draft" ? (
                                    val.lock?.name
                                  ) : (
                                    val.name
                                  )
                                ) : (
                                  <Flex color={"#848484"}>
                                    Not assigned yet
                                  </Flex>
                                )}
                              </Flex>
                            </Flex>
                            {/* Disable Require Lock Image */}
                            {/* <Flex gap={"10px"}>
                            <Flex gap={"10px"} alignItems={"center"}>
                              <Checkbox
                                position={"static"}
                                isDisabled
                                defaultChecked={val.require_lock_image}
                              />
                              <Flex
                                color={
                                  val.require_lock_image ? "#3182CE" : "#848484"
                                }
                                fontWeight={700}
                                fontSize={"14px"}
                              >
                                Require Lock Image On Submission
                              </Flex>
                            </Flex>
                          </Flex> */}
                            <Flex gap={"20px"}>
                              {val?.response_image_url?.length
                                ? val.response_image_url.map((responseURL) => (
                                    <Flex
                                      onClick={() => {
                                        handleImageFocus(IMGURL + responseURL);
                                      }}
                                      cursor={"pointer"}
                                      position={"relative"}
                                      role="group"
                                    >
                                      <Flex
                                        _groupHover={{ display: "block" }}
                                        w={"100%"}
                                        display={"none"}
                                        h={"100%"}
                                        bg={"black"}
                                        opacity={0.1}
                                        position={"absolute"}
                                      ></Flex>
                                      <Flex
                                        p={"3px"}
                                        _groupHover={{ display: "block" }}
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
                                        src={IMGURL + responseURL}
                                      ></Image>
                                    </Flex>
                                  ))
                                : ""}
                            </Flex>
                          </Flex>
                        </Flex>
                      ))
                    ) : (
                      <Flex color={"#848484"}>No locks assigned</Flex>
                    )}
                  </Flex>
                </Flex>

                <Flex flexDir={"column"} gap={"10px"}>
                  <Flex justify={"space-between"} alignItems={"center"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Lock Access Audit Logs :
                    </Box>
                    <Flex gap={"10px"} alignItems={"center"}>
                      {lockAccessFilter ? (
                        <Button
                          h={"28px"}
                          border={"1px solid #dc143c"}
                          color={"#dc143c"}
                          bg={"white"}
                          gap={"5px"}
                          px={"12px"}
                          fontSize={"14px"}
                          onClick={() => {
                            setLockAccessFilter("");
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
                            <Flex>{lockAccessFilter || "Filter by lock"}</Flex>
                          </Flex>
                        </MenuButton>
                        <MenuList>
                          {val.work_order_locks.map((lockAccess) => (
                            <MenuItem
                              onClick={() =>
                                setLockAccessFilter(lockAccess?.lock?.name)
                              }
                            >
                              <Flex alignItems={"center"} gap={"10px"}>
                                <Flex flexDir={"column"}>
                                  <Flex fontWeight={700}>
                                    {lockAccess?.lock?.name}
                                  </Flex>
                                  <Flex
                                    fontWeight={400}
                                    fontSize={"14px"}
                                    color={"#848484"}
                                  >
                                    {lockAccess?.lock?.serial_number}
                                  </Flex>
                                </Flex>
                              </Flex>
                            </MenuItem>
                          ))}
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
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Lock
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Date & Time
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Action
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Method
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Method Info
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Location
                            </Th>

                            {/* <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Google Maps
                            </Th> */}
                          </Tr>
                        </Thead>
                        <Tbody>
                          {lockAccessAuditLogs?.length ? (
                            (showMore
                              ? lockAccessFilter
                                ? filterByLockName(
                                    lockAccessFilter,
                                    lockAccessAuditLogs
                                  )
                                : lockAccessAuditLogs
                              : (lockAccessFilter
                                  ? filterByLockName(
                                      lockAccessFilter,
                                      lockAccessAuditLogs
                                    )
                                  : lockAccessAuditLogs
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
                                    px={"20px"}
                                    fontSize={"14px"}
                                  >
                                    <Flex alignItems={"center"} gap={"10px"}>
                                      <Flex
                                        bg={"#dedede"}
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                        h={"48px"}
                                        w={"48px"}
                                      >
                                        <Flex color={"white"} fontSize={"20px"}>
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
                                    px={"20px"}
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    overflowWrap="break-word"
                                    maxWidth="50px"
                                    whiteSpace="normal"
                                    fontSize={"14px"}
                                  >
                                    <Flex flexDir={"column"}>
                                      <Flex color={"black"} fontWeight={700}>
                                        {moment(val.time).format("YYYY-MM-DD")}
                                      </Flex>
                                      <Flex color={"#848484"} fontSize={"14px"}>
                                        {moment(val.time).format("hh:mm A")}
                                      </Flex>
                                    </Flex>
                                  </Td>

                                  {/* <Td
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    px={"20px"}
                                    fontSize={"14px"}
                                  >
                                    <Flex alignItems={"center"} gap={"10px"}>
                                      {val.user.first_name ? (
                                        <Avatar
                                          outline={"1px solid #dc143c"}
                                          border={"2px solid white"}
                                          name={
                                            val.user.first_name +
                                            " " +
                                            val.user.last_name
                                          }
                                          src={
                                            val.user.profile_image_url
                                              ? IMGURL +
                                                val.user.profile_image_url
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
                                          <Flex
                                            color={"white"}
                                            fontSize={"24px"}
                                          >
                                            <FaUserAlt />
                                          </Flex>
                                        </Flex>
                                      )}
                                      <Flex flexDir={"column"}>
                                        <Flex fontWeight={700} color={"black"}>
                                          {val?.user?.first_name +
                                            " " +
                                            val?.user?.last_name}
                                        </Flex>
                                        <Flex
                                          fontSize={"14px"}
                                          color={"#848484"}
                                        >
                                          {val?.user.is_superadmin
                                            ? "Super Admin"
                                            : labelizeRole(
                                                val?.user.member?.role
                                              ) +
                                              " - " +
                                              val?.user.member?.employee_id}
                                        </Flex>
                                      </Flex>
                                    </Flex>
                                  </Td> */}
                                  <Td
                                    borderBottomColor={"#bababa"}
                                    fontSize={"14px"}
                                    px={"20px"}
                                  >
                                    <Flex>
                                      <Flex
                                        fontWeight={700}
                                        borderRadius={"10px"}
                                        px={"8px"}
                                        py={"4px"}
                                        alignItems={"center"}
                                        gap={"8px"}
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
                                    fontSize={"14px"}
                                    px={"20px"}
                                    color={"#848484"}
                                  >
                                    <Flex>{formatString(val.method)}</Flex>
                                  </Td>

                                  <Td
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    whiteSpace="normal"
                                    wordBreak="break-word"
                                    px={"20px"}
                                    fontSize={"14px"}
                                  >
                                    <Flex>{val.method_info}</Flex>
                                  </Td>
                                  <Td
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    whiteSpace="normal"
                                    wordBreak="break-word"
                                    px={"20px"}
                                    fontSize={"14px"}
                                  >
                                    <Flex>{val.placemark || "-"}</Flex>
                                  </Td>
                                </Tr>
                              );
                            })
                          ) : (
                            <ListEmptyState
                              size={"sm"}
                              colSpan={6}
                              header1={"No history found."}
                              header2={
                                "No actions have been taken on the assigned locks."
                              }
                              linkText={"Create an action"}
                            />
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                    {lockAccessAuditLogs?.length > 3 ? (
                      <Flex
                        cursor={"pointer"}
                        _hover={{
                          color: tinycolor("#dc143c").darken(8).toString(),
                        }}
                        pr={"10px"}
                        justify={"end"}
                        alignItems={"center"}
                        color={"#dc143c"}
                        fontWeight={700}
                        gap={"5px"}
                        onClick={() => setShowMore((prevState) => !prevState)}
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
                    ) : (
                      ""
                    )}
                  </Flex>
                </Flex>
              </>
            ) : (
              ""
            )}
            {val.multi_access_lock &&
            !val.work_order_step_submissions?.length ? (
              <>
                <Flex flexDir={"column"}>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      {val.work_order_multi_lock_group.is_pre_assigned
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
                        {val.work_order_multi_lock_group
                          ?.work_order_multi_lock_group_items?.length + " "}
                        Locks Selected)
                      </Box>{" "}
                      :
                    </Box>
                  </Flex>

                  <Flex flexDir={"column"} gap={"10px"}>
                    <Flex flexDir={"column"}>
                      <Flex gap={"10px"} flexDir={"column"}>
                        {val.work_order_multi_lock_group
                          .work_order_multi_lock_group_items?.length ? (
                          val.work_order_multi_lock_group.work_order_multi_lock_group_items.map(
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
                                        val.id
                                    )
                                    .map((responseImageURL) =>
                                      responseImageURL?.response_image_url?.map(
                                        (responseURL) => (
                                          <Flex
                                            onClick={() => {
                                              handleImageFocus(
                                                IMGURL + responseURL
                                              );
                                            }}
                                            cursor={"pointer"}
                                            position={"relative"}
                                            role="group"
                                          >
                                            <Flex
                                              _groupHover={{ display: "block" }}
                                              w={"100%"}
                                              display={"none"}
                                              h={"100%"}
                                              bg={"black"}
                                              opacity={0.1}
                                              position={"absolute"}
                                            ></Flex>
                                            <Flex
                                              p={"3px"}
                                              _groupHover={{ display: "block" }}
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
                                              src={IMGURL + responseURL}
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

                        {/* Disable Require Lock Image */}
                        {/* <Flex gap={"10px"}>
                          <Flex gap={"10px"} alignItems={"center"}>
                            <Checkbox
                              position={"static"}
                              isDisabled
                              defaultChecked={
                                val.work_order_multi_lock_group
                                  .require_lock_image
                              }
                            />
                            <Flex
                              color={
                                val.work_order_multi_lock_group
                                  .require_lock_image
                                  ? "#3182CE"
                                  : "#848484"
                              }
                              fontWeight={700}
                              fontSize={"14px"}
                            >
                              Require Lock Image On Submission
                            </Flex>
                          </Flex>
                        </Flex> */}
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
                {/* <Flex gap={"20px"}>
                  {val.work_order_multi_lock_group_item_responses.map(
                    (multiLockImage) =>
                      multiLockImage.response_image_url.map((responseURL) => {
                        return (
                          <Flex
                            onClick={() => {
                              handleImageFocus(IMGURL + responseURL);
                            }}
                            cursor={"pointer"}
                            position={"relative"}
                            role="group"
                          >
                            <Flex
                              _groupHover={{ display: "block" }}
                              w={"100%"}
                              display={"none"}
                              h={"100%"}
                              bg={"black"}
                              opacity={0.1}
                              position={"absolute"}
                            ></Flex>
                            <Flex
                              p={"3px"}
                              _groupHover={{ display: "block" }}
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
                              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                              src={IMGURL + responseURL}
                            ></Image>
                          </Flex>
                        );
                      })
                  )}
                </Flex> */}
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
                          {val.work_order_multi_lock_group_items?.map(
                            (multiLockAccess) => (
                              <MenuItem
                                onClick={() =>
                                  setMultiLockAccessFilter(multiLockAccess.name)
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
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Lock
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Date & Time
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Action
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Method
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Method Info
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Location
                            </Th>
                            {/* <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Google Maps
                            </Th> */}
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
                                    px={"20px"}
                                    fontSize={"14px"}
                                  >
                                    <Flex alignItems={"center"} gap={"10px"}>
                                      <Flex
                                        bg={"#dedede"}
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                        h={"48px"}
                                        w={"48px"}
                                      >
                                        <Flex color={"white"} fontSize={"20px"}>
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
                                    px={"20px"}
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    overflowWrap="break-word"
                                    maxWidth="50px"
                                    whiteSpace="normal"
                                    fontSize={"14px"}
                                  >
                                    <Flex flexDir={"column"}>
                                      <Flex color={"black"} fontWeight={700}>
                                        {moment(val.time).format("YYYY-MM-DD")}
                                      </Flex>
                                      <Flex color={"#848484"} fontSize={"14px"}>
                                        {moment(val.time).format("hh:mm A")}
                                      </Flex>
                                    </Flex>
                                  </Td>

                                  <Td
                                    borderBottomColor={"#bababa"}
                                    fontSize={"14px"}
                                    px={"20px"}
                                  >
                                    <Flex>
                                      <Flex
                                        fontWeight={700}
                                        borderRadius={"10px"}
                                        px={"8px"}
                                        py={"4px"}
                                        alignItems={"center"}
                                        gap={"8px"}
                                        bg={bgColor}
                                        color={textColor}
                                      >
                                        <Flex fontSize={"20px"}>{icon}</Flex>
                                        <Flex>{text}</Flex>
                                      </Flex>
                                    </Flex>
                                  </Td>
                                  {/* <Td
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    px={"20px"}
                                    fontSize={"14px"}
                                  >
                                    <Flex alignItems={"center"} gap={"10px"}>
                                      {val.user.first_name ? (
                                        <Avatar
                                          outline={"1px solid #dc143c"}
                                          border={"2px solid white"}
                                          name={
                                            val.user.first_name +
                                            " " +
                                            val.user.last_name
                                          }
                                          src={
                                            val.user.profile_image_url
                                              ? IMGURL +
                                                val.user.profile_image_url
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
                                          <Flex
                                            color={"white"}
                                            fontSize={"24px"}
                                          >
                                            <FaUserAlt />
                                          </Flex>
                                        </Flex>
                                      )}
                                      <Flex flexDir={"column"}>
                                        <Flex fontWeight={700} color={"black"}>
                                          {val?.user?.first_name +
                                            " " +
                                            val?.user?.last_name}
                                        </Flex>
                                        <Flex
                                          fontSize={"14px"}
                                          color={"#848484"}
                                        >
                                          {val?.user.is_superadmin
                                            ? "Super Admin"
                                            : labelizeRole(
                                                val?.user.member?.role
                                              ) +
                                              " - " +
                                              val?.user.member?.employee_id}
                                        </Flex>
                                      </Flex>
                                    </Flex>
                                  </Td> */}
                                  <Td
                                    px={"20px"}
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    overflowWrap="break-word"
                                    maxWidth="50px"
                                    whiteSpace="normal"
                                    fontSize={"14px"}
                                  >
                                    <Flex color={"#848484"} fontSize={"14px"}>
                                      {formatString(val.method)}
                                    </Flex>
                                  </Td>

                                  <Td
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    whiteSpace="normal"
                                    wordBreak="break-word"
                                    px={"20px"}
                                    fontSize={"14px"}
                                  >
                                    <Flex>{val.method_info}</Flex>
                                  </Td>
                                  <Td
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    whiteSpace="normal"
                                    wordBreak="break-word"
                                    px={"20px"}
                                    fontSize={"14px"}
                                  >
                                    <Flex>{val.placemark || "-"}</Flex>
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
                          onClick={() => setShowMore((prevState) => !prevState)}
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
            {val.trigger_api ? (
              <>
                {val.title_trigger_api && (
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Trigger API external system key :
                    </Box>
                    <Flex color={val.title_trigger_api ? "black" : "#848484"}>
                      {val.title_trigger_api}
                    </Flex>
                  </Flex>
                )}
              </>
            ) : (
              ""
            )}
            {val.condition && !val.work_order_step_submissions?.length ? (
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
                {val.status === "completed" ? (
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Condition Response :
                    </Box>
                    <Flex
                      color={val?.response_conditional ? "black" : "#848484"}
                    >
                      {val?.response_conditional}
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
                      onClick={() => handleFlagSteps(index)}
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
                        {/* <FaRegFlag /> */}
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
              (val.status === "pending" || val.status === "ongoing") &&
              (workOrderStatus === "ongoing" ||
                workOrderStatus === "overdue") ? (
              <Can module={pageModule} permission={["manage"]}>
                <Flex w={"100%"} gap={"20px"}>
                  <Button
                    position={"static"}
                    onClick={() => handleOpenAbortStep({ ...val, index })}
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
                      handleOpenSwitchAssignee({ ...val, index }, false)
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
              (val.status === "ongoing" || val.status === "pending") &&
              (workOrderStatus === "ongoing" ||
                workOrderStatus === "overdue") ? (
              <Flex w={"100%"} gap={"20px"}>
                <Button
                  position={"static"}
                  onClick={() =>
                    handleOpenSwitchAssignee({ ...val, index }, true)
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
        </AccordionPanel>
      </AccordionItem>
      <ImageFocusOverlay
        imageFocusDisclosure={imageFocusDisclosure}
        imageFocusURL={imageFocusURL}
      />
    </Accordion>
  );
}

const WorkOrderDetailsStep = memo(
  WorkOrderDetailsStepMemo,
  dynamicPropsComparator
);
export default WorkOrderDetailsStep;
