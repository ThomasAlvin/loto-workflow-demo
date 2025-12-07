import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Checkbox,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Select,
  Table,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import QuestionTypeIconMapper from "../../utils/QuestionTypeIconMapper";
import { FaTriangleExclamation } from "react-icons/fa6";
import { RxDragHandleDots2 } from "react-icons/rx";

export default function InspectionFormDetailsModalFormQuestions({
  val,
  index,
}) {
  return (
    <Flex
      w={"100%"}
      color={"#848484"}
      shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
    >
      <Accordion w={"100%"} allowToggle>
        <AccordionItem>
          <AccordionButton
            p={0}
            _expanded={{ boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.2)" }}
          >
            <Flex
              w={"100%"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Flex w={"50%"} alignItems={"center"}>
                <Flex
                  w={"36px"}
                  justify={"center"}
                  fontWeight={700}
                  color={"#dc143c"}
                  fontSize={"16px"}
                  px={"5px"}
                  pb={"4px"}
                >
                  {index + 1}.{/* <RxDragHandleDots2 /> */}
                </Flex>
                <InputGroup>
                  <Textarea
                    cursor={"pointer"}
                    isReadOnly={true}
                    value={val.question || val.title}
                    borderRadius={"0px"}
                    fontSize={"14px"}
                    h={"auto"}
                    placeholder="What time did you arrive work today?"
                    px={"10px"}
                    py={"5px"}
                    resize={"none"}
                    minH={"36px"}
                    borderBottom={"none"}
                    borderTop={"none"}
                    color={"black"}
                    height={"36px"}
                    overflow={"hidden"}
                  ></Textarea>
                </InputGroup>
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
                    {QuestionTypeIconMapper(val.question_type) ||
                      QuestionTypeIconMapper(val.type.title)}
                  </Flex>
                  <Flex>{val.question_type || val.type.title}</Flex>
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
                      defaultChecked={val.required || val.is_required}
                      isDisabled={true}
                    />
                    <Flex>Required</Flex>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </AccordionButton>
          <AccordionPanel py={"0px"}>
            <Flex flexDir={"column"}>
              <Flex fontSize={"14px"} gap={"20px"}>
                {(() => {
                  switch (val.question_type || val.type.title) {
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
                              {val.format || val.type.format}
                            </Flex>
                          </Flex>
                        </Flex>
                      );
                    case "Date & Time":
                      return (
                        <Flex gap={"20px"} py={"10px"}>
                          <Flex alignItems={"center"} gap={"10px"}>
                            <Flex gap={"10px"} alignItems={"center"}>
                              <Checkbox
                                isDisabled
                                onChange={() => {
                                  // dateTimeCheckBoxHandler("date");
                                }}
                                defaultChecked={
                                  val.include_date || val?.type?.date
                                }
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
                                defaultChecked={
                                  val.include_time || val?.type?.time
                                }
                              />
                              <Flex>Time</Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                      );
                    case "Number":
                      return (
                        <Flex gap={"20px"} py={"10px"}>
                          <Flex alignItems={"center"} gap={"10px"}>
                            <Flex>Format :</Flex>
                            <Flex>
                              <Flex
                                border={"1px solid #848484"}
                                borderRadius={"3px"}
                                px={"16px"}
                              >
                                {val.format || val.type.format}
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
                                {val.unit || val.type.unit}
                              </Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                      );
                    case "Multiple Choice":
                      return (
                        <Flex
                          flexDir={"column"}
                          py={"10px"}
                          w={"100%"}
                          gap={"10px"}
                        >
                          {(val?.options?.length > 0
                            ? val?.options
                            : val?.type?.options
                          )?.map((val, index) => {
                            return (
                              <Flex alignItems={"center"} gap={"10px"}>
                                <Flex
                                  border={"2px solid #848484"}
                                  borderRadius={"100%"}
                                  h={"20px"}
                                  w={"20px"}
                                />
                                <Flex
                                  fontSize={"16px"}
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
                      );
                    case "Checkbox":
                      return (
                        <Flex
                          flexDir={"column"}
                          py={"10px"}
                          w={"100%"}
                          gap={"10px"}
                        >
                          {(val?.options?.length > 0
                            ? val?.options
                            : val?.type?.options
                          )?.map((val, index) => {
                            return (
                              <Flex alignItems={"center"} gap={"10px"}>
                                <Flex
                                  border={"2px solid #848484"}
                                  borderRadius={"3px"}
                                  h={"20px"}
                                  w={"20px"}
                                />
                                <Flex
                                  fontSize={"16px"}
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
                      );
                    case "Checklist":
                      return (
                        <Flex gap={"20px"} w={"100%"} py={"10px"}>
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
                                    textAlign={"center"}
                                  >
                                    N/A
                                  </Th>
                                </Tr>
                              </Thead>
                              <Tbody color={"black"}>
                                {(val?.options?.length > 0
                                  ? val?.options
                                  : val?.type?.options
                                )?.map((val, optionIndex) => {
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
                                        <Flex flexDir={"column"}>
                                          <Flex
                                            fontSize={"16px"}
                                            h={"40px"}
                                            px={"16px"}
                                            alignItems={"center"}
                                          >
                                            {val}
                                          </Flex>
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
    </Flex>
  );
}
