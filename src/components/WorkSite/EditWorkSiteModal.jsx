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
} from "@chakra-ui/react";
import { useState } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { api } from "../../api/api";
import SwalErrorMessages from "../SwalErrorMessages";

export default function EditWorkSiteModal({
  fetchWorkSites,
  workSites,
  editWorkSiteForm,
  isOpen,
  onClose,
  abortControllerRef,
  isInitiallyDefault,
}) {
  const dispatch = useDispatch();
  const userSelector = useSelector((state) => state.login.auth);
  const [buttonLoading, setButtonLoading] = useState(false);

  async function onSubmit(data) {
    setButtonLoading(true);
    await api
      .post(`work-sites/${editWorkSiteForm.getValues("UID")}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(async (response) => {
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
        if (data.isDefault) {
          dispatch({
            type: "login",
            payload: {
              ...userSelector,
              main_work_site: workSites.find(
                (workSite) => workSite.UID === editWorkSiteForm.getValues("UID")
              ),
            },
          });
        }
        abortControllerRef.current.abort(); // Cancel any previous request
        abortControllerRef.current = new AbortController();
        fetchWorkSites(
          workSites.find(
            (workSite) => workSite.UID === editWorkSiteForm.getValues("UID")
          ),
          data.isDefault
        );
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
  function handleCloseModal() {
    onClose();
    editWorkSiteForm.reset({
      name: "",
      location: "",
      isDefault: false,
    });
  }
  function toggleSetAsDefault(checked) {
    editWorkSiteForm.setValue("isDefault", checked);
  }

  return (
    <>
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
            <Flex color={"crimson"}>Edit Work Site</Flex>
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
                    {...editWorkSiteForm.register("name")}
                    border={
                      editWorkSiteForm.formState.errors.name
                        ? "1px solid crimson"
                        : "1px solid #E2E8F0"
                    }
                  ></Input>
                </Flex>
                {editWorkSiteForm.formState.errors.name ? (
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
                    <Flex>
                      {editWorkSiteForm.formState.errors.name.message}
                    </Flex>
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
                      editWorkSiteForm.formState.errors.location
                        ? "1px solid crimson"
                        : "1px solid #E2E8F0"
                    }
                    {...editWorkSiteForm.register("location")}
                  />
                </Flex>
                {editWorkSiteForm.formState.errors.location ? (
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
                    <Flex>
                      {editWorkSiteForm.formState.errors.location.message}
                    </Flex>
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
                    <Flex>Set work site as your default worksite</Flex>
                  </Flex>
                </Flex>
                <Checkbox
                  isDisabled={isInitiallyDefault}
                  defaultChecked={editWorkSiteForm.watch("isDefault")}
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
                  onClick={editWorkSiteForm.handleSubmit(onSubmit)}
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
