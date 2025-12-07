import { Center, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaUserPlus, FaWrench } from "react-icons/fa";
import { LiaClipboardListSolid } from "react-icons/lia";
import { TbLockPlus } from "react-icons/tb";
import StarterGuidePageLayout from "../components/Layout/StarterGuidePageLayout";

export default function StarterGuidePage() {
  const starterGuideFlow = [
    {
      title: "Invite Member",
      icon: <FaUserPlus />,
      iconSize: "80px",
      link: "/member",
      description:
        "Add new members (users) to the system who will be responsible for performing LOTO procedures. Each member will have unique access and permission to ensure security and accountability",
    },
    {
      title: "Equipment/Machines",
      icon: <FaWrench />,
      iconSize: "80px",
      link: "/equipment-machine",
      description:
        "Add and manage the equipment and machines that require LOTO procedures. Each piece of equipment will have its own profile for tracking and inspection",
    },
    {
      title: "Inspection Form",
      icon: <LiaClipboardListSolid />,
      iconSize: "80px",
      link: "/inspection-form",
      description:
        "Create and manage inspection forms for LOTO Procedures. These forms ensure that all safety checks are completed before and after lockout",
    },
    {
      title: "Add Lock",
      icon: <TbLockPlus />,
      iconSize: "80px",
      link: "/lock-inventory",
      description:
        "Register and assign smart padlocks to the system. Each lock will be uniquely identified and linked to a specific equipment, members, or LOTO procedures for tracking and accountability",
    },
  ];
  return (
    <StarterGuidePageLayout>
      <Flex maxW={"65%"} flexDir={"column"}>
        <Center flexDir={"column"} h={"100%"}>
          {starterGuideFlow.map((flow, index) => (
            <Flex
              gap={"10px"}
              w={"100%"}
              h={"100%"}
              alignItems={"center"}
              justify={"center"}
            >
              <Flex
                h={"100%"}
                flexDir={"column"}
                justify={"center"}
                alignItems={"center"}
                gap={"10px"}
              >
                <Flex
                  h={"50%"}
                  w={"2px"}
                  visibility={index ? "visible" : "hidden"}
                  bg={"#dc143c"}
                ></Flex>
                <Flex
                  w={"32px"}
                  h={"32px"}
                  justify={"center"}
                  alignItems={"center"}
                  borderRadius={"full"}
                  p={"5px"}
                  bg={"#dc143c"}
                  color={"white"}
                  fontWeight={700}
                >
                  {index + 1}
                </Flex>
                <Flex
                  h={"50%"}
                  visibility={
                    index + 1 === starterGuideFlow.length ? "hidden" : "visible"
                  }
                  w={"2px"}
                  bg={"#dc143c"}
                ></Flex>
              </Flex>
              <Link
                style={{ width: "100%" }}
                to={flow.link}
                _hover={{ textDecoration: "none" }} // removes underline on hover
              >
                <Flex
                  w={"100%"}
                  cursor={"pointer"}
                  py={"30px"}
                  px={"30px"}
                  gap={"40px"}
                  _hover={{ bg: "#ededed" }}
                >
                  <Flex color={"#dc143c"} fontSize={flow.iconSize}>
                    {flow.icon}
                  </Flex>
                  <Flex flexDir={"column"}>
                    <Flex fontSize={"24px"} fontWeight={700} color={"#dc143c"}>
                      {flow.title}
                    </Flex>
                    <Flex fontSize={"14px"}>{flow.description}</Flex>
                  </Flex>
                </Flex>
              </Link>
            </Flex>
          ))}
        </Center>
      </Flex>
    </StarterGuidePageLayout>
  );
}
