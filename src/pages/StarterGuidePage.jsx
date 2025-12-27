import { Box, Center, Flex } from "@chakra-ui/react";
import { BsListCheck } from "react-icons/bs";
import { FaUserPlus, FaWrench } from "react-icons/fa";
import { GoChecklist } from "react-icons/go";
import { IoIosPaper } from "react-icons/io";
import { LiaClipboardListSolid } from "react-icons/lia";
import { TbLockPlus } from "react-icons/tb";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import StarterGuidePageLayout from "../components/Layout/StarterGuidePageLayout";
import checkHasPermission from "../utils/checkHasPermission";
import formatRichText from "../utils/formatRichText";

export default function StarterGuidePage() {
  const userSelector = useSelector((state) => state.login.auth);
  const userIsSuperAdmin = userSelector?.is_superadmin;
  const starterGuideFlow = [
    {
      title: "Invite Member",
      icon: <FaUserPlus />,
      iconSize: "80px",
      link: "/member",
      module: "members",
      permission: ["manage_admin", "manage_member", "manage_finance"],
      description: [
        {
          type: "text",
          text: "Add new members (users) to the system who will be responsible for performing LOTO procedures. Each member will have unique access and permission to ensure security and accountability",
        },
      ],
    },
    {
      title: "Equipment/Machines",
      icon: <FaWrench />,
      iconSize: "80px",
      link: "/equipment-machine",
      module: "equipment_machines",
      permission: ["manage"],
      description: [
        {
          type: "text",
          text: "Add and manage the equipment/machines that require LOTO procedures. ",
        },
        {
          type: "bold",
          text: "Each machine can be grouped into a category and connected to the appropriate inspection form",
        },
      ],
    },
    {
      title: "Inspection Form",
      icon: <LiaClipboardListSolid />,
      iconSize: "80px",
      link: "/inspection-form",
      module: "equipment_machines",
      permission: ["manage"],
      description: [
        {
          type: "text",
          text: "Create inspection forms for LOTO procedures and ",
        },
        {
          type: "bold",
          text: "assign them to the machine category used by your equipment/machines. ",
        },
        {
          type: "text",
          text: "These forms help ensure all safety checks are completed before and after lockout.",
        },
      ],
    },
    {
      title: "Add Lock",
      icon: <TbLockPlus />,
      iconSize: "80px",
      link: "/lock-inventory",
      module: "lock_inventory",
      permission: ["manage"],
      description: [
        {
          type: "text",
          text: "Register and assign smart padlocks to the system. Each lock will be uniquely identified and linked to a specific equipment, members, or LOTO procedures for tracking and accountability",
        },
        {
          hasBreak: true,
          type: "bold",
          text: "Important: Smart padlocks can only be added and registered using our mobile app.",
        },
      ],
    },
    {
      title: "Create Work Order",
      icon: <IoIosPaper />,
      iconSize: "80px",
      link: "/work-order",
      module: "work_orders",
      permission: ["view", "view_owned"],
      description: [
        {
          type: "text",
          text: "After adding members, equipment, and locks, you can start creating work orders with full use of machine-specific steps, assignments, and LOTO tracking. A work order defines the tasks, required equipment, and safety steps for each maintenance activity.",
        },
      ],
    },
    {
      title: "Submit and Finish Work Order Step",
      icon: <BsListCheck />,
      iconSize: "80px",
      link: userIsSuperAdmin ? "/work-order" : "/assigned-work-order",
      description: [
        {
          type: "text",
          text: "Assigned members are responsible for the work order and must execute and submit each step to confirm completion and maintain clear progress records.",
        },
      ],
    },
    {
      title: "View Report",
      icon: <GoChecklist />,
      iconSize: "80px",
      link: "/report",
      module: "reports",
      permission: ["view", "view_assigned"],
      description: [
        {
          type: "text",
          text: "After all the work order steps are finished, a report is automatically generated to review all submitted steps and the final outcome of the work order.",
        },
      ],
    },
  ];
  return (
    <StarterGuidePageLayout>
      <Flex maxW={"65%"} flexDir={"column"}>
        <Center flexDir={"column"} h={"100%"}>
          {starterGuideFlow.map((flow, index) => {
            const hasAccess =
              !flow.module ||
              checkHasPermission(userSelector, flow.module, flow.permission);
            return (
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
                      index + 1 === starterGuideFlow.length
                        ? "hidden"
                        : "visible"
                    }
                    w={"2px"}
                    bg={"#dc143c"}
                  ></Flex>
                </Flex>
                {hasAccess ? (
                  <Link
                    className={"remove-link-deco"}
                    style={{ width: "100%", pointerEvents: "" }}
                    to={flow.link}
                  >
                    <GuideFlowCard flow={flow} />
                  </Link>
                ) : (
                  <Box cursor={"not-allowed"}>
                    <GuideFlowCard flow={flow} />
                  </Box>
                )}
              </Flex>
            );
          })}
        </Center>
      </Flex>
    </StarterGuidePageLayout>
  );
}
function GuideFlowCard({ flow }) {
  return (
    <Flex
      w={"100%"}
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
        <Box fontSize={"14px"}>{formatRichText(flow.description)}</Box>
      </Flex>
    </Flex>
  );
}
