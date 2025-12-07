import { Flex } from "@chakra-ui/react";
import { BsGlobe2 } from "react-icons/bs";
import { FaCogs } from "react-icons/fa";
import { FaRegBell } from "react-icons/fa6";
import { MdLockOutline } from "react-icons/md";
import { TiClipboard } from "react-icons/ti";
import WorkFlowStepBadges from "../CreateTemplate/WorkFlowStepBadges";
import TableStatusStyleMapper from "../../utils/TableStatusStyleMapper";

export default function ReportDetailsStep({
  reportSteps,
  setSelectedStep,
  onOpen,
  val,
  index,
}) {
  const { bgColor, textColor, icon, text } = TableStatusStyleMapper(
    val?.status,
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
