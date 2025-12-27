import { Flex } from "@chakra-ui/react";
import { RxDragHandleDots2 } from "react-icons/rx";
export default function StepModal({ val }) {
  return (
    <Flex w={"100%"}>
      <Flex
        w={"100%"}
        py={"5px"}
        px={"4px"}
        color={"black"}
        gap={"10px"}
        background={"white"}
        borderRadius={"5px"}
        shadow="0px 0px 3px rgba(50, 50, 93, 0.5)"
        alignItems={"center"}
        justify={"space-between"}
      >
        <Flex
          color={val.iconColor}
          fontWeight={700}
          gap={"3px"}
          alignItems={"center"}
          fontSize={"14px"}
        >
          <Flex fontSize={"24px"}>
            <RxDragHandleDots2 />
          </Flex>
          <Flex alignItems={"center"} gap={"5px"}>
            <Flex
              bg={val.iconBackground}
              p={"5px"}
              borderRadius={"100px"}
              fontSize={"16px"}
            >
              {val.icon}
            </Flex>
            <Flex>{val.name}</Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
