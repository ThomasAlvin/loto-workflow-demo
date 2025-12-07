import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Button,
  Checkbox,
  Collapse,
  Flex,
  FormLabel,
  Input,
  Slide,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { IoMdClose } from "react-icons/io";
import { useReactFlow } from "@xyflow/react";
import { v4 as uuid } from "uuid";
import { useDeleteContext } from "../../service/DeleteMultiLockAccessContext";
import { useSelector } from "react-redux";
import TableStatusStyleMapper from "../../utils/tableStatusStyleMapper";
import ImageFocusOverlay from "../ImageFocusOverlay";
import InspectionQuestionAccordion from "../InspectionQuestionAccordion";

export default function TemplateStepDetailsDrawerDetails({
  editStepDisclosure,
  selectedEditStep,
}) {
  const { isOpen } = useDeleteContext();
  const drawerRef = useRef();
  const { bgColor, textColor, icon, text } = TableStatusStyleMapper(
    selectedEditStep?.status
  );
  const editStepQuestionsDisclosure = useDisclosure();
  const { screenToFlowPosition, setNodes, setEdges, getNodes, getEdges } =
    useReactFlow();
  const isMultiAssign = import.meta.env.VITE_MULTI_ASSIGN === "true";
  function unselectAll() {
    setNodes(getNodes().map((node) => ({ ...node, selected: false })));
    setEdges(getEdges().map((edge) => ({ ...edge, selected: false })));
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !editStepQuestionsDisclosure.isOpen &&
        !isOpen
      ) {
        unselectAll();
        editStepDisclosure.onClose();
      }
    }

    if (editStepDisclosure.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    editStepDisclosure.isOpen,
    editStepDisclosure.onClose,
    editStepQuestionsDisclosure.isOpen,
    isOpen,
  ]);

  return (
    <>
      <Slide
        direction="right"
        in={editStepDisclosure.isOpen}
        style={{ zIndex: 1000, width: "700px" }}
      >
        <Box
          ref={drawerRef}
          position="fixed"
          top="0"
          right="0"
          w={"700px"}
          height="100vh"
          bg="white"
          shadow="md"
          pl={4}
          pt={4}
          zIndex={1000}
        >
          <Flex
            h={"100%"}
            w={"100%"}
            position={"relative"}
            flexDir={"column"}
            // gap={"20px"}
          >
            {/* Header */}
            <Flex
              fontWeight={700}
              borderBottom={"2px solid #bababa"}
              justify={"space-between"}
              // pr={"10px"}
              pr={"10px"}
              pb={"10px"}
            >
              <Flex
                alignItems={"center"}
                gap={"10px"}
                color={"#dc143c"}
                fontSize={"24px"}
                fontWeight={700}
              >
                <Flex
                  onClick={() => {
                    console.log(selectedEditStep);
                  }}
                  gap={"5px"}
                  alignItems={"center"}
                >
                  <Flex>
                    {selectedEditStep.order ? selectedEditStep.order + "." : ""}
                  </Flex>
                  <Flex>{selectedEditStep.label}</Flex>
                </Flex>
              </Flex>
              <Flex fontSize={"20px"} mb={"5px"}>
                <Flex
                  onClick={editStepDisclosure.onClose}
                  cursor={"pointer"}
                  p={"5px"}
                  _hover={{ bg: "#ededed" }}
                >
                  <IoMdClose />
                </Flex>
              </Flex>
            </Flex>
            {/* Body */}
            <Flex w={"100%"} py={"16px"} flexDir={"column"} gap={"20px"}>
              {selectedEditStep.description ? (
                <Flex flexDir={"column"}>
                  <Flex fontWeight={700}>
                    <Flex alignItems={"center"} gap={"5px"}>
                      Description :
                    </Flex>
                  </Flex>
                  <Flex color={"#848484"}>{selectedEditStep.description}</Flex>
                </Flex>
              ) : (
                ""
              )}
              {selectedEditStep.form ? (
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
                        {selectedEditStep?.template_form_questions?.map(
                          (val, index) => {
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
                                  includeDate={
                                    val.include_date || val?.type?.date
                                  }
                                  includeTime={
                                    val.include_time || val?.type?.time
                                  }
                                  unit={val?.unit || val?.type?.unit}
                                  options={val?.options || val?.type?.options}
                                />
                              </Flex>
                            );
                          }
                        )}
                      </Flex>
                      {/* <Flex>
                        <Button
                          onClick={addNewQuestion}
                          border={"dashed 2px #dc143c"}
                          p={0}
                        >
                          <Flex
                            py={"8px"}
                            px={"12px"}
                            bg={"white"}
                            alignItems={"center"}
                            justifyContent={"space-between"}
                          >
                            <Flex gap={"10px"} alignItems={"center"}>
                              <Flex color={"crimson"} fontWeight={700}>
                                <FaPlus />
                              </Flex>
                              <Flex color={"crimson"} fontWeight={"700"}>
                                Add Question
                              </Flex>
                            </Flex>
                          </Flex>
                        </Button>
                      </Flex> */}
                    </Flex>
                  </Flex>
                </Flex>
              ) : (
                ""
              )}
              {selectedEditStep.notify ? (
                <>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Notification message :
                    </Box>
                    <Flex
                      color={
                        selectedEditStep.notification_message
                          ? "black"
                          : "#848484"
                      }
                    >
                      {selectedEditStep.notification_message || "Not Set"}
                    </Flex>
                  </Flex>
                </>
              ) : (
                ""
              )}
              {selectedEditStep.machine ? (
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
              {selectedEditStep.access_lock ? (
                <Flex>
                  <Flex gap={"10px"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Lock Access :
                    </Box>
                    <Checkbox isDisabled defaultChecked />
                    <Flex>Included</Flex>
                  </Flex>
                </Flex>
              ) : (
                ""
              )}
              {selectedEditStep.multi_access_lock ? (
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

              {selectedEditStep.trigger_api ? (
                <Flex>
                  <Flex gap={"10px"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Trigger API :
                    </Box>
                    <Checkbox isDisabled defaultChecked />
                    <Flex>Included</Flex>
                  </Flex>
                </Flex>
              ) : (
                ""
              )}
              {selectedEditStep.send_webhook ? (
                <Flex>
                  <Flex gap={"10px"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Webhook :
                    </Box>
                    <Checkbox isDisabled defaultChecked />
                    <Flex>Included</Flex>
                  </Flex>
                </Flex>
              ) : (
                ""
              )}
              {selectedEditStep.condition ? (
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Condition Question :
                  </Box>
                  <Flex color={"black"}>
                    {selectedEditStep.condition_question}
                  </Flex>
                </Flex>
              ) : (
                ""
              )}
            </Flex>
          </Flex>
        </Box>
      </Slide>
    </>
  );
}
