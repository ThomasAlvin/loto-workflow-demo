import React from "react";
import { Flex, Tooltip } from "@chakra-ui/react";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaMagnifyingGlass } from "react-icons/fa6";
import Can from "../../utils/Can";
export default function DepartmentMenu({
  UID,
  pageModule,
  membersCount,
  handleOpenDeleteDepartmentModal,
  handleOpenEditDepartmentModal,
  handleOpenDepartmentDetailsModal,
}) {
  return (
    <Flex>
      <Flex gap={"15px"} fontSize={"20px"} justify={"space-between"}>
        <Tooltip
          hasArrow
          placement={"top"}
          label="Details"
          aria-label="A tooltip"
          color={"white"}
        >
          <Flex
            onClick={() => {
              handleOpenDepartmentDetailsModal(UID);
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
            background={"#007BFF"}
            label={"Edit"}
            aria-label="A tooltip"
            color={"white"}
          >
            <Flex
              onClick={() => {
                handleOpenEditDepartmentModal(UID);
              }}
              cursor={"pointer"}
              color={"#007BFF"}
            >
              <FaRegEdit />
            </Flex>
          </Tooltip>
        </Can>
        <Can module={pageModule} permission={["manage"]}>
          <Tooltip
            hasArrow
            placement={"top"}
            label={
              membersCount
                ? "Delete disabled: There's exisiting members"
                : "Delete"
            }
            aria-label="A tooltip"
            background={membersCount ? "#848484" : "crimson"}
            color={"white"}
          >
            <Flex
              onClick={
                membersCount
                  ? ""
                  : () => {
                      handleOpenDeleteDepartmentModal(UID);
                    }
              }
              cursor={membersCount ? "not-allowed" : "pointer"}
              color={membersCount ? "#848484" : "crimson"}
            >
              <FaRegTrashAlt />
            </Flex>
          </Tooltip>
        </Can>
      </Flex>
    </Flex>
  );
}
