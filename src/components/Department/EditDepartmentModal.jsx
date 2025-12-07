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
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import CreatableSelect from "react-select/creatable";
import { FaPlus, FaTriangleExclamation } from "react-icons/fa6";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { api } from "../../api/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { VscEmptyWindow } from "react-icons/vsc";
import SwalErrorMessages from "../SwalErrorMessages";

export default function EditDepartmentModal({
  editButtonLoading,
  editDepartment,
  selectedEditDepartment,
  onClose,
  isOpen,
}) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    clearErrors,
    setError,
    reset,
    formState: { errors, touchedFields },
    trigger,
  } = useForm({
    defaultValues: {
      name: selectedEditDepartment.name,
      description: selectedEditDepartment.description,
    },
    resolver: yupResolver(
      Yup.object({
        name: Yup.string().trim().required("Name is required"),
      }),
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  function handleCloseModal() {
    onClose();
    reset(
      {
        name: selectedEditDepartment.name,
        description: selectedEditDepartment.description,
      },
      { keepDefaultValues: true },
    );
  }

  useEffect(() => {
    reset(
      {
        name: selectedEditDepartment.name,
        description: selectedEditDepartment.description,
      },
      { keepDefaultValues: true },
    );
  }, [selectedEditDepartment]);

  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        closeOnEsc={!editButtonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"} maxW="60%" maxH={"90vh"} overflow={"auto"}>
          <ModalHeader
            py={"5px"}
            px={"16px"}
            display={"flex"}
            flexDir={"column"}
          >
            <Flex color={"crimson"}>Edit Department </Flex>

            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>
                Customize questions and details according to your needs
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton isDisabled={editButtonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Department Name&nbsp;
                    <Box as="span" color={"#dc143c"}>
                      *
                    </Box>
                  </Box>
                  <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>Give your department a clear name</Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Input
                    placeholder="Enter a department name..."
                    {...register("name")}
                    border={
                      // errors.name && touchedFields.name
                      errors.name ? "1px solid crimson" : "1px solid #E2E8F0"
                    }
                  ></Input>
                </Flex>
                {errors.name ? (
                  <Flex
                    position={"absolute"}
                    left={0}
                    bottom={0}
                    color="crimson"
                    fontSize="14px"
                    gap="5px"
                    alignItems="center"
                  >
                    <FaTriangleExclamation />
                    <Flex>{errors.name.message}</Flex>
                  </Flex>
                ) : (
                  ""
                )}
              </Flex>
              <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Description (
                    <Box as="span" color={"#848484"}>
                      Optional
                    </Box>
                    )
                  </Box>
                  <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>Give your department a description</Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Textarea
                    placeholder="Enter a short description..."
                    {...register("description")}
                  />
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter w={"100%"} justifyContent={"center"}>
            <Flex w={"100%"} alignItems={"center"} justifyContent={"end"}>
              <Flex>
                <Button
                  isLoading={editButtonLoading}
                  _hover={{ background: "#dc143c", color: "white" }}
                  width={"95px"}
                  color={"#dc143c"}
                  background={"transparent"}
                  border={"1px solid #dc143c"}
                  mr={3}
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
                <Button
                  isLoading={editButtonLoading}
                  _hover={{ background: "#c40a2f" }}
                  width={"95px"}
                  border={"1px solid #dc143c"}
                  color={"white"}
                  bgColor={"#dc143c"}
                  variant="ghost"
                  onClick={handleSubmit((data) =>
                    editDepartment(data, selectedEditDepartment.UID),
                  )}
                >
                  Save
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
