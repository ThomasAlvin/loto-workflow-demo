import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  TagLabel,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import ReactSelect from "react-select";
import CreatableSelect from "react-select/creatable";
import {
  FaMagnifyingGlass,
  FaPlus,
  FaTriangleExclamation,
  FaWrench,
} from "react-icons/fa6";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import InspectionFormDetailsModalFormQuestions from "./InspectionFormDetailsModalFormQuestions";
import moment from "moment";

export default function InspectionFormDetailsModal({ inspectionForm }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <MenuItem onClick={onOpen} color={"black"} icon={<FaMagnifyingGlass />}>
        Details
      </MenuItem>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={"white"} maxW="50%" maxH={"90vh"} overflow={"auto"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            <Flex flexDir={"column"}>
              <Flex
                textAlign={"center"}
                justifyContent={"space-between"}
              ></Flex>
              <Flex color={"#dc143c"} fontSize={"24px"}>
                Inspection Form Details
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"16px"} pb={"20px"}>
              <Flex gap={"30px"} alignItems={"center"}>
                <Flex
                  alignItems={"center"}
                  justify={"center"}
                  aspectRatio={1}
                  bg={"black"}
                  borderRadius={"100%"}
                  color={"white"}
                  fontSize={"56px"}
                >
                  {" "}
                  <Flex p={"20px"}>
                    <FaWrench />
                  </Flex>
                </Flex>
                <Flex w={"100%"} flexDir={"column"}>
                  <Flex flexDir={"column"}>
                    <Flex w={"100%"} flexDir={"column"}>
                      <Flex fontWeight={700} w={"100%"} fontSize={"20px"}>
                        {inspectionForm.name}
                      </Flex>
                    </Flex>
                    <Flex flexDir={"column"}>
                      <Flex w={"100%"}>{inspectionForm.description}</Flex>
                    </Flex>
                  </Flex>
                  <Flex flexWrap={"wrap"} gap={"5px"}>
                    {inspectionForm.category.length ? (
                      inspectionForm.category.map((category, index) => {
                        return (
                          <Flex pt={"5px"}>
                            <Tag
                              size={"md"}
                              borderRadius="full"
                              variant="solid"
                              bg={"#f8f9fa"}
                              color={"#848484"}
                              border={"#848484 1px solid"}
                            >
                              <TagLabel>{category.name}</TagLabel>
                            </Tag>
                          </Flex>
                        );
                      })
                    ) : (
                      <Flex color={"#848484"}>No Categories Selected</Flex>
                    )}
                  </Flex>
                </Flex>
              </Flex>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex fontSize={"16px"} flexDir={"column"} w={"100%"}>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Created At :
                    </Box>
                  </Flex>
                  <Flex color={"#848484"}>
                    {moment(inspectionForm.created_at).format(
                      "DD MMMM YYYY | hh:mm A"
                    )}
                  </Flex>
                </Flex>
              </Flex>

              <Flex flexDir={"column"} gap={"10px"}>
                <Flex
                  pb={"10px"}
                  fontSize={"16px"}
                  flexDir={"column"}
                  w={"100%"}
                >
                  <Flex pb={"5px"} flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Form Questions :
                    </Box>
                  </Flex>
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
                      Manage
                    </Flex>
                  </Flex>
                  {inspectionForm.inspection_questions.map(
                    (val, inspectionQuestionIndex) => {
                      return (
                        <InspectionFormDetailsModalFormQuestions
                          val={val}
                          index={inspectionQuestionIndex}
                        />
                      );
                    }
                  )}
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
