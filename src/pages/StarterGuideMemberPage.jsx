import { Center, Flex } from "@chakra-ui/react";
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

export default function StarterGuidePage() {
  const userSelector = useSelector((state) => state.login.auth);
  const userIsSuperAdmin = userSelector?.is_superadmin;
  const starterGuideFlow = [
    {
      title: "Invite Member",
      icon: <FaUserPlus />,
      iconSize: "80px",
      link: checkHasPermission(userSelector, "members", [
        "view",
        "view_assigned",
      ])
        ? "/member"
        : null,
      description:
        "Add new members (users) to the system who will be responsible for performing LOTO procedures. Each member will have unique access and permission to ensure security and accountability",
    },
    {
      title: "Equipment/Machines",
      icon: <FaWrench />,
      iconSize: "80px",
      link: checkHasPermission(userSelector, "members", [
        "view",
        "view_assigned",
      ])
        ? "/equipment-machine"
        : null,
      description:
        "Add and manage the equipment and machines that require LOTO procedures. Each piece of equipment will have its own profile for tracking and inspection",
    },
    {
      title: "Inspection Form",
      icon: <LiaClipboardListSolid />,
      iconSize: "80px",
      link: checkHasPermission(userSelector, "members", ["view"])
        ? "/inspection-form"
        : null,
      description:
        "Create an inspection forms for LOTO Procedures and attach them to the same machine category u created the machine with, These forms ensure that all safety checks are completed before and after lockout",
    },
    {
      title: "Add Lock",
      icon: <TbLockPlus />,
      iconSize: "80px",
      link: checkHasPermission(userSelector, "lock_inventory", ["view"])
        ? "/lock-inventory"
        : null,
      description:
        "Register and assign smart padlocks to the system. Each lock will be uniquely identified and linked to a specific equipment, members, or LOTO procedures for tracking and accountability",
    },
    {
      title: "Create Work Order",
      icon: <IoIosPaper />,
      iconSize: "80px",
      link: checkHasPermission(userSelector, "work_orders", [
        "view",
        "view_owned",
      ])
        ? "/work-order"
        : null,
      description:
        "After adding members, equipment, and locks, you can start creating work orders with full use of machine-specific steps, assignments, and LOTO tracking. A work order defines the tasks, required equipment, and safety steps for each maintenance activity.",
    },
    {
      title: "Submit and Finish Work Order Step",
      icon: <BsListCheck />,
      iconSize: "80px",
      link: userIsSuperAdmin
        ? null
        : checkHasPermission(userSelector, "assigned_work_orders", [
            "full_access",
          ])
        ? "/assigned-work-order"
        : null,
      description:
        "Assigned members are responsible for the work order and must execute and submit each step to confirm completion and maintain clear progress records.",
    },
    {
      title: "View Report",
      icon: <GoChecklist />,
      iconSize: "80px",
      link: checkHasPermission(userSelector, "reports", [
        "view",
        "view_assigned",
      ])
        ? "/report"
        : null,
      description:
        "After all the work order steps are finished, a report is automatically generated to review all submitted steps and the final outcome of the work order.",
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
              {flow.link ? (
                <Link
                  style={{
                    width: "100%",
                    cursor: flow.link ? "pointer" : "default",
                  }}
                  to={flow.link || null}
                  _hover={{ textDecoration: "none" }}
                >
                  <FlowCard flow={flow} />
                </Link>
              ) : (
                <FlowCard flow={flow} />
              )}
            </Flex>
          ))}
        </Center>
      </Flex>
    </StarterGuidePageLayout>
  );
}
function FlowCard({ flow }) {
  return (
    <Flex w="100%" py="30px" px="30px" gap="40px" _hover={{ bg: "#ededed" }}>
      <Flex color="#dc143c" fontSize={flow.iconSize}>
        {flow.icon}
      </Flex>
      <Flex flexDir="column">
        <Flex fontSize="24px" fontWeight={700} color="#dc143c">
          {flow.title}
        </Flex>
        <Flex fontSize="14px">{flow.description}</Flex>
      </Flex>
    </Flex>
  );
}
