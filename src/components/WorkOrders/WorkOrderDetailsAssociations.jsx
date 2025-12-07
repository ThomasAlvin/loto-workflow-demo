import { Avatar, Button, Flex, Image, Tooltip } from "@chakra-ui/react";
import LabelizeRole from "../../utils/LabelizeRole";
import {
  FaRegEdit,
  FaTools,
  FaUser,
  FaUserAlt,
  FaUserEdit,
  FaUserTie,
} from "react-icons/fa";
import { FaRegBell, FaRegUser, FaUserPen, FaWrench } from "react-icons/fa6";
import { MdImageNotSupported } from "react-icons/md";
import { IoIosLock } from "react-icons/io";
import { LuClipboardPen } from "react-icons/lu";
import GetLockImageByModel from "../../utils/getLockImageByModel";

export default function WorkOrderDetailsAssociation({
  variant,
  workOrder,
  hasManagePermission,
  handleOpenSendReminder,
}) {
  const isMultiAssign = import.meta.env.VITE_MULTI_ASSIGN === "true";
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const creatorInfo = workOrder?.creator?.is_superadmin
    ? { ...workOrder?.creator, role: LabelizeRole("super_admin") }
    : {
        ...workOrder?.creator,
        first_name: workOrder?.creator?.first_name,
        last_name: workOrder?.creator?.last_name,
        role: LabelizeRole(workOrder?.creator?.member?.role),
        employee_id: workOrder?.creator?.member?.employee_id,
      };
  const uniqueRemindableAssigneesSet = new Set();
  const remindableAssignees = [];
  workOrder?.work_order_steps
    ?.filter((step) => step.status === "ongoing" || step.status === "pending")
    .map((step) =>
      step.assigned_members.map((assignee) => {
        if (
          assignee?.user.email &&
          !uniqueRemindableAssigneesSet.has(assignee.user.email)
        ) {
          uniqueRemindableAssigneesSet.add(assignee.user.email);
          remindableAssignees.push(assignee);
        }
      })
    );
  console.log(remindableAssignees);

  return (
    <Flex minW={"400px"} flexDir={"column"} gap={"20px"}>
      <Flex
        bg={"white"}
        flexDir={"column"}
        w={"100%"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        p={"20px"}
      >
        <Flex flexDir={"column"} gap={"20px"}>
          <Flex
            fontSize={"20px"}
            fontWeight={700}
            color={"#dc143c"}
            justifyContent={"space-between"}
          >
            <Flex>Creator</Flex>
            <Flex
              borderRadius={"20px"}
              gap={"5px"}
              fontSize={"14px"}
              alignItems={"center"}
              // bg={"#f8f9fa"}
              px={"12px"}
              pr={"9px"}
              py={"5px"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              // border={"1px solid #bababa"}
            >
              <Flex>
                <FaUserTie />
              </Flex>
              <Flex>1</Flex>
            </Flex>
          </Flex>
          <Flex w={"100%"} flexDir={"column"} justify={"center"}>
            <Flex
              cursor={"pointer"}
              _hover={{ bg: "#ededed" }}
              transition={"background-color 0.2s ease"}
              alignItems={"center"}
              p={"8px"}
              justify={"space-between"}
            >
              <Flex alignItems={"center"} gap={"10px"}>
                {creatorInfo?.first_name ? (
                  <Avatar
                    outline={"1px solid #dc143c"}
                    border={"2px solid white"}
                    name={creatorInfo.first_name + " " + creatorInfo.last_name}
                    src={
                      creatorInfo?.profile_image_url
                        ? IMGURL + creatorInfo?.profile_image_url
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
                      {creatorInfo.first_name + " " + creatorInfo.last_name}
                    </Flex>
                  </Flex>
                  <Flex
                    color={"#848484"}
                    fontWeight={400}
                    fontSize={"14px"}
                    alignItems={"center"}
                  >
                    {creatorInfo.role +
                      (creatorInfo?.employee_id
                        ? " - " + creatorInfo.employee_id
                        : "")}
                    {/* {LabelizeRole(assignee.role) + " - " + assignee.employee_id} */}
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        bg={"white"}
        flexDir={"column"}
        w={"100%"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        p={"20px"}
      >
        <Flex flexDir={"column"} gap={"20px"}>
          <Flex
            fontSize={"20px"}
            fontWeight={700}
            color={"#dc143c"}
            justifyContent={"space-between"}
          >
            <Flex>Co-Creator</Flex>
            <Flex
              borderRadius={"20px"}
              gap={"5px"}
              fontSize={"14px"}
              alignItems={"center"}
              // bg={"#f8f9fa"}
              px={"12px"}
              py={"5px"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              // border={"1px solid #bababa"}
            >
              <Flex fontSize={"16px"}>
                <FaUserEdit />
              </Flex>
              {isMultiAssign ? (
                <Flex>{workOrder?.co_creator_members.length}</Flex>
              ) : (
                <Flex>
                  {workOrder?.co_creator_member?.user?.first_name ? 1 : 0}
                </Flex>
              )}
            </Flex>
          </Flex>
          <Flex w={"100%"} flexDir={"column"} justify={"center"}>
            {isMultiAssign ? (
              workOrder?.co_creator_members.length ? (
                workOrder?.co_creator_members.map((co_creator_member) => (
                  <Flex
                    cursor={"pointer"}
                    _hover={{ bg: "#ededed" }}
                    transition={"background-color 0.2s ease"}
                    alignItems={"center"}
                    p={"8px"}
                    justify={"space-between"}
                  >
                    <Flex alignItems={"center"} gap={"10px"}>
                      {co_creator_member?.user?.first_name ? (
                        <Avatar
                          outline={"1px solid #dc143c"}
                          border={"2px solid white"}
                          name={
                            co_creator_member?.user?.first_name +
                            " " +
                            co_creator_member?.user?.last_name
                          }
                          src={
                            co_creator_member?.user.profile_image_url
                              ? IMGURL +
                                co_creator_member?.user.profile_image_url
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
                            {co_creator_member?.user?.first_name +
                              " " +
                              co_creator_member?.user?.last_name}
                          </Flex>
                        </Flex>
                        <Flex
                          color={"#848484"}
                          fontWeight={400}
                          fontSize={"14px"}
                          alignItems={"center"}
                        >
                          {" "}
                          {LabelizeRole(co_creator_member?.role) +
                            " - " +
                            co_creator_member?.employee_id}
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                ))
              ) : (
                <Flex
                  w={"100%"}
                  h={"80px"}
                  justify={"center"}
                  flexDir={"column"}
                  gap={"5px"}
                >
                  <Flex
                    fontSize={"16px"}
                    fontWeight={700}
                    justify={"center"}
                    alignItems={"center"}
                    color={"black"}
                  >
                    <Flex>No Co-Creator were assigned!</Flex>
                  </Flex>
                  <Flex
                    justify={"center"}
                    color={"#848484"}
                    fontWeight={700}
                    textAlign={"center"}
                  >
                    This work order has no assigned Co-Creator
                  </Flex>
                </Flex>
              )
            ) : workOrder?.co_creator_member?.user?.first_name ? (
              <Flex
                cursor={"pointer"}
                _hover={{ bg: "#ededed" }}
                transition={"background-color 0.2s ease"}
                alignItems={"center"}
                p={"8px"}
                justify={"space-between"}
              >
                <Flex alignItems={"center"} gap={"10px"}>
                  {workOrder?.co_creator_member?.user?.first_name ? (
                    <Avatar
                      outline={"1px solid #dc143c"}
                      border={"2px solid white"}
                      name={
                        workOrder?.co_creator_member?.user?.first_name +
                        " " +
                        workOrder?.co_creator_member?.user?.last_name
                      }
                      src={
                        workOrder?.co_creator_member?.user.profile_image_url
                          ? IMGURL +
                            workOrder?.co_creator_member?.user.profile_image_url
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
                        {workOrder?.co_creator_member?.user?.first_name +
                          " " +
                          workOrder?.co_creator_member?.user?.last_name}
                      </Flex>
                    </Flex>
                    <Flex
                      color={"#848484"}
                      fontWeight={400}
                      fontSize={"14px"}
                      alignItems={"center"}
                    >
                      {" "}
                      {LabelizeRole(workOrder?.co_creator_member.role) +
                        " - " +
                        workOrder?.co_creator_member.employee_id}
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            ) : (
              <Flex
                w={"100%"}
                h={"80px"}
                justify={"center"}
                flexDir={"column"}
                gap={"5px"}
              >
                <Flex
                  fontSize={"16px"}
                  fontWeight={700}
                  justify={"center"}
                  alignItems={"center"}
                  color={"black"}
                >
                  <Flex>No Co-Creator were assigned!</Flex>
                </Flex>
                <Flex
                  justify={"center"}
                  color={"#848484"}
                  fontWeight={700}
                  textAlign={"center"}
                >
                  This work order has no assigned Co-Creator
                </Flex>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
      <Flex
        bg={"white"}
        flexDir={"column"}
        w={"100%"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        p={"20px"}
      >
        <Flex flexDir={"column"} gap={"20px"}>
          <Flex
            fontSize={"20px"}
            fontWeight={700}
            color={"#dc143c"}
            justifyContent={"space-between"}
          >
            <Flex
              onClick={() => {
                console.log(remindableAssignees);
                console.log(workOrder?.assignees);
              }}
            >
              Assignees
            </Flex>
            <Flex
              borderRadius={"20px"}
              gap={"5px"}
              fontSize={"14px"}
              alignItems={"center"}
              // bg={"#f8f9fa"}
              px={"12px"}
              py={"5px"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              // border={"1px solid #bababa"}
            >
              <Flex>
                <FaUser />
              </Flex>
              <Flex>{workOrder?.assignees.length}</Flex>
            </Flex>
          </Flex>
          <Flex w={"100%"} flexDir={"column"} justify={"center"}>
            {workOrder?.assignees?.length === 0 || !workOrder?.assignees ? (
              <Flex
                w={"100%"}
                h={"80px"}
                justify={"center"}
                flexDir={"column"}
                gap={"5px"}
              >
                <Flex
                  fontSize={"16px"}
                  fontWeight={700}
                  justify={"center"}
                  alignItems={"center"}
                  color={"black"}
                >
                  <Flex>No members were assigned!</Flex>
                </Flex>
                <Flex
                  justify={"center"}
                  color={"#848484"}
                  fontWeight={700}
                  textAlign={"center"}
                >
                  This work order has no assigned <br /> members
                </Flex>
              </Flex>
            ) : (
              workOrder?.assignees.map((assignee, index) => (
                <Flex
                  cursor={"pointer"}
                  _hover={{ bg: "#ededed" }}
                  transition={"background-color 0.2s ease"}
                  alignItems={"center"}
                  p={"8px"}
                  justify={"space-between"}
                >
                  <Flex alignItems={"center"} gap={"10px"}>
                    {assignee?.user.first_name ? (
                      <Avatar
                        key={assignee.UID}
                        outline={"1px solid #dc143c"}
                        border={"2px solid white"}
                        name={
                          assignee?.user.first_name +
                          " " +
                          assignee?.user.last_name
                        }
                        src={
                          assignee?.user.profile_image_url
                            ? IMGURL + assignee?.user.profile_image_url
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
                          {assignee.user.first_name +
                            " " +
                            assignee.user.last_name}
                        </Flex>
                      </Flex>
                      <Flex
                        color={"#848484"}
                        fontWeight={400}
                        fontSize={"14px"}
                        alignItems={"center"}
                      >
                        {LabelizeRole(assignee.role) +
                          " - " +
                          assignee.employee_id}
                      </Flex>
                    </Flex>
                  </Flex>
                  {variant !== "review" &&
                    hasManagePermission &&
                    remindableAssignees?.some(
                      (remindableAssignee) =>
                        remindableAssignee.UID === assignee.UID
                    ) && (
                      <Flex>
                        <Tooltip
                          hasArrow
                          openDelay={300}
                          closeDelay={100}
                          bg={"#dc143c"}
                          placement="top"
                          label="Send Reminder"
                        >
                          <Button
                            onClick={() => {
                              handleOpenSendReminder(
                                {
                                  ...assignee,
                                  first_name: assignee.user.first_name,
                                  last_name: assignee.user_last_name,
                                },
                                "assignee"
                              );
                            }}
                            position={"static"}
                            _hover={{ bg: "#dc143c", color: "white" }}
                            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                            bg={"white"}
                            color={"#dc143c"}
                            h={"auto"}
                            p={"12px"}
                            borderRadius={"100%"}
                          >
                            <Flex w={"16px"} h={"16px"}>
                              <FaRegBell />
                            </Flex>
                          </Button>
                        </Tooltip>
                      </Flex>
                    )}
                </Flex>
              ))
            )}
          </Flex>
        </Flex>
      </Flex>
      <Flex
        bg={"white"}
        flexDir={"column"}
        w={"100%"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        p={"20px"}
      >
        <Flex flexDir={"column"} gap={"20px"}>
          <Flex
            fontSize={"20px"}
            fontWeight={700}
            color={"#dc143c"}
            justifyContent={"space-between"}
          >
            <Flex>Notified Members</Flex>
            <Flex
              borderRadius={"20px"}
              gap={"5px"}
              fontSize={"14px"}
              alignItems={"center"}
              // bg={"#f8f9fa"}
              px={"12px"}
              py={"5px"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              // border={"1px solid #bababa"}
            >
              <Flex>
                <FaUser />
              </Flex>
              <Flex>{workOrder?.notifiedMembers?.length}</Flex>
            </Flex>
          </Flex>
          <Flex w={"100%"} flexDir={"column"} justify={"center"}>
            {workOrder?.notifiedMembers?.length === 0 ||
            !workOrder?.notifiedMembers ? (
              <Flex
                w={"100%"}
                h={"80px"}
                justify={"center"}
                flexDir={"column"}
                gap={"5px"}
              >
                <Flex
                  fontSize={"16px"}
                  fontWeight={700}
                  justify={"center"}
                  alignItems={"center"}
                  color={"black"}
                >
                  <Flex>No members were notified!</Flex>
                </Flex>
                <Flex
                  justify={"center"}
                  color={"#848484"}
                  fontWeight={700}
                  textAlign={"center"}
                >
                  This work order has no notified members.
                </Flex>
              </Flex>
            ) : (
              workOrder?.notifiedMembers.map((notifiedMember, index) => (
                <Flex
                  cursor={"pointer"}
                  transition={"background-color 0.2s ease"}
                  _hover={{ bg: "#ededed" }}
                  alignItems={"center"}
                  p={"8px"}
                  justify={"space-between"}
                >
                  <Flex alignItems={"center"} gap={"10px"}>
                    {notifiedMember?.user.first_name ? (
                      <Avatar
                        outline={"1px solid #dc143c"}
                        border={"2px solid white"}
                        name={
                          notifiedMember?.user.first_name +
                          " " +
                          notifiedMember?.user.last_name
                        }
                        src={
                          notifiedMember?.user.profile_image_url
                            ? IMGURL + notifiedMember?.user.profile_image_url
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
                      <Flex fontWeight={700}>
                        {notifiedMember.user.first_name +
                          " " +
                          notifiedMember.user.last_name}
                      </Flex>
                      <Flex
                        fontWeight={400}
                        fontSize={"14px"}
                        color={"#848484"}
                      >
                        {notifiedMember.employee_id +
                          " - " +
                          LabelizeRole(notifiedMember.role)}
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              ))
            )}
          </Flex>
        </Flex>
      </Flex>
      <Flex
        bg={"white"}
        flexDir={"column"}
        w={"100%"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        p={"20px"}
      >
        <Flex flexDir={"column"} gap={"20px"}>
          <Flex
            fontSize={"20px"}
            fontWeight={700}
            color={"#dc143c"}
            justifyContent={"space-between"}
          >
            <Flex>Assigned Machines</Flex>
            <Flex
              gap={"5px"}
              fontSize={"14px"}
              borderRadius={"20px"}
              alignItems={"center"}
              px={"12px"}
              py={"5px"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
            >
              <Flex>
                <FaWrench />
              </Flex>
              <Flex>{workOrder?.assignedMachines?.length}</Flex>
            </Flex>
          </Flex>
          <Flex w={"100%"} flexDir={"column"} justify={"center"}>
            {workOrder?.assignedMachines?.length === 0 ||
            !workOrder?.assignedMachines ? (
              <Flex
                w={"100%"}
                h={"80px"}
                justify={"center"}
                flexDir={"column"}
                gap={"5px"}
              >
                <Flex
                  fontSize={"16px"}
                  fontWeight={700}
                  justify={"center"}
                  alignItems={"center"}
                  color={"black"}
                >
                  <Flex>No machines were assigned!</Flex>
                </Flex>
                <Flex
                  justify={"center"}
                  color={"#848484"}
                  fontWeight={700}
                  textAlign={"center"}
                >
                  This work order has no assigned machines.
                </Flex>
              </Flex>
            ) : (
              workOrder?.assignedMachines.map((assignedMachine, index) => (
                <Flex
                  cursor={"pointer"}
                  transition={"background-color 0.2s ease"}
                  _hover={{ bg: "#ededed" }}
                  alignItems={"center"}
                  p={"8px"}
                  justify={"space-between"}
                >
                  <Flex alignItems={"center"} gap={"10px"}>
                    <Flex
                      bg={
                        assignedMachine.main_image_url
                          ? "transparent"
                          : "#dedede"
                      }
                      justifyContent={"center"}
                      alignItems={"center"}
                      h={"48px"}
                      w={"48px"}
                    >
                      <Flex color={"white"} fontSize={"20px"}>
                        {assignedMachine.main_image_url ? (
                          <Image
                            src={
                              assignedMachine.main_image_url
                                ? IMGURL + assignedMachine.main_image_url
                                : null
                            }
                          />
                        ) : (
                          <FaTools />
                        )}
                      </Flex>
                    </Flex>
                    <Flex flexDir={"column"}>
                      <Flex fontWeight={700}>{assignedMachine.name}</Flex>
                      <Flex
                        fontWeight={400}
                        fontSize={"14px"}
                        color={"#848484"}
                      >
                        {assignedMachine.model}
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              ))
            )}
          </Flex>
        </Flex>
      </Flex>
      <Flex
        bg={"white"}
        flexDir={"column"}
        w={"100%"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        p={"20px"}
      >
        <Flex flexDir={"column"} gap={"20px"}>
          <Flex
            fontSize={"20px"}
            fontWeight={700}
            color={"#dc143c"}
            justifyContent={"space-between"}
          >
            <Flex>Assigned Locks</Flex>
            <Flex
              borderRadius={"20px"}
              gap={"5px"}
              fontSize={"14px"}
              alignItems={"center"}
              px={"12px"}
              py={"5px"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
            >
              <Flex>
                <IoIosLock />
              </Flex>
              <Flex>{workOrder?.assignedLocks?.length}</Flex>
            </Flex>
          </Flex>
          <Flex w={"100%"} flexDir={"column"} justify={"center"}>
            {workOrder?.assignedLocks?.length === 0 ||
            !workOrder?.assignedLocks ? (
              <Flex
                w={"100%"}
                h={"80px"}
                justify={"center"}
                flexDir={"column"}
                gap={"5px"}
              >
                <Flex
                  fontSize={"16px"}
                  fontWeight={700}
                  justify={"center"}
                  alignItems={"center"}
                  color={"black"}
                >
                  <Flex>No locks were assigned!</Flex>
                </Flex>
                <Flex
                  justify={"center"}
                  color={"#848484"}
                  fontWeight={700}
                  textAlign={"center"}
                >
                  This work order has no assigned locks.
                </Flex>
              </Flex>
            ) : (
              workOrder?.assignedLocks.map((assignedLock, index) => (
                <Flex
                  cursor={"pointer"}
                  transition={"background-color 0.2s ease"}
                  _hover={{ bg: "#ededed" }}
                  alignItems={"center"}
                  p={"8px"}
                  justify={"space-between"}
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
                        {assignedLock.model ? (
                          <Image
                            src={GetLockImageByModel(assignedLock.model)}
                          />
                        ) : (
                          <IoIosLock />
                        )}
                      </Flex>
                    </Flex>
                    <Flex flexDir={"column"}>
                      <Flex fontWeight={700}>{assignedLock.name}</Flex>
                      <Flex
                        fontWeight={400}
                        fontSize={"14px"}
                        color={"#848484"}
                      >
                        {assignedLock.model}
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              ))
            )}
          </Flex>
        </Flex>
      </Flex>
      <Flex
        bg={"white"}
        flexDir={"column"}
        w={"100%"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        p={"20px"}
      >
        <Flex flexDir={"column"} gap={"20px"}>
          <Flex
            fontSize={"20px"}
            fontWeight={700}
            color={"#dc143c"}
            justifyContent={"space-between"}
          >
            <Flex>Assigned Reviewers</Flex>
            <Flex
              borderRadius={"20px"}
              gap={"5px"}
              fontSize={"14px"}
              alignItems={"center"}
              px={"12px"}
              py={"5px"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
            >
              <Flex>
                <LuClipboardPen />
              </Flex>
              <Flex>{workOrder?.assignedReviewers?.length || 0}</Flex>
            </Flex>
          </Flex>
          <Flex w={"100%"} flexDir={"column"} justify={"center"}>
            {workOrder?.assignedReviewers?.length === 0 ||
            !workOrder?.assignedReviewers ? (
              <Flex
                w={"100%"}
                h={"80px"}
                justify={"center"}
                flexDir={"column"}
                gap={"5px"}
              >
                <Flex
                  fontSize={"16px"}
                  fontWeight={700}
                  justify={"center"}
                  alignItems={"center"}
                  color={"black"}
                >
                  <Flex>No reviewers were assigned!</Flex>
                </Flex>
                <Flex
                  justify={"center"}
                  color={"#848484"}
                  fontWeight={700}
                  textAlign={"center"}
                >
                  This work order has no assigned reviewers.
                </Flex>
              </Flex>
            ) : (
              workOrder?.assignedReviewers.map((assignedReviewer, index) => (
                <Flex
                  onClick={() => {
                    console.log(assignedReviewer);
                  }}
                  cursor={"pointer"}
                  transition={"background-color 0.2s ease"}
                  _hover={{ bg: "#ededed" }}
                  alignItems={"center"}
                  p={"8px"}
                  justify={"space-between"}
                >
                  <Flex alignItems={"center"} gap={"10px"}>
                    {assignedReviewer.first_name ? (
                      <Avatar
                        outline={"1px solid #dc143c"}
                        border={"2px solid white"}
                        name={
                          assignedReviewer.first_name +
                          " " +
                          assignedReviewer.last_name
                        }
                        src={
                          assignedReviewer.profile_image_url
                            ? IMGURL + assignedReviewer.profile_image_url
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
                      <Flex fontWeight={700}>
                        {assignedReviewer?.first_name +
                          " " +
                          assignedReviewer?.last_name}
                      </Flex>
                      <Flex
                        fontWeight={400}
                        fontSize={"14px"}
                        color={"#848484"}
                      >
                        {assignedReviewer.is_superadmin
                          ? "Super Admin"
                          : LabelizeRole(assignedReviewer?.role) +
                            " - " +
                            assignedReviewer?.employee_id}
                      </Flex>
                    </Flex>
                  </Flex>
                  {variant !== "review" && hasManagePermission && (
                    <Flex>
                      <Tooltip
                        hasArrow
                        openDelay={300}
                        closeDelay={100}
                        bg={"#dc143c"}
                        placement="top"
                        label="Send Reminder"
                      >
                        <Button
                          onClick={() => {
                            handleOpenSendReminder(
                              {
                                ...assignedReviewer,
                                first_name: assignedReviewer.first_name,
                                last_name: assignedReviewer.last_name,
                              },
                              "reviewer"
                            );
                          }}
                          position={"static"}
                          _hover={{ bg: "#dc143c", color: "white" }}
                          boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                          bg={"white"}
                          color={"#dc143c"}
                          h={"auto"}
                          p={"12px"}
                          borderRadius={"100%"}
                        >
                          <Flex w={"16px"} h={"16px"}>
                            <FaRegBell />
                          </Flex>
                        </Button>
                      </Tooltip>
                    </Flex>
                  )}
                </Flex>
              ))
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
