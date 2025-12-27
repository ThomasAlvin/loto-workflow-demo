import {
  Box,
  Button,
  Checkbox,
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
  useDisclosure,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaPlus, FaTriangleExclamation } from "react-icons/fa6";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { api } from "../../api/api";
import SwalErrorMessages from "../SwalErrorMessages";

export default function CreateWorkSiteModal({
  abortControllerRef,
  fetchWorkSites,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [buttonLoading, setButtonLoading] = useState();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    clearErrors,
    reset,
    formState: { errors, touchedFields },
    trigger,
  } = useForm({
    defaultValues: {
      name: "",
      location: "",
      isDefault: false,
    },
    resolver: yupResolver(
      Yup.object({
        name: Yup.string().trim().required("Work site name is required"),
        location: Yup.string()
          .trim()
          .required("Work site location is required"),
      })
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  function handleCloseModal() {
    onClose();
    reset({
      name: "",
      location: "",
      isDefault: false,
    });
  }

  async function onSubmit(data) {
    setButtonLoading(true);
    await api
      .testSubmit("Work site added successfully")
      .then((response) => {
        abortControllerRef.current.abort(); // Cancel any previous request
        abortControllerRef.current = new AbortController();
        fetchWorkSites();
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
      })
      .catch((error) => {
        Swal.fire({
          title: "Oops...",
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
        // fetchInspectionForms();
      });
  }

  function toggleSetAsDefault(checked) {
    setValue("isDefault", checked);
  }

  return (
    <>
      <Button
        onClick={onOpen}
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
          <Flex>Add Work Site</Flex>
        </Flex>
      </Button>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"} maxW="50%" maxH={"90vh"} overflow={"auto"}>
          <ModalHeader
            py={"5px"}
            px={"16px"}
            display={"flex"}
            flexDir={"column"}
          >
            <Flex color={"crimson"}>Create Work Site</Flex>
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Work Site Name&nbsp;
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
                    <Flex>Give your Work Site a clear and concise name</Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Input
                    {...register("name")}
                    border={
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
                    Work Site Location&nbsp;
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
                    <Flex>Details about you're work site's location</Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Textarea
                    border={
                      errors.location
                        ? "1px solid crimson"
                        : "1px solid #E2E8F0"
                    }
                    {...register("location")}
                  />
                </Flex>
                {errors.location ? (
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
                    <Flex>{errors.location.message}</Flex>
                  </Flex>
                ) : (
                  ""
                )}
              </Flex>

              <Flex
                py={"4px"}
                gap={"20px"}
                alignItems={"center"}
                pb={"20px"}
                justifyContent={"space-between"}
              >
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Set as default
                  </Box>
                  <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>
                      Set work site as you're default worksite upon creation
                    </Flex>
                  </Flex>
                </Flex>
                <Checkbox
                  bg={"#ededed"}
                  onChange={(e) => toggleSetAsDefault(e.target.checked)}
                  size="lg"
                />
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter w={"100%"} justifyContent={"center"}>
            <Flex w={"100%"} alignItems={"center"} justifyContent={"end"}>
              <Flex>
                <Button
                  isLoading={buttonLoading}
                  _hover={{ background: "#c40a2f", color: "white" }}
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
                  _hover={{ background: "#c40a2f" }}
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
