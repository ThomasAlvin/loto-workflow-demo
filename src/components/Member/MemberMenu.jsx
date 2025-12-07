import { Flex, Tooltip } from "@chakra-ui/react";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdOutgoingMail } from "react-icons/md";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Can from "../../components/Can";
import checkHasPermission from "../../utils/checkHasPermission";
export default function MemberMenu({
  member,
  handleOpenMemberDetailsModal,
  handleOpenResendEmailMemberModal,
  handleOpenRemoveMemberModal,
  pageModule,
}) {
  const userSelector = useSelector((state) => state.login.auth);
  const location = useLocation();

  function hasManagePermissionByRole() {
    return checkHasPermission(userSelector, pageModule, [
      `manage_${member.role}`,
    ]);
  }
  const nav = useNavigate();
  return (
    <Flex justify={"center"}>
      <Flex gap={"15px"} fontSize={"20px"} justify={"space-between"}>
        {/* <MemberDetailsModal member={member} /> */}
        <Tooltip
          hasArrow
          placement={"top"}
          label="Details"
          aria-label="A tooltip"
          color={"white"}
        >
          <Flex
            onClick={() => {
              handleOpenMemberDetailsModal(member);
            }}
            cursor={"pointer"}
          >
            <FaMagnifyingGlass />
          </Flex>
        </Tooltip>
        <Can
          module={pageModule}
          permission={["manage_admin", "manage_member", "manage_finance"]}
        >
          <Tooltip
            hasArrow
            placement={"top"}
            background={hasManagePermissionByRole() ? "#007BFF" : "#848484"}
            label={
              hasManagePermissionByRole() ? "Edit" : "Access is restricted"
            }
            aria-label="A tooltip"
            color={"white"}
          >
            <Flex
              onClick={() => {
                if (hasManagePermissionByRole()) {
                  nav(`/member/edit/${member.UID}${location.search}`);
                }
              }}
              cursor={hasManagePermissionByRole() ? "pointer" : "not-allowed"}
              color={hasManagePermissionByRole() ? "#007BFF" : "#848484"}
            >
              <FaRegEdit />
            </Flex>
          </Tooltip>
        </Can>
        <Can
          module={pageModule}
          permission={["manage_admin", "manage_member", "manage_finance"]}
        >
          <Tooltip
            hasArrow
            placement={"top"}
            background={
              member.user.status !== "verified" && hasManagePermissionByRole()
                ? "#2dba4d"
                : "#848484"
            }
            label={
              !hasManagePermissionByRole()
                ? "Access is restricted"
                : member.user.status === "verified"
                ? "Email already verified"
                : "Resend verification email"
            }
            color={"white"}
          >
            <Flex
              cursor={
                member.user.status !== "verified" && hasManagePermissionByRole()
                  ? "pointer"
                  : "not-allowed"
              }
              // pointerEvents={
              //   member.user.status !== "verified" ? "auto" : "none"
              // }
              // opacity={member.user.status !== "verified" ? 1 : 0.4}
              onClick={() => {
                if (member.user.status !== "verified") {
                  handleOpenResendEmailMemberModal(member.UID);
                }
              }}
              color={
                member.user.status !== "verified" && hasManagePermissionByRole()
                  ? "#28A745"
                  : "#848484"
              }
            >
              <MdOutgoingMail />
            </Flex>
          </Tooltip>
        </Can>
        <Can
          module={pageModule}
          permission={["manage_admin", "manage_member", "manage_finance"]}
        >
          <Tooltip
            hasArrow
            placement={"top"}
            label={
              hasManagePermissionByRole() ? "Delete" : "Access is restricted"
            }
            aria-label="A tooltip"
            background={hasManagePermissionByRole() ? "crimson" : "#848484"}
            color={"white"}
          >
            <Flex
              cursor={hasManagePermissionByRole() ? "pointer" : "not-allowed"}
              onClick={() => {
                if (hasManagePermissionByRole()) {
                  handleOpenRemoveMemberModal(member.UID);
                }
              }}
              color={hasManagePermissionByRole() ? "#dc143c" : "#848484"}
            >
              <FaRegTrashAlt />
            </Flex>
          </Tooltip>
        </Can>
      </Flex>
    </Flex>
  );
}
