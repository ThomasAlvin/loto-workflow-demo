import { Flex } from "@chakra-ui/react";
import { IoMdClose } from "react-icons/io";
import { LuRefreshCw } from "react-icons/lu";
import tinycolor from "tinycolor2";

export default function CustomToast({
  onClose,
  title,
  description,
  bgColor = "#E89D00",
}) {
  return (
    <Flex
      bg={bgColor}
      color="white"
      p={2}
      alignItems={"flex-start"}
      pl={4}
      gap={"10px"}
      borderRadius="md"
      boxShadow="md"
    >
      <Flex fontSize={"20px"} pt={"4px"}>
        <LuRefreshCw />
      </Flex>
      <Flex flexDir={"column"}>
        <Flex fontWeight={700}>{title}</Flex>
        <Flex>{description}</Flex>
      </Flex>
      <Flex
        _hover={{
          background: tinycolor(bgColor).darken(5).toString(),
        }}
        cursor={"pointer"}
        onClick={() => onClose()}
        fontSize={"20px"}
      >
        <IoMdClose />
      </Flex>
    </Flex>
  );
}
