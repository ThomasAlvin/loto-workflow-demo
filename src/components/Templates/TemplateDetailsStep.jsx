import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Checkbox,
  Flex,
} from "@chakra-ui/react";
import WorkFlowStepBadges from "../CreateTemplate/WorkFlowStepBadges";
import InspectionQuestionAccordion from "../InspectionQuestionAccordion";

export default function TemplateDetailsStep({ index, val, openByDefault }) {
  return (
    <Accordion defaultIndex={openByDefault ? [0] : ""} w={"100%"} allowToggle>
      <AccordionItem shadow={"0px 0px 3px rgba(50,50,93,0.5)"}>
        <AccordionButton
          p={0}
          _expanded={{ boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.2)" }}
        >
          <Flex
            role="group"
            w={"100%"}
            py={"8px"}
            px={"12px"}
            bg={"white"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Flex gap={"10px"}>
              <Flex color={"crimson"} fontWeight={700}>
                {index + 1}.
              </Flex>
              <Flex>{val.name}</Flex>
            </Flex>
            <Flex gap={"10px"} alignItems={"center"}>
              <WorkFlowStepBadges val={val} />
              <Flex
                _groupHover={{ color: "black" }}
                color={"#bababa"}
                cursor={"pointer"}
              >
                <AccordionIcon />
              </Flex>
            </Flex>
          </Flex>
        </AccordionButton>
        <AccordionPanel py={"10px"}>
          <Flex w={"100%"} flexDir={"column"} gap={"10px"}>
            {val.description ? (
              <Flex flexDir={"column"}>
                <Flex fontWeight={700}>
                  <Flex alignItems={"center"} gap={"5px"}>
                    Description :
                  </Flex>
                </Flex>
                <Flex color={"#848484"}>{val.description}</Flex>
              </Flex>
            ) : (
              ""
            )}
            {val.form ? (
              <Flex flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Form :
                  </Box>
                </Flex>
                <Flex w={"100%"}>
                  <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                    {/* supposed to use TemplateDetailsFormQuestion instead of WorkFlowFormQuestion */}
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
                      {val?.template_form_questions?.map((val, index) => {
                        return (
                          <Flex
                            bg={"white"}
                            w={"100%"}
                            color={"#848484"}
                            shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                          >
                            <InspectionQuestionAccordion
                              question={val.question || val.title}
                              type={val.question_type || val.type.title}
                              required={val.required || val.is_required}
                              format={val?.format || val?.type?.format}
                              includeDate={val.include_date || val?.type?.date}
                              includeTime={val.include_time || val?.type?.time}
                              unit={val?.unit || val?.type?.unit}
                              options={val?.options || val?.type?.options}
                            />
                          </Flex>
                        );
                      })}
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            ) : (
              ""
            )}
            {val.notify ? (
              <>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Notification message :
                  </Box>
                  <Flex color={val.notification_message ? "black" : "#848484"}>
                    {val.notification_message || "Not Set"}
                  </Flex>
                </Flex>
              </>
            ) : (
              ""
            )}
            {val.machine ? (
              <Flex>
                <Flex gap={"10px"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Machine :
                  </Box>
                  <Checkbox isDisabled defaultChecked />
                  <Flex>Included</Flex>
                </Flex>
              </Flex>
            ) : (
              ""
            )}
            {val.multi_access_lock ? (
              <>
                <Flex>
                  <Flex gap={"10px"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Lock Access :
                    </Box>
                    <Checkbox isDisabled defaultChecked />
                    <Flex>Included</Flex>
                  </Flex>
                </Flex>
              </>
            ) : (
              ""
            )}
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
