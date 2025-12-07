import { Flex } from "@chakra-ui/react";
import RecommendationsCard from "../components/StarterGuide/RecommendationsCard";
import CompleteRoleAccessibilityTable from "../components/CompleteRoleAccessibilityTable";

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
