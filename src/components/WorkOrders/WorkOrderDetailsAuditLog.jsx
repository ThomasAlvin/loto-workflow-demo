import { Avatar, Box, Flex } from "@chakra-ui/react";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import { HiWrenchScrewdriver } from "react-icons/hi2";
import labelizeRole from "../../utils/labelizeRole";

export default function WorkOrderDetailsAuditLog({
  from,
  index,
  val,
  handleOpenSwitchRequestDetailModal,
}) {
  function formatCustomDate(dateString) {
    const date = moment(dateString);
    const formattedDate = date.format("DD MMM YYYY, HH:mm");
    const timeAgo = date.fromNow();

    return `${formattedDate} - ${timeAgo}`;
  }

  function convertAuditLogToHTMLMessage(auditLogMessage) {
    return auditLogMessage.map((segment, index) => {
      if (segment.type === "bold") {
        return <strong key={index}>{segment.text}</strong>;
      }
      return <span key={index}>{segment.text}</span>;
    });
  }

  const auditLogUser = val.first_name
    ? val
    : val?.superadmin?.first_name
    ? val.superadmin
    : {
        ...val.member?.user,
        role: val.member?.role,
        employee_id: val.member?.employee_id,
      };
  const [userImage, setUserImage] = useState(
    auditLogUser.profile_image_url || ""
  );
  return (
    <>
      <Flex gap={"10px"} alignItems={"center"}>
        <Flex minW={"32px"} fontWeight={700}>
          {index + (from || 1)}.
        </Flex>
        <Flex
          px={"10px"}
          w={"270px"}
          borderRight={"1px solid #dedede"}
          alignItems={"center"}
          gap={"10px"}
        >
          {val.type === "manual" ? (
            auditLogUser.first_name ? (
              <Avatar
                position={"static"}
                outline={"1px solid #dc143c"}
                border={"2px solid white"}
                name={auditLogUser.first_name + " " + auditLogUser.last_name}
                src={auditLogUser.profile_image_url ? userImage : null}
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
          ) : val.type === "system" ? (
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
                <HiWrenchScrewdriver />
              </Flex>
            </Flex>
          ) : (
            ""
          )}
          <Flex fontSize={"16px"} flexDir={"column"}>
            <Flex alignItems={"center"} fontWeight={700}>
              <Flex>
                {val.type === "manual"
                  ? auditLogUser.first_name + " " + auditLogUser.last_name
                  : val.type === "system"
                  ? "System"
                  : ""}
              </Flex>
            </Flex>
            <Flex
              color={"#848484"}
              fontWeight={400}
              fontSize={"14px"}
              alignItems={"center"}
            >
              {val.type === "manual"
                ? val.superadmin?.first_name ||
                  auditLogUser.role === "super_admin"
                  ? "Super Admin"
                  : labelizeRole(auditLogUser.role) +
                    " - " +
                    auditLogUser.employee_id
                : val.type === "system"
                ? "Digipas Technologies.inc"
                : ""}
            </Flex>
          </Flex>
        </Flex>
        <Flex flexDir={"column"} wordBreak={"break-word"} flex={"1"}>
          <Box
            fontSize={"16px"}
            color={"black"}
            whiteSpace="normal"
            flexWrap={"wrap"}
          >
            <Box fontWeight={700} as="span">
              {val.type === "manual"
                ? auditLogUser.first_name + " " + auditLogUser.last_name + " "
                : ""}
            </Box>
            {convertAuditLogToHTMLMessage(val?.change)}
          </Box>
          <Flex justify={"space-between"}>
            <Flex color={"#848484"} fontSize={"14px"}>
              {formatCustomDate(val?.created_at)}
            </Flex>
            {val.assignee_switch_requestId ? (
              <Flex
                onClick={() =>
                  handleOpenSwitchRequestDetailModal(
                    val.assignee_switch_request
                  )
                }
                _hover={{ textDecor: "underline" }}
                cursor={"pointer"}
                color={"#dc143c"}
                alignItems={"center"}
                fontSize={"14px"}
              >
                View Switch Details
              </Flex>
            ) : (
              ""
            )}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
