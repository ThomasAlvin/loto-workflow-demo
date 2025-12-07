import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
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
  FaRegUser,
  FaTriangleExclamation,
  FaWrench,
} from "react-icons/fa6";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FaBuilding, FaUserAlt } from "react-icons/fa";
import LabelizeRole from "../../utils/LabelizeRole";
import { useNavigate } from "react-router-dom";

export default function DepartmentDetailsModal({
  selectedDepartmentDetails,
  onClose,
  isOpen,
}) {
  const nav = useNavigate();
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;

  return (
    <>
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
                Department Details
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"20px"} pb={"20px"}>
              <Flex gap={"30px"} alignItems={"center"}>
                <Flex
                  alignItems={"center"}
                  justify={"center"}
                  aspectRatio={1}
                  bg={"black"}
                  borderRadius={"100%"}
                  color={"white"}
                  fontSize={"40px"}
                >
                  {" "}
                  <Flex p={"20px"}>
                    <FaBuilding />
                  </Flex>
                </Flex>
                <Flex w={"100%"} flexDir={"column"}>
                  <Flex flexDir={"column"}>
                    <Flex w={"100%"} flexDir={"column"}>
                      <Flex fontWeight={700} w={"100%"} fontSize={"20px"}>
                        {selectedDepartmentDetails?.name}
                      </Flex>
                    </Flex>
                    <Flex flexDir={"column"}>
                      <Flex w={"100%"} color={"#848484"}>
                        {selectedDepartmentDetails?.description ||
                          "No Description Set"}
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex
                  boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                  bg={"#f8f9fa"}
                  fontSize={"16px"}
                  flexDir={"column"}
                  w={"100%"}
                >
                  <Flex
                    py={"10px"}
                    color={"#dc143c"}
                    fontSize={"20px"}
                    pl={"10px"}
                    pr={"20px"}
                    fontWeight={700}
                    justifyContent={"space-between"}
                  >
                    <Flex>Members</Flex>
                    <Flex
                      gap={"5px"}
                      alignItems={"center"}
                      // bg={"#f8f9fa"}
                      // border={"1px solid #bababa"}
                    >
                      <Flex fontSize={"16px"}>
                        <FaRegUser />
                      </Flex>
                      <Flex fontSize={"20px"}>
                        {selectedDepartmentDetails?.members?.length}
                      </Flex>
                    </Flex>
                  </Flex>
                  <Divider borderColor={"#bababa"} m={0}></Divider>
                  <Flex flexDir={"column"}>
                    {selectedDepartmentDetails?.members?.length ? (
                      selectedDepartmentDetails?.members?.map(
                        (val, memberIndex) => (
                          <>
                            <Flex
                              _hover={{ bg: "#ededed" }}
                              p={"10px"}
                              alignItems={"center"}
                              justify={"space-between"}
                            >
                              <Flex alignItems={"center"} gap={"10px"}>
                                {val.user.first_name ? (
                                  <Avatar
                                    outline={"1px solid #dc143c"}
                                    border={"2px solid white"}
                                    name={
                                      val.user.first_name +
                                      " " +
                                      val.user.last_name
                                    }
                                    src={
                                      val.user.profile_image_url
                                        ? IMGURL + val.user.profile_image_url
                                        : null
                                    }
                                  ></Avatar>
                                ) : (
                                  <Flex
                                    outline={"1px solid #dc143c"}
                                    bg={"#bababa"}
                                    borderRadius={"100%"}
                                    justifyContent={"center"}
                                    alignItems={"center"}
                                    h={"48px"}
                                    w={"48px"}
                                    border={"2px solid white"}
                                  >
                                    <Flex color={"white"} fontSize={"24px"}>
                                      <FaUserAlt />
                                    </Flex>
                                  </Flex>
                                )}

                                <Flex flexDir={"column"}>
                                  <Flex
                                    // _hover={{ color: "#dc143c" }}
                                    // transition={"0.1s ease-in-out"}
                                    // onClick={() => {
                                    //   nav("/member/" + val.UID);
                                    // }}
                                    // cursor={"pointer"}
                                    fontWeight={700}
                                  >
                                    {val.user.first_name +
                                      " " +
                                      val.user.last_name}
                                  </Flex>
                                  <Flex fontSize={"14px"} color={"#848484"}>
                                    {LabelizeRole(val.role) +
                                      " - " +
                                      val.employee_id}
                                  </Flex>
                                </Flex>
                              </Flex>
                              <Flex fontSize={"14px"} color={"#848484"}>
                                {val.user.email}
                              </Flex>
                            </Flex>
                            <Divider borderColor={"#bababa"} m={0}></Divider>
                          </>
                        ),
                      )
                    ) : (
                      <Flex
                        py={"30px"}
                        px={"20px"}
                        w={"100%"}
                        justify={"center"}
                        flexDir={"column"}
                        gap={"5px"}
                      >
                        <Flex
                          fontSize={"16px"}
                          fontWeight={700}
                          justify={"center"}
                          alignItems={"center"}
                          color={"black"}
                        >
                          <Flex>
                            No members are assigned to this department!
                          </Flex>
                        </Flex>
                        <Flex
                          justify={"center"}
                          color={"#848484"}
                          fontWeight={700}
                          textAlign={"center"}
                        >
                          Assign members to populate this list.{" "}
                        </Flex>
                      </Flex>
                    )}
                  </Flex>

                  {/* {inspectionForm.inspection_questions.map(
                    (val, inspectionQuestionIndex) => {
                      return (
                        <InspectionFormDetailsModalFormQuestions
                          val={val}
                          index={inspectionQuestionIndex}
                        />
                      );
                    }
                  )} */}
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
