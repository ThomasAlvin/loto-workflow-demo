import { Box, Center, Flex, Spinner } from "@chakra-ui/react";
import { useLoading } from "../../service/LoadingContext";
import LoadingOverlay from "../LoadingOverlay";
import { NotificationProvider } from "../../service/NotificationContext";
import NavSidebar from "../NavSidebar";
import { useState } from "react";

export default function PageLayout({ children }) {
  const { loading, setLoading } = useLoading();
  const [hideSidebar, setHideSidebar] = useState(false);
  return (
    <>
      <NotificationProvider>
        <Flex flexDir={"column"} minH={"100vh"}>
          <Flex flexDir={"column"}>
            <NavSidebar
              hideSidebar={hideSidebar}
              setHideSidebar={setHideSidebar}
            />
            <Flex
              paddingLeft={hideSidebar ? "70px" : "280px"}
              // paddingLeft={hideSidebar ? "0px" : "60px"}
              transition="padding-left 0.2s"
            >
              {children}
            </Flex>
          </Flex>
        </Flex>
        {loading && <LoadingOverlay />}
      </NotificationProvider>
    </>
  );
}
