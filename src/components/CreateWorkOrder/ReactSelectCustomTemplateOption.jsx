import { Flex } from "@chakra-ui/react";
import { BsCheck2Square } from "react-icons/bs";
import { components } from "react-select";
export default function ReactSelectCustomTemplateOption(props) {
  return (
    <components.Option {...props}>
      <Flex justify={"space-between"} alignItems={"center"} gap={"8px"}>
        <Flex>{props.data.label}</Flex>
        <Flex gap={"5px"} fontSize={"14px"} alignItems={"center"}>
          <Flex fontWeight={700} color={props.isSelected ? "'white" : "black"}>
            {props.data.stepCount}
          </Flex>
          <Flex
            fontSize={"18px"}
            color={props.isSelected ? "#ededed" : "#848484"}
          >
            <BsCheck2Square />
          </Flex>
        </Flex>
      </Flex>
    </components.Option>
  );
}
