import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Checkbox,
  Flex,
  Textarea,
} from "@chakra-ui/react";
import { AiOutlineStar } from "react-icons/ai";
import { FaChevronDown, FaLongArrowAltRight } from "react-icons/fa";
import { RiArrowRightSLine } from "react-icons/ri";
import ResponseTypeMapper from "../../utils/ResponseTypeMapper";
import QuestionTypeIconMapper from "../../utils/QuestionTypeIconMapper";

export default function ReportDetailsStepInspectionForm({
  inspectionForm,
  submissionIndex,
  index,
}) {
  return (
    <Accordion defaultIndex={0}>
      <AccordionItem>
        <AccordionButton p={0}>
          <Flex
            cursor={"pointer"}
            transition="background-color 0.1s ease"
            _hover={{ bg: "#ffeded" }}
            bg={"#FFF0F3"}
            color={"#dc143c"}
            borderBottom={"1px solid #ffd4d4"}
            py={"12px"}
            w={"100%"}
            flexDir={"column"}
            pl={"0px"}
          >
            <Flex
              w={"100%"}
              alignItems={"center"}
              justify={"space-between"}
              pl={"10px"}
              pr={"16px"}
            >
              <Flex fontWeight={700} alignItems={"center"} gap={"10px"}>
                <Flex h={"9px"} w={"9px"} bg={"#c92445"} borderRadius={"100%"}>
                  {/* <FaLongArrowAltRight /> */}
                </Flex>
                <Flex>{inspectionForm?.report_step_inspection_form?.name}</Flex>
              </Flex>
              <Flex fontSize={"16px"}>
                <FaChevronDown />
              </Flex>
            </Flex>
          </Flex>
        </AccordionButton>
        <AccordionPanel bg={"#fff7f7"} px={"0px"} py={"10px"}>
          <Flex flexDir={"column"} px={"20px"} py={"20px"}>
            {!inspectionForm?.report_step_inspection_form?.is_completed ? (
              <Flex
                bg={"white"}
                py={"10px"}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                // border={"1px solid #848484"}
                flexDir={"column"}
                gap={"10px"}
              >
                {inspectionForm?.report_step_inspection_form?.report_step_inspection_questions?.map(
                  (inspectionQuestion, inspectionQuestionIndex) => (
                    <>
                      <Flex
                        px={"10px"}
                        w={"100%"}
                        color={"#848484"}
                        flexDir={"column"}
                      >
                        <Flex color={"#dc143c"} gap={"10px"}>
                          <Flex fontWeight={700}>
                            {inspectionQuestionIndex + 1}.
                          </Flex>
                          <Flex fontWeight={700} color={"black"}>
                            {inspectionQuestion.question}
                          </Flex>
                        </Flex>
                        <Flex pl={"24px"}>
                          <ResponseTypeMapper
                            type={inspectionQuestion.question_type}
                            submissions={inspectionQuestion?.submissions}
                            submissionIndex={submissionIndex}
                            options={inspectionQuestion.options}
                            format={inspectionQuestion.format}
                            unit={inspectionQuestion.unit}
                            include_date={inspectionQuestion.include_date}
                            include_time={inspectionQuestion.include_time}
                          />
                        </Flex>
                      </Flex>
                      {/* <Flex bg={"#e0e0e0"} h={"1px"} w={"100%"}></Flex> */}
                    </>
                  ),
                )}
              </Flex>
            ) : (
              <Flex fontSize={"14px"} flexDir={"column"} w={"100%"}>
                <Flex
                  bg={"#F8F9FA"}
                  w={"100%"}
                  color={"#848484"}
                  fontSize={"14px"}
                  shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                >
                  <Flex
                    borderRight={"#E2E8F0 1px solid"}
                    px={"10px"}
                    py={"5px"}
                    w={"50%"}
                  >
                    Question
                  </Flex>

                  <Flex
                    borderRight={"#E2E8F0 1px solid"}
                    px={"10px"}
                    py={"5px"}
                    w={"25%"}
                  >
                    Type of response
                  </Flex>
                  <Flex px={"10px"} py={"5px"} w={"25%"}>
                    Setup
                  </Flex>
                </Flex>
                {inspectionForm?.report_step_inspection_form?.report_step_inspection_questions?.map(
                  (inspectionQuestion, inspectionQuestionIndex) => (
                    <Flex
                      w={"100%"}
                      color={"#848484"}
                      bg={"white"}
                      shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                    >
                      <Accordion w={"100%"} allowToggle>
                        <AccordionItem>
                          <AccordionButton
                            position={"static"}
                            p={0}
                            _expanded={{
                              boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <Flex
                              w={"100%"}
                              alignItems={"center"}
                              justifyContent={"space-between"}
                            >
                              <Flex w={"50%"} alignItems={"center"}>
                                <Textarea
                                  position={"static"}
                                  cursor={"pointer"}
                                  isReadOnly={true}
                                  // ref={textareaRef}
                                  value={inspectionQuestion.question}
                                  // onChange={handleInput}
                                  borderRadius={"0px"}
                                  fontSize={"14px"}
                                  h={"auto"}
                                  placeholder="What time did you arrive work today?"
                                  px={"10px"}
                                  py={"5px"}
                                  resize={"none"}
                                  minH={"36px"}
                                  borderLeft={"none"}
                                  borderBottom={"none"}
                                  borderTop={"none"}
                                  color={"black"}
                                  height={"36px"}
                                  overflow={"hidden"}
                                ></Textarea>
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
                                    {QuestionTypeIconMapper(
                                      inspectionQuestion.question_type,
                                    )}
                                  </Flex>
                                  <Flex>
                                    {inspectionQuestion.question_type}
                                  </Flex>
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
                                      position={"static"}
                                      // onChange={requiredCheckBoxHandler}
                                      sx={{
                                        cursor: "pointer !important", // Applying !important
                                      }}
                                      // defaultChecked={val.required || val.is_required}
                                      isDisabled={true}
                                    />
                                    <Flex>Required</Flex>
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Flex>
                          </AccordionButton>
                          <AccordionPanel py={"10px"}></AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ),
                )}
              </Flex>
            )}
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
