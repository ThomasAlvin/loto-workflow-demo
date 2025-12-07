import { Flex } from "@chakra-ui/react";
import { IoWarning } from "react-icons/io5";

export default function ChangesDetectedWarning() {
  return (
    <Flex
      py={"2px"}
      px={"10px"}
      bg={"#FFEEBD"}
      fontSize={"14px"}
      color={"#FF9100"}
    >
      <Flex alignItems={"center"} gap={"3px"}>
        <Flex fontSize={"18px"}>
          <IoWarning />
        </Flex>
        <Flex>Changes Detected!&nbsp;</Flex>
      </Flex>
      <Flex>Don't forget to save all the changes</Flex>
    </Flex>
  );
}
