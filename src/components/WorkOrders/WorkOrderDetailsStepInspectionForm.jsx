import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
} from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa";
import ResponseTypeMapper from "../../components/ResponseTypeMapper";
import InspectionQuestionAccordion from "../InspectionQuestionAccordion";

export default function WorkOrderDetailsStepInspectionForm({
  inspectionForm,
  index,
}) {
  return (
    <Accordion allowToggle>
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
                <Flex>
                  {inspectionForm?.work_order_step_inspection_form?.name ||
                    inspectionForm?.work_order_step_inspection_form
                      ?.inspection_form?.name}
                </Flex>
              </Flex>
              <Flex fontSize={"16px"}>
                <FaChevronDown />
              </Flex>
            </Flex>
          </Flex>
        </AccordionButton>
        <AccordionPanel bg={"#fff7f7"} px={"0px"} py={"10px"}>
          {" "}
          <Flex flexDir={"column"} px={"20px"} py={"20px"}>
            {inspectionForm?.work_order_step_inspection_form?.status ===
              "completed" ||
            !inspectionForm?.work_order_step_inspection_form?.inspection_form
              ?.status === "completed" ? (
              <Flex
                bg={"white"}
                py={"10px"}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                flexDir={"column"}
                gap={"10px"}
              >
                {(inspectionForm?.work_order_step_inspection_form
                  ?.work_order_step_inspection_questions?.length > 0
                  ? inspectionForm?.work_order_step_inspection_form
                      ?.work_order_step_inspection_questions
                  : inspectionForm?.work_order_step_inspection_form
                      ?.inspection_form.inspection_questions
                )?.map((inspectionQuestion, inspectionQuestionIndex) => (
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
                        <Flex color={"black"} fontWeight={700}>
                          {inspectionQuestion.question}
                        </Flex>
                      </Flex>
                      <Flex pl={"24px"}>
                        <ResponseTypeMapper
                          type={inspectionQuestion.question_type}
                          response={inspectionQuestion?.response}
                          options={inspectionQuestion?.options}
                          format={inspectionQuestion?.format}
                          unit={inspectionQuestion?.unit}
                          include_date={inspectionQuestion?.include_date}
                          include_time={inspectionQuestion?.include_time}
                        />
                      </Flex>
                    </Flex>
                    {/* <Flex bg={"#e0e0e0"} h={"1px"} w={"100%"}></Flex> */}
                  </>
                ))}
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
                {(inspectionForm?.work_order_step_inspection_form
                  ?.work_order_step_inspection_questions?.length > 0
                  ? inspectionForm?.work_order_step_inspection_form
                      ?.work_order_step_inspection_questions
                  : inspectionForm?.work_order_step_inspection_form
                      ?.inspection_form.inspection_questions
                )?.map((inspectionQuestion, inspectionQuestionIndex) => (
                  <Flex
                    w={"100%"}
                    color={"#848484"}
                    bg={"white"}
                    shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                  >
                    <InspectionQuestionAccordion
                      question={inspectionQuestion.question}
                      type={inspectionQuestion.question_type}
                      required={inspectionQuestion.is_required}
                      format={inspectionQuestion.format}
                      includeDate={inspectionQuestion.include_date}
                      includeTime={inspectionQuestion.include_time}
                      unit={inspectionQuestion.unit}
                      options={inspectionQuestion.options}
                    />
                  </Flex>
                ))}
              </Flex>
            )}
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
