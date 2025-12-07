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
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import Swal from "sweetalert2";
import SwalErrorMessages from "../SwalErrorMessages";
import { api } from "../../api/api";
import { useNavigate, useParams } from "react-router-dom";
import formatString from "../../utils/formatString";
import convertToFormData from "../../utils/ConvertToFormData";

export default function SaveChangesConfirmationModal({
  module,
  variant,
  saveChangesDisclosure,
  moduleDetails,
}) {
  const nav = useNavigate();
  const { UID } = useParams();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);
  async function submitConfirmation() {
    if (moduleDetails.name || titleInput) {
      saveAsDraft();
    } else {
      setButtonLoading(true);
      setTimeout(() => {
        setButtonLoading(false);
        setShowTitleInput(true);
      }, 1000);
    }
  }

  async function saveAsDraft() {
    setButtonLoading(true);
    const filteredWorkFlow = moduleDetails.workOrderSteps.map((item) => {
      const filteredItem = { ...item };

      if (!item.form) {
        delete filteredItem.template_form_questions;
        delete filteredItem.formQuestions;
      }

      if (!item.notify) {
        delete filteredItem.notificationMessage;
        // delete filteredItem.notification_message;
      }
      if (!item.machine) {
        delete filteredItem.selectedMachines;
      }
      if (!item.triggerAPI) {
        delete filteredItem.titleTriggerAPI;
      }

      return filteredItem;
    });

    let formDataObject = {
      ...moduleDetails,
      name: titleInput || moduleDetails.name,
      ...(module === "template"
        ? {
            workFlow: filteredWorkFlow,
            ...(variant === "edit"
              ? {
                  access: moduleDetails.access.filter(
                    (templateAccess) => templateAccess.role !== "owner",
                  ),
                }
              : {}),
          }
        : { workOrderSteps: filteredWorkFlow }),
    };
    // if (titleInput) {
    //   formDataObject["name"] = titleInput;
    // }

    const formData = convertToFormData(formDataObject);

    try {
      const response = await api.post(
        module === "template"
          ? variant === "edit"
            ? `template/${UID}?status=draft`
            : `template?status=draft`
          : module === "work_order"
            ? variant === "edit"
              ? `work-order/${UID}?status=draft`
              : `work-order?status=draft`
            : "",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      Swal.fire({
        title: "Success!",
        text: response?.data?.message,
        icon: "success",
        customClass: {
          popup: "swal2-custom-popup",
          title: "swal2-custom-title",
          content: "swal2-custom-content",
          actions: "swal2-custom-actions",
          confirmButton: "swal2-custom-confirm-button",
        },
      });
      nav(module === "template" ? "/template" : "/work-order");
    } catch (error) {
      Swal.fire({
        title: "Oops...",
        icon: "error",
        html: SwalErrorMessages(error.response?.data?.message),
        focusConfirm: false,
        customClass: {
          popup: "swal2-custom-popup",
          title: "swal2-custom-title",
          content: "swal2-custom-content",
          actions: "swal2-custom-actions",
          confirmButton: "swal2-custom-confirm-button",
        },
      });

      console.log(error);
      return null; // Ensure function returns null on error
    } finally {
      handleClose();
      setButtonLoading(false);
    }
  }
  function handleClose() {
    setTitleInput("");
    setShowTitleInput(false);
    saveChangesDisclosure.onClose();
  }
  function inputHandler(event) {
    const { value } = event.target;
    setTitleInput(value);
  }
  return (
    <>
      <Modal
        closeOnOverlayClick={!buttonLoading}
        isOpen={saveChangesDisclosure.isOpen}
        onClose={handleClose}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent maxW={"500px"} bg={"white"} overflow={"auto"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            <Flex flexDir={"column"}>
              <Flex>
                {showTitleInput
                  ? `Enter ${formatString(module, true, true, true)} Title`
                  : `Leave Unsaved Changes?`}
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"20px"}>
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  {showTitleInput
                    ? ``
                    : "Are you sure you want to leave and discard your changes?"}
                </Box>
                <Flex fontSize={"14px"} color={"#848484"}>
                  {showTitleInput
                    ? `Before saving it as draft, Please provide a name for the ${formatString(
                        module,
                        false,
                        true,
                        false,
                      )}`
                    : `You have made changes to the ${formatString(
                        module,
                        false,
                        true,
                        false,
                      )}. Exiting this page will permanently discard them`}
                </Flex>
              </Flex>
              {showTitleInput ? (
                <Flex flexDir={"column"}>
                  <Flex fontWeight={700}>
                    {formatString(module, true, true, true)} Title
                  </Flex>
                  <Input
                    value={titleInput}
                    onChange={inputHandler}
                    placeholder="LOTO General Work Flow"
                  ></Input>
                </Flex>
              ) : (
                ""
              )}
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={() =>
                nav(module === "template" ? "/template" : "/work-order")
              }
              isLoading={buttonLoading}
            >
              Leave Page
            </Button>
            <Button
              isDisabled={showTitleInput && !titleInput ? true : false}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() => {
                submitConfirmation();
              }}
              isLoading={buttonLoading}
            >
              Save as Draft
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
