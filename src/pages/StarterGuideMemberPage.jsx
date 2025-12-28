import {
  Button,
  Checkbox,
  Flex,
  Grid,
  GridItem,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import StarterGuide from "../assets/images/starter-guide.png";
import { IoCheckmarkCircle, IoRocket } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  FaChevronRight,
  FaClipboardList,
  FaCogs,
  FaUserTie,
} from "react-icons/fa";
import RecommendationsCard from "../components/StarterGuide/RecommendationsCard";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { LuRefreshCcw } from "react-icons/lu";
import CompleteRoleAccessibilityTable from "../components/CompleteRoleAccessibilityTable";
import { api } from "../api/api";

export default function StarterGuideMemberPage() {
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
        Starter Guide
      </Flex>
      <RecommendationsCard />
      <Flex flexDir={"column"} gap={"20px"}>
        <Flex flexDir={"column"}>
          <Flex fontWeight={700} fontSize={"24px"}>
            Roles and Accessibility
          </Flex>
          <Flex color={"#848484"} fontSize={"14px"}>
            Understanding Member Roles and Access Control This guide provides a
            clear breakdown of the different member roles within the system and
            their corresponding permissions. You’ll learn what each role can
            access, what actions they can perform, Whether you're an
            administrator or a team member navigating your access, this table
            will show your role's capabilities and limitations.
          </Flex>
        </Flex>
        <Flex flexDir={"column"} gap={"20px"}>
          <CompleteRoleAccessibilityTable />
        </Flex>
      </Flex>
    </Flex>
  );
}
