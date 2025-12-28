import {
  Avatar,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
} from "@chakra-ui/react";
import moment from "moment";
import { FaRegTrashAlt } from "react-icons/fa";
import { GrMapLocation } from "react-icons/gr";
import { HiWrenchScrewdriver } from "react-icons/hi2";
import { RiExternalLinkLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import formatString from "../../utils/formatString";
import getNotificationLinkByEvent from "../../utils/getNotificationLinkByEvent";
import labelizeRole from "../../utils/labelizeRole";

export default function NotificationDetailsModal({
  val,
  isOpen,
  onClose,
  deleteNotification,
  deleteButtonLoading,
}) {
  const nav = useNavigate();

  return (
    <Modal
      closeOnOverlayClick={!deleteButtonLoading}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnEsc={!deleteButtonLoading}
    >
      <ModalOverlay />
      <ModalContent maxW={"550px"} bg={"white"} overflow={"auto"}>
        <ModalHeader
          display={"flex"}
          gap={"10px"}
          fontSize={"16px"}
          px={"20px"}
          alignItems={"center"}
        >
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
              <Avatar
                outline={"1px solid #dc143c"}
                border={"2px solid white"}
                name={
                  val?.from_user?.first_name + " " + val?.from_user?.last_name
                }
                src={
                  val?.from_user?.profile_image_url
                    ? val.from_user.profile_image_url
                    : null
                }
              ></Avatar>
            )}
            <Flex flexDir={"column"}>
              <Flex fontSize={"18px"} fontWeight={700}>
                {val?.type === "system"
                  ? "System Notification"
                  : val?.from_user?.first_name +
                    " " +
                    val?.from_user?.last_name}
              </Flex>
              <Flex
                fontSize={"16px"}
                fontWeight={400}
                color={val?.type === "system" ? "#307aba" : "#848484"}
              >
                {val?.type === "system"
                  ? "LOTO Workflow System"
                  : val?.from_user?.is_superadmin
                  ? labelizeRole("super_admin")
                  : val?.from_user?.member?.role
                  ? labelizeRole(val?.from_user?.member?.role) +
                    " - " +
                    val?.from_user?.member?.employee_id
                  : "Role not found"}
              </Flex>
            </Flex>
          </Flex>
        </ModalHeader>
        <ModalCloseButton isDisabled={deleteButtonLoading} color={"black"} />
        <Divider m={0} borderColor={"#bababa"} />

        <ModalBody p={"0px"}>
          <Flex flexDir={"column"} py={"10px"} gap={"10px"}>
            <Flex px={"24px"} flexDir={"column"} gap={"10px"}>
              <Flex justify={"space-between"}>
                <Flex fontWeight={700} gap={"10px"} alignItems={"center"}>
                  <Flex fontSize={"20px"}>
                    <GrMapLocation />
                  </Flex>
                  {val?.work_site?.name}
                </Flex>
                <Flex color={"#848484"} fontSize={"14px"}>
                  {moment(val.created_at).format("MMMM Do YYYY, h:mm a")}
                </Flex>
              </Flex>
              <Flex
                bg={"#f8f9fa"}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                py={"8px"}
                px={"16px"}
                flexDir={"column"}
                color={"#848484"}
              >
                <Flex color={"black"} fontWeight={700}>
                  {val?.title}
                </Flex>
                <Flex fontSize={"14px"}>{val?.message}</Flex>
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter
          py={"14px"}
          px={"20px"}
          gap={"10px"}
          w={"100%"}
          justifyContent={"end"}
        >
          {deleteButtonLoading ? (
            <Flex gap={"10px"} opacity={"0.6"} alignItems={"center"}>
              <Spinner color="#dc143c" thickness="3px" />
              <Flex fontWeight={700} color={"#dc143c"}>
                Deleting...
              </Flex>
            </Flex>
          ) : (
            <>
              {getNotificationLinkByEvent(val.event, val.resource_UID) ? (
                <Link
                  to={getNotificationLinkByEvent(val.event, val.resource_UID)}
                  onClick={() => {
                    onClose(); // Trigger your function
                  }}
                >
                  <Flex
                    cursor={"pointer"}
                    p={"3px 6px"}
                    borderRadius={"5px"}
                    transition={"background 0.1s ease-in-out"}
                    _hover={{ bg: "#E3F4FF" }}
                    fontWeight={700}
                    color={"#008cff"}
                    alignItems={"center"}
                    gap={"5px"}
                  >
                    <Flex>
                      <RiExternalLinkLine />
                    </Flex>{" "}
                    <Flex>
                      View{" "}
                      {formatString(
                        val?.event === "work_order_assigned"
                          ? "Assigned work order"
                          : val.event
                      )}{" "}
                      {val.resource_UID ? "" : "List"}
                    </Flex>
                  </Flex>
                </Link>
              ) : (
                ""
              )}
            </>
          )}
          {deleteButtonLoading ? (
            <Flex gap={"10px"} opacity={"0.6"} alignItems={"center"}>
              <Spinner color="#dc143c" thickness="3px" />
              <Flex fontWeight={700} color={"#dc143c"}>
                Deleting...
              </Flex>
            </Flex>
          ) : (
            <Flex
              cursor={"pointer"}
              onClick={() => {
                deleteNotification(val?.UID);
                // handleOpenDeleteNotificationModal(e, val.UID);
              }}
              p={"3px 6px"}
              borderRadius={"5px"}
              transition={"background 0.1s ease-in-out"}
              _hover={{ bg: "#fde2e2" }}
              fontWeight={700}
              color={"#dc143c"}
              alignItems={"center"}
              gap={"5px"}
            >
              <Flex>
                <FaRegTrashAlt />
              </Flex>{" "}
              <Flex>Delete</Flex>
            </Flex>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
