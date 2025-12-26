import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Checkbox,
  Flex,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { memo } from "react";
import questionTypeIconMapper from "../utils/questionTypeIconMapper";
const InspectionQuestionAccordionMemo = ({
  question,
  type,
  required,
  format,
  includeDate,
  includeTime,
  unit,
  options,
  hasReactFlow = false,
}) => {
  return (
    <Accordion w={"100%"} allowToggle>
      <AccordionItem>
        <AccordionButton
          position={"static"}
          p={0}
          fontSize={"13px"}
          _expanded={{ boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.2)" }}
        >
          <Flex
            w={"100%"}
            alignItems={"stretch"}
            justifyContent={"space-between"}
          >
            <Flex w={"50%"} alignItems={"center"}>
              <Flex
                w={"100%"}
                position={"static"}
                cursor={"pointer"}
                px={"10px"}
                py={"5px"}
                color={"black"}
                textAlign={"start"}
                borderRight={"1px solid #E2E8F0"}
                whiteSpace={"pre-wrap"}
              >
                {question}
              </Flex>
            </Flex>
            <Flex
              justifyContent={"left"}
              borderRight={"#E2E8F0 1px solid"}
              textAlign={"start"}
              px={"10px"}
              py={"5px"}
              color={"#848484"}
              fontWeight={400}
              w={"25%"}
            >
              <Flex alignItems={"center"} gap={"10px"}>
                <Flex
                  bg={"#FFF3E5"}
                  color={"#FE8500"}
                  borderRadius={"20px"}
                  p={"5px"}
                >
                  {questionTypeIconMapper(type)}
                </Flex>
                <Flex>{type}</Flex>
              </Flex>
            </Flex>

            <Flex w={"25%"}>
              <Flex
                w={"100%"}
                justify={"space-between"}
                px={"10px"}
                gap={"10px"}
                alignItems={"center"}
              >
                <Flex gap={"10px"} alignItems={"center"}>
                  <Checkbox
                    // onChange={requiredCheckBoxHandler}
                    sx={{
                      cursor: "pointer !important", // Applying !important
                    }}
                    defaultChecked={required}
                    isDisabled={true}
                  />
                  <Flex>Required</Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </AccordionButton>
        <AccordionPanel w={"100%"} py={0}>
          <Flex w={"100%"} flexDir={"column"} gap={"10px"}>
            <Flex w={"100%"} fontSize={hasReactFlow ? "12px" : "14px"}>
              {(() => {
                switch (type) {
                  case "Text":
                    return (
                      <Flex py={"10px"} alignItems={"center"} gap={"10px"}>
                        <Flex>Format :</Flex>
                        <Flex>
                          <Flex
                            border={"1px solid #848484"}
                            borderRadius={"3px"}
                            px={"16px"}
                          >
                            {format}
                          </Flex>
                        </Flex>
                      </Flex>
                    );
                  case "Date & Time":
                    return (
                      <Flex py={"10px"} gap={"20px"}>
                        <Flex alignItems={"center"} gap={"10px"}>
                          <Flex gap={"10px"} alignItems={"center"}>
                            <Checkbox
                              isDisabled
                              onChange={() => {
                                // dateTimeCheckBoxHandler("date");
                              }}
                              defaultChecked={includeDate}
                            />
                            <Flex>Date</Flex>
                          </Flex>
                        </Flex>
                        <Flex alignItems={"center"} gap={"10px"}>
                          <Flex gap={"10px"} alignItems={"center"}>
                            <Checkbox
                              isDisabled
                              onChange={() => {
                                // dateTimeCheckBoxHandler("time");
                              }}
                              defaultChecked={includeTime}
                            />
                            <Flex>Time</Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                    );
                  case "Number":
                    return (
                      <Flex py={"10px"} gap={"20px"}>
                        <Flex alignItems={"center"} gap={"10px"}>
                          <Flex>Format :</Flex>
                          <Flex>
                            <Flex
                              border={"1px solid #848484"}
                              borderRadius={"3px"}
                              px={"16px"}
                            >
                              {format}
                            </Flex>
                          </Flex>
                        </Flex>
                        <Flex alignItems={"center"} gap={"10px"}>
                          <Flex>Unit :</Flex>
                          <Flex>
                            <Flex
                              border={"1px solid #848484"}
                              borderRadius={"3px"}
                              px={"16px"}
                            >
                              {unit}
                            </Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                    );
                  case "Multiple Choice":
                    return (
                      <Flex py={"10px"} w={"100%"} gap={"20px"}>
                        <Flex flexDir={"column"} w={"100%"} gap={"10px"}>
                          {options?.map((val, index) => {
                            return (
                              <Flex alignItems={"center"} gap={"10px"}>
                                <Flex
                                  border={"2px solid #848484"}
                                  borderRadius={"100%"}
                                  h={"20px"}
                                  w={"20px"}
                                />
                                <Flex
                                  fontSize={"13px"}
                                  w={"100%"}
                                  h={"40px"}
                                  alignItems={"center"}
                                  borderBottom={"1px solid #E2E8F0"}
                                  cursor={"default"}
                                  isReadOnly={true}
                                  placeholder={"Option " + (index + 1)}
                                  color={"black"}
                                  variant={"flushed"}
                                >
                                  {val}
                                </Flex>
                              </Flex>
                            );
                          })}
                        </Flex>
                      </Flex>
                    );
                  case "Checkbox":
                    return (
                      <Flex py={"10px"} w={"100%"} gap={"20px"}>
                        <Flex flexDir={"column"} w={"100%"} gap={"10px"}>
                          {options?.map((val, index) => {
                            return (
                              <Flex alignItems={"center"} gap={"10px"}>
                                <Flex
                                  border={"2px solid #848484"}
                                  borderRadius={"3px"}
                                  h={"20px"}
                                  w={"20px"}
                                />
                                <Flex
                                  fontSize={"13px"}
                                  w={"100%"}
                                  h={"40px"}
                                  alignItems={"center"}
                                  borderBottom={"1px solid #E2E8F0"}
                                  cursor={"default"}
                                  isReadOnly={true}
                                  onChange={(e) => {
                                    // optionInputHandler(e, index);
                                  }}
                                  placeholder={"Option " + (index + 1)}
                                  color={"black"}
                                  variant={"flushed"}
                                >
                                  {val}
                                </Flex>
                              </Flex>
                            );
                          })}
                        </Flex>
                      </Flex>
                    );
                  case "Checklist":
                    return (
                      <Flex py={"10px"} w={"100%"} gap={"20px"}>
                        <Flex
                          w={"100%"}
                          flexDir={"column"}
                          borderX={"1px solid #dc143c"}
                          borderBottom={"1px solid #dc143c"}
                        >
                          <Table variant="simple">
                            <Thead bg={"#dc143c"}>
                              <Tr>
                                <Th
                                  w={"5%"}
                                  color={"white"}
                                  px={"10px"}
                                  py={"5px"}
                                  borderBottomColor={"#bababa"}
                                  fontWeight={700}
                                  fontSize={"13px"}
                                  textAlign={"center"}
                                >
                                  No
                                </Th>
                                <Th
                                  w={"45%"}
                                  color={"white"}
                                  px={"10px"}
                                  py={"5px"}
                                  borderBottomColor={"#bababa"}
                                  fontWeight={700}
                                  fontSize={"13px"}
                                  borderX={"1px solid white"}
                                >
                                  Checklist
                                </Th>
                                <Th
                                  w={"15%"}
                                  color={"white"}
                                  px={"10px"}
                                  py={"5px"}
                                  borderBottomColor={"#bababa"}
                                  fontWeight={700}
                                  fontSize={"13px"}
                                  textAlign={"center"}
                                >
                                  Yes
                                </Th>
                                <Th
                                  w={"15%"}
                                  color={"white"}
                                  px={"10px"}
                                  py={"5px"}
                                  borderBottomColor={"#bababa"}
                                  fontWeight={700}
                                  fontSize={"13px"}
                                  borderX={"1px solid white"}
                                  textAlign={"center"}
                                >
                                  No
                                </Th>
                                <Th
                                  w={"15%"}
                                  color={"white"}
                                  px={"10px"}
                                  py={"5px"}
                                  borderBottomColor={"#bababa"}
                                  fontWeight={700}
                                  fontSize={"13px"}
                                  borderRight={"1px solid white"}
                                  textAlign={"center"}
                                >
                                  N/A
                                </Th>
                              </Tr>
                            </Thead>
                            <Tbody color={"black"}>
                              {options.map((val, optionIndex) => {
                                return (
                                  <Tr>
                                    <Td
                                      p={0}
                                      borderBottomColor={"#bababa"}
                                      fontWeight={700}
                                    >
                                      <Flex
                                        color={"#dc143c"}
                                        justify={"center"}
                                      >
                                        {optionIndex + 1}.
                                      </Flex>
                                    </Td>
                                    <Td
                                      borderX={"1px solid #bababa"}
                                      p={0}
                                      borderBottomColor={"#bababa"}
                                    >
                                      <Flex
                                        px={"10px"}
                                        h={"40px"}
                                        justify={"center"}
                                        flexDir={"column"}
                                      >
                                        {val}
                                      </Flex>
                                    </Td>
                                    <Td
                                      p={0}
                                      borderBottomColor={"#bababa"}
                                      color={"#292D3F"}
                                      fontWeight={700}
                                    >
                                      <Flex justify={"center"}>
                                        <Checkbox isDisabled />
                                      </Flex>
                                    </Td>
                                    <Td
                                      p={0}
                                      borderBottomColor={"#bababa"}
                                      borderX={"1px solid #bababa"}
                                      color={"#292D3F"}
                                      fontWeight={700}
                                    >
                                      <Flex justify={"center"}>
                                        <Checkbox isDisabled />
                                      </Flex>
                                    </Td>
                                    <Td
                                      p={0}
                                      borderBottomColor={"#bababa"}
                                      color={"#292D3F"}
                                      borderRight={"1px solid #bababa"}
                                      fontWeight={700}
                                    >
                                      <Flex justify={"center"}>
                                        <Checkbox isDisabled />
                                      </Flex>
                                    </Td>
                                  </Tr>
                                );
                              })}
                            </Tbody>
                          </Table>
                        </Flex>
                      </Flex>
                    );

                  default:
                    return "";
                }
              })()}
            </Flex>
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
const InspectionQuestionAccordion = memo(InspectionQuestionAccordionMemo);
export default InspectionQuestionAccordion;
