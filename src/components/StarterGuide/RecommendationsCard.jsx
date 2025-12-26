import { Flex, Grid, GridItem } from "@chakra-ui/react";
import { FaChevronRight, FaUserTie } from "react-icons/fa";
import { IoCheckmarkCircle, IoRocket } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
export default function RecommendationsCard() {
  const location = useLocation();
  const pathSegments = location.pathname;

  const steps = [
    {
      title: "Start",
      description: "Starter Guide for new users",
      icon: <IoRocket />,
      link: "/starter-guide",
    },
    {
      title: "Member Roles",
      description: "What are members and roles?",
      icon: <FaUserTie />,
      link: "/starter-guide/member",
    },
    // -X Hide for production X-
    // {
    //   title: "Equipment/Machines",
    //   description: "Categories & Inspection Forms",
    //   icon: <FaCogs />,
    //   link: "/starter-guide/equipment-machine",
    // },
    // {
    //   title: "Work Order",
    //   description: "Templates & Work orders",
    //   icon: <FaClipboardList />,
    //   link: "/starter-guide/work-order",
    // },
  ];
  return (
    <Flex flexDir={"column"} gap={"10px"}>
      <Flex justify={"space-between"}>
        <Flex
          fontWeight={700}
          fontSize={"18px"}
          alignItems={"center"}
          gap={"5px"}
        >
          <Flex fontSize={"20px"} color={"#dc143c"}>
            <IoCheckmarkCircle />
          </Flex>{" "}
          Recommendations
        </Flex>
      </Flex>
      <Flex
        w={"100%"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        bg={"#f8f9fa"}
        p={"20px"}
      >
        <Grid w={"100%"} templateColumns="repeat(4, 1fr)" gap={5}>
          {steps.map((step) =>
            pathSegments === step?.link ? (
              <GridItem
                p={"10px"}
                w="100%"
                borderRadius={"10px"}
                cursor={"pointer"}
                bg={"#FDE2E2"}
                boxShadow={"0px 0px 3px rgba(220, 20, 60,1)"}
                transition={"0.1s ease-in-out"}
                role="group"
                color={"#dc143c"}
              >
                <Flex gap={"10px"} alignItems={"center"}>
                  <Flex
                    justify={"center"}
                    borderRadius={"100%"}
                    minW={"40px"}
                    minH={"40px"}
                    alignItems={"center"}
                    fontSize={"20px"}
                    bg={"#dc143c"}
                    color={"white"}
                  >
                    {step.icon}
                  </Flex>
                  <Flex w={"100%"} flexDir={"column"}>
                    <Flex
                      w={"100%"}
                      fontWeight={700}
                      alignItems={"center"}
                      justify={"space-between"}
                    >
                      <Flex>{step.title}</Flex>
                      <Flex display={"flex"} fontSize={"20px"}>
                        <IoCheckmarkCircle />
                      </Flex>
                    </Flex>
                    <Flex color={"#848484"} fontSize={"14px"}>
                      {step.description}
                    </Flex>
                  </Flex>
                </Flex>
              </GridItem>
            ) : (
              <Link to={step?.link}>
                <GridItem
                  p={"10px"}
                  w="100%"
                  borderRadius={"10px"}
                  bg={"white"}
                  cursor={"pointer"}
                  _hover={{
                    bg: "#FDE2E2",
                    boxShadow: "0px 0px 3px rgba(220, 20, 60,1)",
                  }}
                  transition={"0.1s ease-in-out"}
                  role="group"
                  color={"#dc143c"} // outline={"1px solid #dc143c"}
                  // border={"2px solid black"}
                  boxShadow={"0px 0px 3px rgba(50, 50, 93,0.5)"}
                >
                  <Flex gap={"10px"} alignItems={"center"}>
                    <Flex
                      justify={"center"}
                      borderRadius={"100%"}
                      minW={"40px"}
                      minH={"40px"}
                      _groupHover={{
                        boxShadow: "none",
                        color: "white",
                        bg: "#dc143c",
                        // outline: "1px solid white",
                      }}
                      boxShadow={"0px 0px 3px rgba(0,0,0,1)"}
                      // outline={"1px solid #848484"}
                      alignItems={"center"}
                      fontSize={"20px"}
                      color={"#848484"}
                    >
                      {step.icon}
                    </Flex>
                    <Flex w={"100%"} flexDir={"column"}>
                      <Flex
                        w={"100%"}
                        fontWeight={700}
                        alignItems={"center"}
                        justify={"space-between"}
                      >
                        <Flex>{step.title}</Flex>
                        <Flex
                          // _groupHover={{ display: "flex" }}
                          display={"none"}
                          fontSize={"20px"}
                        >
                          <IoCheckmarkCircle />
                        </Flex>
                      </Flex>
                      <Flex color={"#848484"} fontSize={"14px"}>
                        {step.description}
                      </Flex>
                    </Flex>
                  </Flex>
                </GridItem>
              </Link>
            )
          )}
        </Grid>
      </Flex>
    </Flex>
  );
}
