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

import { useReactFlow } from "@xyflow/react";
import { RiDraftLine } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../../api/api";
import convertToFormData from "../../utils/convertToFormData";
import getConnectedNodes from "../../utils/getConnectedNodes";
import SwalErrorMessages from "../SwalErrorMessages";

export default function WorkOrderSaveAsDraftConfirmationModal({
  variant,
  workOrderDetails,
}) {
  const { getNodes, getEdges } = useReactFlow();
  const { UID } = useParams();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [titleInput, setTitleInput] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const nav = useNavigate();
  const nodes = getNodes();
  const edges = getEdges();
  async function saveAsDraft() {
    setButtonLoading(true);

    const startNode = nodes.find((n) => n.data.isStart);
    const connectedNodeIds = getConnectedNodes(startNode, edges);
    const connectedNodes = nodes
      .filter((n) => connectedNodeIds.has(n.id))
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

    const filteredWorkFlow = connectedNodes.map((item) => {
      const filteredItem = { ...item.data };

      if (!filteredItem.form) {
        delete filteredItem.template_form_questions;
        delete filteredItem.formQuestions;
      }

      if (!filteredItem.notify) {
        delete filteredItem.notificationMessage;
        // delete filteredItem.notification_message;
      }
      if (!filteredItem.machine) {
        delete filteredItem.selectedMachines;
      }

      return filteredItem;
    });

    let formDataObject = {
      ...workOrderDetails,
      name: titleInput || workOrderDetails.name,
      workOrderSteps: filteredWorkFlow,
    };

    const formData = convertToFormData(formDataObject);

    try {
      const response = await api.testSubmit("Work order saves successfully");

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
      nav("/work-order");
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
  async function submitWorkOrder() {
    if (workOrderDetails?.name || titleInput) {
      saveAsDraft();
    } else {
      setButtonLoading(true);
      setTimeout(() => {
        setButtonLoading(false);
        setShowTitleInput(true);
      }, 1000);
    }
  }
  function handleClose() {
    setTitleInput("");
    setShowTitleInput(false);
    onClose();
  }
  function inputHandler(event) {
    const { value } = event.target;
    setTitleInput(value);
  }
  return (
    <>
      <Button
        onClick={onOpen}
        gap={"5px"}
        fontSize={"14px"}
        bg={"#dc143c"}
        color={"white"}
        h={"auto"}
        p={"6px 12px"}
        alignItems={"center"}
      >
        <Flex fontSize={"18px"}>
          <RiDraftLine />
        </Flex>
        <Flex>Save as draft</Flex>
      </Button>

      <Modal
        closeOnOverlayClick={!buttonLoading}
        isOpen={isOpen}
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
              <Flex>Save as draft?</Flex>
              <Box
                fontWeight={700}
                color={"#848484"}
                fontSize={"16px"}
                as="span"
                flex="1"
                textAlign="left"
              ></Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"20px"}>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    {showTitleInput ? `` : "Save this work order as draft?"}
                  </Box>
                  <Flex fontSize={"14px"} color={"#848484"}>
                    {showTitleInput
                      ? `Before saving it as draft, Please provide a name for the work order`
                      : `You can edit the work order anytime through the work order
                  list`}
                  </Flex>
                </Flex>
              </Flex>
              {showTitleInput ? (
                <Flex flexDir={"column"}>
                  <Flex fontWeight={700}>Work Order Title</Flex>
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
              onClick={handleClose}
              isLoading={buttonLoading}
            >
              Cancel
            </Button>
            <Button
              isDisabled={showTitleInput && !titleInput ? true : false}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() => {
                submitWorkOrder();
              }}
              isLoading={buttonLoading}
            >
              Save as draft
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
