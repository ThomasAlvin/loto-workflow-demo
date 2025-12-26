import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaPlus, FaTriangleExclamation } from "react-icons/fa6";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { api } from "../../api/api";
import SwalErrorMessages from "../SwalErrorMessages";

export default function CreateDepartmentModal({
  createDepartmentDisclosure,
  fetchDepartments,
  abortControllerRef,
}) {
  const [buttonLoading, setButtonLoading] = useState(false);
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
      name: "",
      description: "",
    },
    resolver: yupResolver(
      Yup.object({
        name: Yup.string().trim().required("Name is required"),
      })
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  async function onSubmit(data) {
    setButtonLoading(true);
    await api
      .testSubmit("Department saved successfully")
      .then((response) => {
        Swal.fire({
          title: "Success!",
          text: response.data.message,
          icon: "success",
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
        abortControllerRef.current.abort(); // Cancel any previous request
        abortControllerRef.current = new AbortController();
        fetchDepartments();
      })
      .catch((error) => {
        Swal.fire({
          title: "Oops...",
          // text: error.response.data.errors || "An error occurred",
          icon: "error",
          html: SwalErrorMessages(error.response.data.message),
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
      })
      .finally(() => {
        setButtonLoading(false);
        handleCloseModal();
      });
  }
  function handleCloseModal() {
    createDepartmentDisclosure.onClose();
    reset();
  }

  return (
    <>
      <Button
        onClick={createDepartmentDisclosure.onOpen}
        px={"12px"}
        color={"#dc143c"}
        borderRadius={"50px"}
        border={"1px solid #dc143c"}
        bg={"white"}
        _hover={{ bg: "#dc143c", color: "white" }}
      >
        <Flex alignItems={"center"} gap={"10px"}>
          <Flex fontSize={"20px"}>
            <FaPlus />
          </Flex>
          <Flex>Add Department</Flex>
        </Flex>
      </Button>
      <Modal
        closeOnOverlayClick={false}
        isOpen={createDepartmentDisclosure.isOpen}
        onClose={handleCloseModal}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"} maxW="60%" maxH={"90vh"} overflow={"auto"}>
          <ModalHeader
            py={"5px"}
            px={"16px"}
            display={"flex"}
            flexDir={"column"}
          >
            <Flex color={"crimson"}>Create Department </Flex>

            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>
                Create a department to organize your members into different
                groups or teams.
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
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
                    {...register("name")}
                    border={
                      // errors.name && touchedFields.name
                      errors.name ? "1px solid crimson" : "1px solid #E2E8F0"
                    }
                    placeholder="Enter a department name..."
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
                  isLoading={buttonLoading}
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
                  isLoading={buttonLoading}
                  _hover={{ background: "#b80d2f" }}
                  width={"95px"}
                  border={"1px solid #dc143c"}
                  color={"white"}
                  bgColor={"#dc143c"}
                  variant="ghost"
                  onClick={handleSubmit(onSubmit)}
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
