import { Flex, Tooltip } from "@chakra-ui/react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { LuClipboardCopy } from "react-icons/lu";
export default function SwitchRequestMenu({
  handleOpenSwitchRequestDetailModal,
  status,
  UID,
}) {
  return (
    <Flex justifyContent={"center"}>
      <Flex gap={"15px"} fontSize={"20px"} justify={"space-between"}>
        <Tooltip
          hasArrow
          background={status === "pending" ? "#007BFF" : "black"}
          placement={"top"}
          label={status === "pending" ? "Respond" : "Details"}
          aria-label="A tooltip"
          color={"white"}
        >
          <Flex
            color={status === "pending" ? "#007BFF" : "black"}
            onClick={() => {
              handleOpenSwitchRequestDetailModal(UID);
            }}
            cursor={"pointer"}
          >
            {status === "pending" ? <LuClipboardCopy /> : <FaMagnifyingGlass />}
          </Flex>
        </Tooltip>
      </Flex>
    </Flex>
  );
}
