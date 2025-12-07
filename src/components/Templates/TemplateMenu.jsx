import { Flex, Tooltip } from "@chakra-ui/react";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import Can from "../../components/Can";
export default function TemplateMenu({
  pageModule,
  handleOpenTemplateDetailsModal,
  handleOpenDeleteTemplateModal,
  val,
  hasDeleteAccess,
  hasEditAccess,
}) {
  const nav = useNavigate();
  const location = useLocation();

  return (
    <Flex justify={"center"}>
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
              handleOpenTemplateDetailsModal(val);
            }}
            cursor={"pointer"}
          >
            <FaMagnifyingGlass />
          </Flex>
        </Tooltip>
        <Can module={pageModule} permission={["manage"]}>
          <Tooltip
            hasArrow
            placement={"top"}
            label={hasEditAccess ? "Edit" : "Not authorized"}
            aria-label="A tooltip"
            background={hasEditAccess ? "#007BFF" : "#848484"}
            color={"white"}
          >
            <Flex
              onClick={() => {
                if (hasEditAccess)
                  nav(`/template/edit/${val.UID}${location.search}`);
              }}
              cursor={hasEditAccess ? "pointer" : "not-allowed"}
              color={hasEditAccess ? "#007BFF" : "#848484"}
            >
              <FaRegEdit />
            </Flex>
          </Tooltip>
        </Can>
        <Can module={pageModule} permission={["manage"]}>
          <Tooltip
            hasArrow
            placement={"top"}
            label={hasDeleteAccess ? "Delete" : "Not authorized"}
            aria-label="A tooltip"
            background={hasDeleteAccess ? "crimson" : "#848484"}
            color={"white"}
          >
            <Flex
              onClick={() => {
                if (hasDeleteAccess) handleOpenDeleteTemplateModal(val.UID);
              }}
              cursor={hasDeleteAccess ? "pointer" : "not-allowed"}
              color={hasDeleteAccess ? "crimson" : "#848484"}
            >
              <FaRegTrashAlt />
            </Flex>
          </Tooltip>
        </Can>
      </Flex>
    </Flex>
  );
}
