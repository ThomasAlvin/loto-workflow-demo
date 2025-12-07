import { Flex } from "@chakra-ui/react";

export default function TemplateDetailsFormQuestion({
  val,
  index,
  question,
  setQuestion,
}) {
  return (
    <Flex w={"100%"} color={"#848484"} flexDir={"column"}>
      <Flex color={"#dc143c"} fontWeight={700}>
        <Flex>{index + 1}.&nbsp;</Flex>
        <Flex>{val.title}</Flex>
      </Flex>
      <Flex
        color={val.response ? "black" : "#848484"}
        // shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        // px={"16px"}
        // py={"8px"}
        // borderRadius={"5px"}
      >
        {val.response ? val.response : "Not Filled"}
      </Flex>
    </Flex>
  );
}
