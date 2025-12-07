import { Center, Flex, Spinner } from "@chakra-ui/react";

export default function ProcessingLoading() {
  return (
    <Center
      flexDir={"column"}
      alignItems={"center"}
      gap={"20px"}
      width="100%"
      height="100vh"
      opacity={1}
    >
      <Spinner thickness="4px" size="xl" color="#dc143c" />
      <Center flexDir={"column"} color={"#dc143c"} fontWeight={700}>
        <Flex fontWeight={700} fontSize={"20px"}>
          Loading
        </Flex>
        <Flex color={"black"}>Processing your request...</Flex>
      </Center>
    </Center>
  );
}
