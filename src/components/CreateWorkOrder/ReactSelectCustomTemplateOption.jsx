import { Flex } from "@chakra-ui/react";
import {
  AiOutlineCheckSquare,
  AiOutlineOrderedList,
  AiOutlineProfile,
} from "react-icons/ai";
import { BsCheck2Square, BsDiagram3 } from "react-icons/bs";
import {
  FaCheckSquare,
  FaListOl,
  FaRegCheckCircle,
  FaTasks,
} from "react-icons/fa";
import { FaBarsProgress } from "react-icons/fa6";
import { LuListChecks, LuWorkflow } from "react-icons/lu";
import { TiClipboard } from "react-icons/ti";
import { components } from "react-select";
export default function ReactSelectCustomTemplateOption(props) {
  return (
    <components.Option {...props}>
      <Flex justify={"space-between"} alignItems={"center"} gap={"8px"}>
        <Flex>{props.data.label}</Flex>
        <Flex
          onClick={() => {
            console.log(props);
          }}
          gap={"5px"}
          fontSize={"14px"}
          alignItems={"center"}
        >
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
