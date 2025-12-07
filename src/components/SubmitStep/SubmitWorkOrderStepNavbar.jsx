import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { FaArrowLeftLong, FaChevronUp } from "react-icons/fa6";

export default function SubmitWorkOrderStepNavbar({ handleBackRedirect }) {
  return (
    <Flex
      flexDir={"column"}
      zIndex={2}
      bg={"white"}
      // position={"sticky"}
      top={0}
    >
      <Flex
        position={"relative"}
        px={"20px"}
        gap={"20px"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Box
          color={"crimson"}
          position="absolute"
          top="50%"
          transform="translate(0%, -50%)"
          left="20px"
        >
          <Flex
            cursor={"pointer"}
            onClick={handleBackRedirect}
            alignItems={"center"}
            gap={"20px"}
          >
            <Flex>
              <FaArrowLeftLong />
            </Flex>
            <Flex>Back</Flex>
          </Flex>
        </Box>
        <Flex
          color={"#848484"}
          justifyContent={"center"}
          alignItems={"center"}
          gap={"10px"}
          fontWeight={700}
          fontSize={"16px"}
          h={"60px"}
        ></Flex>
        <Box
          color={"crimson"}
          position="absolute"
          top="50%"
          transform="translate(0%, -50%)"
          right="20px"
        ></Box>
      </Flex>
      <Divider m={0} borderColor={"#848484"} />
    </Flex>
  );
}
