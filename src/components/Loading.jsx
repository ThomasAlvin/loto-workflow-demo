import { Flex, Spinner } from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";

export default function Loading() {
  const themeSelector = useSelector((state) => state.login.theme);
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
      bg={themeSelector?.theme === "light" ? "white" : "#38444E"}
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Flex>
  );
}
