import { Flex } from "@chakra-ui/react";

export default function LabelizeAction(action) {
  function capitalizeFirstLetter(str) {
    if (!str) return ""; // Handle empty or null strings
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  switch (action) {
    case "connected":
      return (
        <Flex
          bg={"#01dd27"}
          color={"white"}
          fontSize={"14px"}
          px={"5px"}
          py={"2px"}
          borderRadius={"5px"}
          justify={"center"}
          fontWeight={700}
        >
          {action.toUpperCase()}
        </Flex>
      );
    case "disconnected":
      return (
        <Flex
          bg={"#01dd27"}
          color={"white"}
          fontSize={"14px"}
          px={"5px"}
          py={"2px"}
          borderRadius={"5px"}
          justify={"center"}
          fontWeight={700}
        >
          {action.toUpperCase()}
        </Flex>
      );
    case "locked":
      return (
        <Flex
          bg={"#01dd27"}
          color={"white"}
          fontSize={"14px"}
          px={"5px"}
          py={"2px"}
          borderRadius={"5px"}
          justify={"center"}
          fontWeight={700}
        >
          {action.toUpperCase()}
        </Flex>
      );
    case "unlocked":
      return (
        <Flex
          bg={"#ff0000"}
          color={"white"}
          fontSize={"14x"}
          px={"5px"}
          py={"2px"}
          borderRadius={"5px"}
          justify={"center"}
          fontWeight={700}
        >
          {action.toUpperCase()}
        </Flex>
      );
    case "create":
      return (
        <Flex
          bgColor={"#cfecff"}
          color={"#19a3ff"}
          px={"5px"}
          py={"2px"}
          fontSize={"14px"}
          borderRadius={"5px"}
          justify={"center"}
          fontWeight={700}
        >
          {capitalizeFirstLetter(action)}
        </Flex>
      );
    case "update":
      return (
        <Flex
          bgColor={"#ffeebd"}
          color={"#ff9100"}
          px={"5px"}
          py={"2px"}
          fontSize={"14px"}
          borderRadius={"5px"}
          justify={"center"}
          fontWeight={700}
        >
          {capitalizeFirstLetter(action)}
        </Flex>
      );
    case "delete":
      return (
        <Flex
          bg={"#dc143c"}
          color={"white"}
          px={"5px"}
          py={"2px"}
          fontSize={"14px"}
          borderRadius={"5px"}
          justify={"center"}
          fontWeight={700}
        >
          {capitalizeFirstLetter(action)}
        </Flex>
      );
    case "import":
      return (
        <Flex
          bg={"#28A745"}
          color={"white"}
          px={"5px"}
          py={"2px"}
          fontSize={"14px"}
          borderRadius={"5px"}
          justify={"center"}
          fontWeight={700}
        >
          {capitalizeFirstLetter(action)}
        </Flex>
      );
    case "login":
      return (
        <Flex
          bg={"#1ade16"}
          color={"white"}
          px={"5px"}
          py={"2px"}
          fontSize={"14px"}
          borderRadius={"5px"}
          justify={"center"}
          fontWeight={700}
        >
          {capitalizeFirstLetter(action)}
        </Flex>
      );

    case "logout":
      return (
        <Flex
          bg={"#dc143c"}
          color={"white"}
          px={"5px"}
          py={"2px"}
          fontSize={"14px"}
          borderRadius={"5px"}
          justify={"center"}
          fontWeight={700}
        >
          {capitalizeFirstLetter(action)}
        </Flex>
      );

    default:
      return action; // Or some default icon if needed
  }
}
