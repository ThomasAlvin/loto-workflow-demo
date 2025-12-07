import { Center, Flex } from "@chakra-ui/react";
import RecommendationsCard from "../StarterGuide/RecommendationsCard";

export default function StarterGuidePageLayout({ children }) {
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
        Starter Guide
      </Flex>
      <RecommendationsCard />
      <Flex flexDir={"column"}>
        <Center w={"100%"} justify={"center"} flexDir={"column"}>
          {children}
        </Center>
      </Flex>
    </Flex>
  );
}
