import {
  Button,
  Flex,
  Grid,
  GridItem,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";

import { FaRegCalendarAlt, FaUsers } from "react-icons/fa";
import { FaChevronRight, FaUserLarge, FaWrench } from "react-icons/fa6";
import {
  LuClipboardCheck,
  LuClipboardPen,
  LuClipboardList,
  LuClipboardPaste,
} from "react-icons/lu";
import { AiFillPlusCircle } from "react-icons/ai";

export default function DashboardPageSkeleton() {
  const summaryCards = [
    {
      title: "Users",
      icon: <FaUsers />,
      bgColor: "#FDE2E2",
      color: "#dc143c",
    },
    {
      title: "Total Work Orders",
      icon: <LuClipboardList />,
      bgColor: "#e6e6fa",
      color: "#7059ff",
    },
    {
      title: "Ongoing Work Orders",
      icon: <LuClipboardPaste />,
      bgColor: "#ffeebd",
      color: "#ff9100",
    },
    {
      title: "Finished Work Orders",
      icon: <LuClipboardCheck />,
      bgColor: "#DBF6CB",
      color: "#3D9666",
    },
  ];
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex alignItems={"center"} justify={"space-between"}>
        <Flex color={"#dc143c"} fontSize={"28px"} fontWeight={700}>
          Dashboard
        </Flex>
        <Button
          w={"140px"}
          isLoading={true}
          flexShrink={0}
          color={"white"}
          bg={"#dc143c"}
          h={"28px"}
          px={"12px"}
          alignContent={"center"}
          fontSize={"14px"}
        ></Button>
      </Flex>
      <Grid templateColumns="repeat(12, 1fr)" gap={"30px"}>
        {summaryCards.map((val) => (
          <GridItem
            w="100%"
            h="140px"
            bg={"#f8f9fa"}
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
            colSpan={"3"}
          >
            <Flex
              flexDir={"column"}
              h={"100%"}
              justify={"space-between"}
              p={"20px"}
            >
              <Flex justify={"space-between"} alignItems={"center"}>
                <Flex color={"#848484"}>{val.title}</Flex>
                <Flex
                  borderRadius={"100%"}
                  w={"40px"}
                  h={"40px"}
                  fontSize={"20px"}
                  bg={val.bgColor}
                  color={val.color}
                  justify={"center"}
                  alignItems={"center"}
                >
                  {val.icon}
                </Flex>
              </Flex>
              <Flex fontSize={"24px"} fontWeight={700}>
                <Skeleton h={"32px"} w={"80px"} />
              </Flex>
            </Flex>
          </GridItem>
        ))}
      </Grid>

      <Grid
        templateColumns="repeat(12, 1fr)"
        columnGap={"30px"}
        rowGap={"10px"}
      >
        <GridItem w="100%" colSpan={"8"}>
          <Flex justify={"space-between"}>
            <Flex gap={"10px"} alignItems={"center"} fontWeight={700}>
              <Flex fontSize={"20px"}>
                <FaRegCalendarAlt />
              </Flex>
              <Flex>Recent Activity</Flex>
            </Flex>
            <Flex
              cursor={"pointer"}
              color={"#dc143c"}
              fontWeight={700}
              gap={"5px"}
              alignItems={"center"}
            >
              See All <FaChevronRight />
            </Flex>
          </Flex>
        </GridItem>
        <GridItem h={"100%"} w="100%" colSpan={"4"}>
          <Flex justify={"space-between"}>
            <Flex gap={"10px"} alignItems={"center"} fontWeight={700}>
              <Flex fontSize={"20px"}>
                <FaUserLarge />
              </Flex>
              <Flex>Members</Flex>
            </Flex>
            <Flex
              color={"#dc143c"}
              alignItems={"center"}
              gap={"5px"}
              fontWeight={700}
              cursor={"pointer"}
              fontSize={"24px"}
            >
              <Tooltip
                hasArrow
                placement={"top"}
                background={"#dc143c"}
                label={"Add Member"}
                aria-label="A tooltip"
                color={"white"}
              >
                <Flex>
                  <AiFillPlusCircle />
                </Flex>
              </Tooltip>
            </Flex>
          </Flex>
        </GridItem>
        <GridItem
          w="100%"
          boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          colSpan={"8"}
        >
          <TableContainer>
            <Table variant="simple">
              <Thead bg={"#ECEFF3"}>
                <Tr>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Name
                  </Th>
                  {/* <Th>Email</Th> */}
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Section
                  </Th>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Activity
                  </Th>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Date and Time
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr fontSize={"14px"} color={"#848484"}>
                  <Td>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Skeleton h={"40px"} w={"40px"} borderRadius={"100%"} />

                      <Flex flexDir={"column"} gap={"6px"}>
                        <Flex color={"black"} fontWeight={700}>
                          <Skeleton h={"16px"} w={"120px"} />
                          {/* Jennifer Lawrence */}
                        </Flex>
                        <Skeleton h={"16px"} w={"120px"} />
                      </Flex>
                    </Flex>
                  </Td>
                  <Td>
                    <Skeleton h={"16px"} w={"80px"} />
                  </Td>
                  <Td>
                    <Skeleton h={"16px"} w={"80px"} />
                  </Td>
                  <Td>
                    <Skeleton h={"16px"} w={"120px"} />
                  </Td>
                </Tr>
                <Tr fontSize={"14px"} color={"#848484"}>
                  <Td>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Skeleton h={"40px"} w={"40px"} borderRadius={"100%"} />

                      <Flex flexDir={"column"} gap={"6px"}>
                        <Flex color={"black"} fontWeight={700}>
                          <Skeleton h={"16px"} w={"120px"} />
                          {/* Jennifer Lawrence */}
                        </Flex>
                        <Skeleton h={"16px"} w={"120px"} />
                      </Flex>
                    </Flex>
                  </Td>
                  <Td>
                    <Skeleton h={"16px"} w={"80px"} />
                  </Td>
                  <Td>
                    <Skeleton h={"16px"} w={"80px"} />
                  </Td>
                  <Td>
                    <Skeleton h={"16px"} w={"120px"} />
                  </Td>
                </Tr>
                <Tr fontSize={"14px"} color={"#848484"}>
                  <Td>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Skeleton h={"40px"} w={"40px"} borderRadius={"100%"} />

                      <Flex flexDir={"column"} gap={"6px"}>
                        <Flex color={"black"} fontWeight={700}>
                          <Skeleton h={"16px"} w={"120px"} />
                          {/* Jennifer Lawrence */}
                        </Flex>
                        <Skeleton h={"16px"} w={"120px"} />
                      </Flex>
                    </Flex>
                  </Td>
                  <Td>
                    <Skeleton h={"16px"} w={"80px"} />
                  </Td>
                  <Td>
                    <Skeleton h={"16px"} w={"80px"} />
                  </Td>
                  <Td>
                    <Skeleton h={"16px"} w={"120px"} />
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </GridItem>
        <GridItem
          w="100%"
          boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          colSpan={"4"}
        >
          <Flex h={"100%"} flexDir={"column"}>
            <Flex
              cursor={"pointer"}
              _hover={{ bg: "#f8f9fa" }}
              transition={"background-color 0.2s ease"}
              py={"10px"}
              borderBottom={"1px solid #bababa"}
              flexDir={"column"}
              px={"20px"}
            >
              <Flex alignItems={"center"} gap={"10px"}>
                <Skeleton h={"40px"} w={"40px"} borderRadius={"100%"} />

                <Flex flexDir={"column"} gap={"5px"}>
                  <Flex color={"black"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"180px"} />
                  </Flex>
                  <Flex fontSize={"14px"} color={"#848484"}>
                    <Skeleton h={"20px"} w={"180px"} />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <Flex
              cursor={"pointer"}
              _hover={{ bg: "#f8f9fa" }}
              transition={"background-color 0.2s ease"}
              py={"10px"}
              borderBottom={"1px solid #bababa"}
              flexDir={"column"}
              px={"20px"}
            >
              <Flex alignItems={"center"} gap={"10px"}>
                <Skeleton h={"40px"} w={"40px"} borderRadius={"100%"} />

                <Flex flexDir={"column"} gap={"5px"}>
                  <Flex color={"black"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"180px"} />
                  </Flex>
                  <Flex fontSize={"14px"} color={"#848484"}>
                    <Skeleton h={"20px"} w={"180px"} />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <Flex
              cursor={"pointer"}
              _hover={{ bg: "#f8f9fa" }}
              transition={"background-color 0.2s ease"}
              py={"10px"}
              borderBottom={"1px solid #bababa"}
              flexDir={"column"}
              px={"20px"}
            >
              <Flex alignItems={"center"} gap={"10px"}>
                <Skeleton h={"40px"} w={"40px"} borderRadius={"100%"} />

                <Flex flexDir={"column"} gap={"5px"}>
                  <Flex color={"black"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"180px"} />
                  </Flex>
                  <Flex fontSize={"14px"} color={"#848484"}>
                    <Skeleton h={"20px"} w={"180px"} />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <Flex
              cursor={"pointer"}
              _hover={{ bg: "#f8f9fa" }}
              transition={"background-color 0.2s ease"}
              py={"10px"}
              borderBottom={"1px solid #bababa"}
              flexDir={"column"}
              px={"20px"}
            >
              <Flex alignItems={"center"} gap={"10px"}>
                <Skeleton h={"40px"} w={"40px"} borderRadius={"100%"} />

                <Flex flexDir={"column"} gap={"5px"}>
                  <Flex color={"black"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"180px"} />
                  </Flex>
                  <Flex fontSize={"14px"} color={"#848484"}>
                    <Skeleton h={"20px"} w={"180px"} />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>

            {/* <Flex
              cursor={"pointer"}
              _hover={{ bg: "#f8f9fa" }}
              transition={"background-color 0.2s ease"}
              py={"10px"}
              borderBottom={"1px solid #bababa"}
              flexDir={"column"}
              px={"20px"}
            >
              <Flex alignItems={"center"} gap={"10px"}>
                <Flex
                  bg={"#bababa"}
                  borderRadius={"100%"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  h={"40px"}
                  w={"40px"}
                  border={"2px solid white"}
                >
                  <Flex color={"white"} fontSize={"20px"}>
                    <FaUserAlt />
                  </Flex>
                </Flex>
                <Flex flexDir={"column"}>
                  <Flex color={"black"} fontWeight={700}>
                    Jennifer Lawrence
                  </Flex>
                  <Flex fontSize={"14px"} color={"#848484"}>
                    Authorized Employee - 555-102
                  </Flex>
                </Flex>
              </Flex>
            </Flex> */}
          </Flex>
        </GridItem>
      </Grid>
      <Grid
        columnGap={"30px"}
        rowGap={"10px"}
        templateColumns="repeat(12, 1fr)"
      >
        <GridItem w="100%" fontSize={"16px"} colSpan={"12"}>
          <Flex justify={"space-between"}>
            <Flex gap={"10px"} alignItems={"center"} fontWeight={700}>
              <Flex fontSize={"20px"}>
                <LuClipboardPen />
              </Flex>
              <Flex>Latest Work Orders</Flex>
            </Flex>
            <Flex
              cursor={"pointer"}
              color={"#dc143c"}
              fontWeight={700}
              gap={"5px"}
              alignItems={"center"}
            >
              See All <FaChevronRight />
            </Flex>
          </Flex>
        </GridItem>
        <GridItem
          w="100%"
          boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          colSpan={"12"}
        >
          <TableContainer>
            <Table variant="simple">
              <Thead bg={"#ECEFF3"}>
                <Tr>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Work Order
                  </Th>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Current Assignee
                  </Th>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Progress
                  </Th>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Status
                  </Th>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Deadline
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr fontSize={"14px"} color={"#848484"}>
                  <Td fontWeight={700}>
                    <Skeleton h={"20px"} w={"180px"} />
                  </Td>
                  <Td>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Skeleton h={"40px"} w={"40px"} borderRadius={"100%"} />

                      <Flex flexDir={"column"} gap={"6px"}>
                        <Flex color={"black"} fontWeight={700}>
                          <Skeleton h={"16px"} w={"150px"} />
                          {/* Jennifer Lawrence */}
                        </Flex>
                        <Skeleton h={"16px"} w={"150px"} />
                      </Flex>
                    </Flex>
                  </Td>
                  <Td>
                    <Flex w={"100%"} flexDir={"column"}>
                      <Skeleton h={"20px"} w={"180px"} />
                    </Flex>
                  </Td>
                  <Td color={"#848484"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"80px"} />
                  </Td>
                  <Td color={"#848484"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"150px"} />
                  </Td>
                </Tr>
                <Tr fontSize={"14px"} color={"#848484"}>
                  <Td fontWeight={700}>
                    <Skeleton h={"20px"} w={"180px"} />
                  </Td>
                  <Td>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Skeleton h={"40px"} w={"40px"} borderRadius={"100%"} />

                      <Flex flexDir={"column"} gap={"6px"}>
                        <Flex color={"black"} fontWeight={700}>
                          <Skeleton h={"16px"} w={"150px"} />
                          {/* Jennifer Lawrence */}
                        </Flex>
                        <Skeleton h={"16px"} w={"150px"} />
                      </Flex>
                    </Flex>
                  </Td>
                  <Td>
                    <Flex w={"100%"} flexDir={"column"}>
                      <Skeleton h={"20px"} w={"180px"} />
                    </Flex>
                  </Td>
                  <Td color={"#848484"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"80px"} />
                  </Td>
                  <Td color={"#848484"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"150px"} />
                  </Td>
                </Tr>

                <Tr fontSize={"14px"} color={"#848484"}>
                  <Td fontWeight={700}>
                    <Skeleton h={"20px"} w={"180px"} />
                  </Td>
                  <Td>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Skeleton h={"40px"} w={"40px"} borderRadius={"100%"} />

                      <Flex flexDir={"column"} gap={"6px"}>
                        <Flex color={"black"} fontWeight={700}>
                          <Skeleton h={"16px"} w={"150px"} />
                          {/* Jennifer Lawrence */}
                        </Flex>
                        <Skeleton h={"16px"} w={"150px"} />
                      </Flex>
                    </Flex>
                  </Td>
                  <Td>
                    <Flex w={"100%"} flexDir={"column"}>
                      <Skeleton h={"20px"} w={"180px"} />
                    </Flex>
                  </Td>
                  <Td color={"#848484"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"80px"} />
                  </Td>
                  <Td color={"#848484"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"150px"} />
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </GridItem>
      </Grid>
      <Grid
        columnGap={"30px"}
        rowGap={"10px"}
        templateColumns="repeat(12, 1fr)"
      >
        <GridItem w="100%" fontSize={"16px"} colSpan={"12"}>
          <Flex justify={"space-between"}>
            <Flex gap={"10px"} alignItems={"center"} fontWeight={700}>
              <Flex fontSize={"20px"}>
                <FaWrench />
              </Flex>
              <Flex>Equipment/Machines</Flex>
            </Flex>
            <Flex
              cursor={"pointer"}
              color={"#dc143c"}
              fontWeight={700}
              gap={"5px"}
              alignItems={"center"}
            >
              See All <FaChevronRight />
            </Flex>
          </Flex>
        </GridItem>
        <GridItem
          w="100%"
          boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          colSpan={"12"}
        >
          <TableContainer>
            <Table variant="simple">
              <Thead bg={"#ECEFF3"}>
                <Tr>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Equipment/Machine
                  </Th>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Machine ID
                  </Th>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Serial Number
                  </Th>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Status
                  </Th>
                  <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                    Location
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr fontSize={"14px"} color={"#848484"}>
                  <Td fontWeight={700}>
                    <Flex flexDir={"column"} gap={"5px"}>
                      <Skeleton h={"16px"} w={"180px"} />
                      <Skeleton h={"16px"} w={"180px"} />
                    </Flex>
                  </Td>
                  <Td>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Skeleton h={"20px"} w={"150px"} />
                    </Flex>
                  </Td>
                  <Td>
                    <Flex w={"100%"} flexDir={"column"}>
                      <Skeleton h={"20px"} w={"180px"} />
                    </Flex>
                  </Td>
                  <Td color={"#848484"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"80px"} />
                  </Td>
                  <Td color={"#848484"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"150px"} />
                  </Td>
                </Tr>
                <Tr fontSize={"14px"} color={"#848484"}>
                  <Td fontWeight={700}>
                    <Flex flexDir={"column"} gap={"5px"}>
                      <Skeleton h={"16px"} w={"180px"} />
                      <Skeleton h={"16px"} w={"180px"} />
                    </Flex>
                  </Td>
                  <Td>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Skeleton h={"20px"} w={"150px"} />
                    </Flex>
                  </Td>
                  <Td>
                    <Flex w={"100%"} flexDir={"column"}>
                      <Skeleton h={"20px"} w={"180px"} />
                    </Flex>
                  </Td>
                  <Td color={"#848484"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"80px"} />
                  </Td>
                  <Td color={"#848484"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"150px"} />
                  </Td>
                </Tr>
                <Tr fontSize={"14px"} color={"#848484"}>
                  <Td fontWeight={700}>
                    <Flex flexDir={"column"} gap={"5px"}>
                      <Skeleton h={"16px"} w={"180px"} />
                      <Skeleton h={"16px"} w={"180px"} />
                    </Flex>
                  </Td>
                  <Td>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Skeleton h={"20px"} w={"150px"} />
                    </Flex>
                  </Td>
                  <Td>
                    <Flex w={"100%"} flexDir={"column"}>
                      <Skeleton h={"20px"} w={"180px"} />
                    </Flex>
                  </Td>
                  <Td color={"#848484"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"80px"} />
                  </Td>
                  <Td color={"#848484"} fontWeight={700}>
                    <Skeleton h={"20px"} w={"150px"} />
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </GridItem>
      </Grid>
    </Flex>
  );
}
