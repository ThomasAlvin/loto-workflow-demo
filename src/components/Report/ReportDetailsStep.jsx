import { Flex } from "@chakra-ui/react";
import tableStatusStyleMapper from "../../utils/tableStatusStyleMapper";
import WorkFlowStepBadges from "../CreateTemplate/WorkFlowStepBadges";

export default function ReportDetailsStep({
  reportSteps,
  setSelectedStep,
  onOpen,
  val,
  index,
}) {
  const { bgColor, textColor, icon, text } = tableStatusStyleMapper(
    val?.status
  );
  return (
    <Flex
      onClick={() => {
        setSelectedStep({
          ...reportSteps[index],
          index,
        });
        onOpen();
      }}
      cursor={"pointer"}
      _hover={{ bg: "#f7f7f7" }}
      boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
      w={"100%"}
      fontWeight={700}
      justify={"space-between"}
    >
      <Flex
        w={"100%"}
        // borderRadius={"5px"}
        py={"8px"}
        px={"12px"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Flex gap={"10px"} alignItems={"center"}>
          <Flex color={"crimson"} fontWeight={700}>
            {val.originalIndex + 1}.{" "}
          </Flex>
          <Flex>{val.name}</Flex>
          <Flex h={"fit-content"}>
            <Flex
              fontWeight={700}
              borderRadius={"10px"}
              px={"8px"}
              py={"4px"}
              alignItems={"center"}
              gap={"5px"}
              bg={bgColor}
              fontSize={"14px"}
              color={textColor}
            >
              <Flex fontSize={"18px"}>{icon}</Flex>
              <Flex>{text}</Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex gap={"10px"} alignItems={"center"}>
          <WorkFlowStepBadges val={val} />
        </Flex>
      </Flex>
    </Flex>
  );
}
