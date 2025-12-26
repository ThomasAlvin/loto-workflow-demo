import {
  Avatar,
  Checkbox,
  Flex,
  Td,
  Tooltip,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import moment from "moment";
import { FaRegTrashAlt, FaUserAlt } from "react-icons/fa";
import { HiWrenchScrewdriver } from "react-icons/hi2";
import { RiExternalLinkLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import formatString from "../../utils/formatString";
import getNotificationLinkByEvent from "../../utils/getNotificationLinkByEvent";
import labelizeRole from "../../utils/labelizeRole";
import NotificationDetailsModal from "./NotificationDetailsModal";

export default function NotificationCard({
  val,
  setNotifications,
  setNotificationsPagination,
  setNewNotificationsCount,
  deleteNotification,
  handleCheckbox,
  selectedUID,
  deleteButtonLoading,
  handleOpenDeleteNotificationModal,
}) {
  const nav = useNavigate();
  const { isOpen, onClose, onOpen } = useDisclosure();

  async function handleOpenModal() {
    setNotifications((prevState) =>
      prevState.map((notification) =>
        notification.UID === val.UID
          ? { ...notification, is_read: 1 } // Mark as read
          : notification
      )
    );
    setNotificationsPagination((prevState) => ({
      ...prevState,
      data: prevState.data.map((notification) =>
        notification.UID === val.UID
          ? { ...notification, is_read: 1 } // Mark as read
          : notification
      ),
    }));
    setNewNotificationsCount((prevState) => {
      return prevState > 0 ? prevState - 1 : 0;
    });

    onOpen();
  }

  return (
    <>
      <Tr
        cursor={"pointer"}
        onClick={handleOpenModal}
        _hover={{ bg: "#ededed" }}
        transition={"background 0.1s ease-in-out"}
        w={"100%"}
        bg={val.is_read ? "#f5f5f5" : "white"}
      >
        <Td
          pr={0}
          borderBottomColor={"#bababa"}
          fontWeight={700}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            bg={"white"}
            id={val.UID}
            isChecked={selectedUID.includes(val.UID)}
            onChange={handleCheckbox}
          ></Checkbox>
        </Td>
        <Td w={"20%"} borderBottomColor={"#bababa"}>
          <Flex alignItems={"center"} gap={"10px"}>
            {val.type === "system" ? (
              <Flex
                bg={"#bababa"}
                borderRadius={"100%"}
                justifyContent={"center"}
                alignItems={"center"}
                h={"48px"}
                w={"48px"}
              >
                {" "}
                <Flex color={"white"} fontSize={"24px"}>
                  <HiWrenchScrewdriver />
                </Flex>
              </Flex>
            ) : (
              <>
                {val.from_user?.first_name ? (
                  <Avatar
                    outline={"1px solid #dc143c"}
                    border={"2px solid white"}
                    name={
                      val.from_user?.first_name + " " + val.from_user?.last_name
                    }
                    src={
                      val.from_user?.profile_image_url
                        ? val.from_user?.profile_image_url
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
              </>
            )}
            <Flex flexDir={"column"}>
              <Flex gap={"5px"} alignItems={"center"}>
                <Flex fontWeight={700}>
                  {val.type === "system"
                    ? "System Notification"
                    : val.from_user.first_name + " " + val.from_user.last_name}
                </Flex>
                {val.is_read ? (
                  <Flex
                    color={"white"}
                    bg={"#bababa"}
                    p={"0px 4px"}
                    fontSize={"11px"}
                    fontWeight={700}
                    borderRadius={"5px"}
                  >
                    Read
                  </Flex>
                ) : (
                  <Flex
                    color={"white"}
                    bg={"#dc143c"}
                    p={"0px 4px"}
                    fontSize={"11px"}
                    fontWeight={700}
                    borderRadius={"5px"}
                  >
                    New!
                  </Flex>
                )}
              </Flex>
              <Flex
                fontSize={"14px"}
                color={val.type === "system" ? "#307aba" : "#848484"}
              >
                {val.type === "system"
                  ? "Digipas Technologies.Inc"
                  : val.from_user?.is_superadmin
                  ? labelizeRole("super_admin")
                  : val?.from_user?.member?.role
                  ? labelizeRole(val?.from_user?.member?.role) +
                    " - " +
                    val?.from_user?.member?.employee_id
                  : "Role not found"}
              </Flex>
            </Flex>
          </Flex>
        </Td>

        <Td
          w={"60%"}
          borderBottomColor={"#bababa"}
          color={"#848484"}
          whiteSpace="normal" // Allow text to break
          wordBreak="break-word"
        >
          <Flex color={"black"} fontWeight={700}>
            {val.title}
          </Flex>
          <Flex fontSize={"14px"}>{val.message}</Flex>
        </Td>
        <Td width={"15%"} borderBottomColor={"#bababa"} color={"#848484"}>
          <Flex flexDir={"column"}>
            {val?.work_site?.name ? (
              <Flex
                fontWeight={700}
                color={"black"}
                gap={"10px"}
                alignItems={"center"}
              >
                {val?.work_site?.name}
              </Flex>
            ) : (
              ""
            )}

            <Flex>{moment(val.created_at).startOf("minute").fromNow()}</Flex>
          </Flex>
        </Td>
        <Td w={"5%"} borderBottomColor={"#bababa"}>
          <Flex alignItems={"center"} gap={"10px"}>
            <Tooltip
              hasArrow
              placement={"top"}
              label={
                getNotificationLinkByEvent(val.event, val.resource_UID)
                  ? "View " +
                    formatString(
                      val?.event === "work_order_assigned"
                        ? "Assigned work order"
                        : val.event
                    ) +
                    (val.resource_UID ? "" : " List")
                  : "No Link"
              }
              aria-label="A tooltip"
              background={
                getNotificationLinkByEvent(val.event, val.resource_UID)
                  ? "#008cff"
                  : "#848484"
              }
              color={"white"}
              pointerEvents={
                getNotificationLinkByEvent(val.event, val.resource_UID)
                  ? "auto"
                  : "none"
              }
            >
              <Link
                onClick={(e) => {
                  e.stopPropagation();
                }}
                to={getNotificationLinkByEvent(val.event, val.resource_UID)}
              >
                <Flex
                  fontSize={"20px"}
                  cursor={"pointer"}
                  color={
                    getNotificationLinkByEvent(val.event, val.resource_UID)
                      ? "#008cff"
                      : "#848484"
                  }
                >
                  <RiExternalLinkLine />
                </Flex>
              </Link>
            </Tooltip>

            <Tooltip
              hasArrow
              placement={"top"}
              label="Delete"
              aria-label="A tooltip"
              background={"crimson"}
              color={"white"}
            >
              <Flex
                onClick={(e) => {
                  handleOpenDeleteNotificationModal(e, val.UID);
                }}
                cursor={"pointer"}
                color={"crimson"}
              >
                <FaRegTrashAlt />
              </Flex>
            </Tooltip>
          </Flex>
        </Td>
      </Tr>
      <NotificationDetailsModal
        val={val}
        isOpen={isOpen}
        onClose={onClose}
        deleteNotification={deleteNotification}
        deleteButtonLoading={deleteButtonLoading}
        handleOpenDeleteNotificationModal={handleOpenDeleteNotificationModal}
      />
    </>
  );
}
