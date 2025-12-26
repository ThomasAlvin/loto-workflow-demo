import {
  Flex,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { BsArrows } from "react-icons/bs";

export default function SubscriptionSettingsSkeleton() {
  return (
    <Flex flexDir={"column"} w={"100%"} gap={"30px"} pb={"100px"}>
      <Flex flexDir={"column"} gap={"10px"}>
        <Flex flexDir={"column"}>
          <Flex color={"#dc143c"} fontSize={"20px"} fontWeight={700}>
            Current Plan
          </Flex>
          <Flex color={"#848484"}>
            Manage current plan and billing information.
          </Flex>
        </Flex>
        <Flex
          bg={"#f8f9fa"}
          boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          flexDir={"column"}
        >
          <Flex w={"100%"} border={"1px solid #bababa"}>
            <Flex
              flexDir={"column"}
              borderRight={"1px solid #bababa"}
              w={"50%"}
              p={"20px"}
              gap={"10px"}
              justify={"space-between"}
            >
              <Flex color={"#848484"}>PLAN</Flex>
              <Flex flexDir={"column"} gap={"5px"}>
                <Flex fontSize={"24px"} fontWeight={700}>
                  <Skeleton w={"160px"} h={"30px"} />
                </Flex>
                <Flex fontSize={"14px"} color={"#848484"}>
                  <Skeleton w={"400px"} h={"22px"} />
                </Flex>
              </Flex>

              <Flex
                w={"fit-content"}
                _hover={{ textDecor: "underline" }}
                color={"#dc143c"}
              >
                <Skeleton w={"200px"} h={"22px"} />
              </Flex>
            </Flex>
            <Flex
              flexDir={"column"}
              borderRight={"1px solid #bababa"}
              w={"50%"}
              p={"20px"}
              gap={"10px"}
              justify={"space-between"}
            >
              <Flex color={"#848484"}>BILLING CYCLE</Flex>
              <Flex flexDir={"column"} gap={"5px"}>
                <Flex fontSize={"24px"} fontWeight={700}>
                  <Skeleton w={"160px"} h={"30px"} />
                </Flex>
                <Flex fontSize={"14px"} color={"#848484"}>
                  <Skeleton w={"400px"} h={"22px"} />
                </Flex>
              </Flex>
              <Flex
                w={"fit-content"}
                _hover={{ textDecor: "underline" }}
                color={"#dc143c"}
              >
                <Skeleton w={"200px"} h={"22px"} />
              </Flex>
            </Flex>
          </Flex>
          <Flex w={"100%"} border={"1px solid #bababa"} borderTop={"none"}>
            <Flex
              flexDir={"column"}
              borderRight={"1px solid #bababa"}
              w={"50%"}
              p={"20px"}
              gap={"10px"}
              justify={"space-between"}
            >
              <Flex color={"#848484"}>BILLING DATE</Flex>
              <Flex gap={"30px"} alignItems={"center"}>
                <Flex fontWeight={700} flexDir={"column"} gap={"5px"}>
                  <Flex color={"#dc143c"}>
                    <Skeleton w={"120px"} h={"22px"} />
                  </Flex>
                  <Flex fontSize={"24px"}>
                    <Skeleton w={"150px"} h={"36px"} />
                  </Flex>
                </Flex>
                <Flex fontSize={"24px"} color={"#848484"}>
                  <BsArrows />
                </Flex>
                <Flex fontWeight={700} flexDir={"column"} gap={"5px"}>
                  <Flex color={"#dc143c"}>
                    <Skeleton w={"120px"} h={"22px"} />
                  </Flex>
                  <Flex fontSize={"24px"}>
                    <Skeleton w={"150px"} h={"36px"} />
                  </Flex>
                </Flex>
              </Flex>
              <Flex
                w={"fit-content"}
                _hover={{ textDecor: "underline" }}
                color={"#dc143c"}
              >
                <Skeleton w={"200px"} h={"22px"} />
              </Flex>
            </Flex>
            <Flex
              flexDir={"column"}
              borderRight={"1px solid #bababa"}
              w={"50%"}
              p={"20px"}
              gap={"10px"}
              justify={"space-between"}
            >
              <Flex color={"#848484"}>STATUS</Flex>
              <Flex flexDir={"column"}>
                <Flex flexDir={"column"} gap={"5px"}>
                  <Flex fontSize={"24px"} fontWeight={700}>
                    <Skeleton w={"160px"} h={"30px"} />
                  </Flex>
                  <Flex fontSize={"14px"} color={"#848484"}>
                    <Skeleton w={"400px"} h={"22px"} />
                  </Flex>
                </Flex>
              </Flex>
              <Flex
                w={"fit-content"}
                _hover={{ textDecor: "underline" }}
                color={"#dc143c"}
              >
                <Skeleton w={"200px"} h={"22px"} />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex flexDir={"column"} gap={"10px"}>
        <Flex justify={"space-between"} alignItems={"center"}>
          <Flex flexDir={"column"}>
            <Flex color={"#dc143c"} fontSize={"20px"} fontWeight={700}>
              Payment Method
            </Flex>
            <Flex color={"#848484"}>
              Manage payment method and billing information.
            </Flex>
          </Flex>
        </Flex>
        <Flex justify={"space-between"} alignItems={"center"}>
          <Flex alignItems={"center"} gap={"10px"}>
            <Skeleton w={"90px"} h={"42px"} />
            <Flex flexDir={"column"} gap={"2px"}>
              <Skeleton w={"300px"} h={"20px"} />
              <Flex color={"#848484"} fontSize={"14px"}>
                <Skeleton w={"120px"} h={"20px"} />
              </Flex>
            </Flex>
          </Flex>
          <Flex>
            <Skeleton w={"90px"} h={"32px"} />
          </Flex>
        </Flex>
      </Flex>
      <Flex flexDir={"column"} gap={"10px"}>
        <Flex justify={"space-between"} alignItems={"center"}>
          <Flex flexDir={"column"}>
            <Flex color={"#dc143c"} fontSize={"20px"} fontWeight={700}>
              Billing History
            </Flex>
            <Flex color={"#848484"}>View your past payments and invoices.</Flex>
          </Flex>
          <Flex>
            <Skeleton />
          </Flex>
        </Flex>
        <Flex position={"relative"}>
          <TableContainer
            w={"100%"}
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          >
            <Table variant="simple">
              <Thead bg={"#ECEFF3"}>
                <Tr>
                  <Th
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                    w={"55%"}
                  >
                    Invoice
                  </Th>
                  <Th
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                    w={"15%"}
                  >
                    Amount
                  </Th>

                  <Th
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                    w={"15%"}
                  >
                    Date
                  </Th>
                  <Th
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                    w={"10%"}
                  >
                    Status
                  </Th>
                  <Th
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                    w={"5%"}
                  >
                    Download
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr fontSize={"14px"}>
                  <Td borderBottomColor={"#bababa"} fontWeight={700}>
                    <Skeleton w={"280px"} h={"22px"} />
                  </Td>

                  <Td
                    borderBottomColor={"#bababa"}
                    color={"#292D3F"}
                    fontWeight={700}
                  >
                    <Skeleton w={"120px"} h={"22px"} />
                  </Td>
                  <Td
                    borderBottomColor={"#bababa"}
                    color={"#292D3F"}
                    fontWeight={700}
                  >
                    <Skeleton w={"120px"} h={"22px"} />
                  </Td>
                  <Td
                    borderBottomColor={"#bababa"}
                    color={"#292D3F"}
                    fontWeight={700}
                  >
                    <Skeleton w={"120px"} h={"22px"} />
                  </Td>
                  <Td
                    borderBottomColor={"#bababa"}
                    color={"#292D3F"}
                    fontWeight={700}
                  >
                    <Flex
                      justify={"center"}
                      fontSize={"20px"}
                      color={"#28A745"}
                      cursor={"pointer"}
                    >
                      <Skeleton w={"22px"} h={"22px"} />
                    </Flex>
                  </Td>
                </Tr>

                <Tr fontSize={"14px"}>
                  <Td borderBottomColor={"#bababa"} fontWeight={700}>
                    <Skeleton w={"280px"} h={"22px"} />
                  </Td>

                  <Td
                    borderBottomColor={"#bababa"}
                    color={"#292D3F"}
                    fontWeight={700}
                  >
                    <Skeleton w={"120px"} h={"22px"} />
                  </Td>
                  <Td
                    borderBottomColor={"#bababa"}
                    color={"#292D3F"}
                    fontWeight={700}
                  >
                    <Skeleton w={"120px"} h={"22px"} />
                  </Td>
                  <Td
                    borderBottomColor={"#bababa"}
                    color={"#292D3F"}
                    fontWeight={700}
                  >
                    <Skeleton w={"120px"} h={"22px"} />
                  </Td>
                  <Td
                    borderBottomColor={"#bababa"}
                    color={"#292D3F"}
                    fontWeight={700}
                  >
                    <Flex
                      justify={"center"}
                      fontSize={"20px"}
                      color={"#28A745"}
                      cursor={"pointer"}
                    >
                      <Skeleton w={"22px"} h={"22px"} />
                    </Flex>
                  </Td>
                </Tr>
                <Tr fontSize={"14px"}>
                  <Td borderBottomColor={"#bababa"} fontWeight={700}>
                    <Skeleton w={"280px"} h={"22px"} />
                  </Td>

                  <Td
                    borderBottomColor={"#bababa"}
                    color={"#292D3F"}
                    fontWeight={700}
                  >
                    <Skeleton w={"120px"} h={"22px"} />
                  </Td>
                  <Td
                    borderBottomColor={"#bababa"}
                    color={"#292D3F"}
                    fontWeight={700}
                  >
                    <Skeleton w={"120px"} h={"22px"} />
                  </Td>
                  <Td
                    borderBottomColor={"#bababa"}
                    color={"#292D3F"}
                    fontWeight={700}
                  >
                    <Skeleton w={"120px"} h={"22px"} />
                  </Td>
                  <Td
                    borderBottomColor={"#bababa"}
                    color={"#292D3F"}
                    fontWeight={700}
                  >
                    <Flex
                      justify={"center"}
                      fontSize={"20px"}
                      color={"#28A745"}
                      cursor={"pointer"}
                    >
                      <Skeleton w={"22px"} h={"22px"} />
                    </Flex>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>
    </Flex>
  );
}
