import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Checkbox,
  Flex,
  Icon,
  Input,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Select,
} from "@chakra-ui/react";
import { useState } from "react";
import { PiTextTBold } from "react-icons/pi";
import {
  IoMdCheckboxOutline,
  IoMdRadioButtonOn,
  IoMdSettings,
} from "react-icons/io";
import { CiSliderHorizontal } from "react-icons/ci";
import {
  FaChevronDown,
  FaFilePdf,
  FaFileWord,
  FaLock,
  FaPlus,
  FaRegCalendar,
  FaRegImage,
} from "react-icons/fa6";

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
