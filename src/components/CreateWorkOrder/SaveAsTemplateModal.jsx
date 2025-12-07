import {
  Box,
  Button,
  Divider,
  Flex,
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

import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { api } from "../../api/api";
import Swal from "sweetalert2";
import SwalErrorMessages from "../SwalErrorMessages";
import convertToFormData from "../../utils/ConvertToFormData";
import { useReactFlow } from "@xyflow/react";
import getConnectedNodes from "../../utils/getConnectedNodes";

export default function SaveAsTemplateModal({ workOrderDetails }) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { getNodes, getEdges } = useReactFlow();
  const [buttonLoading, setButtonLoading] = useState(false);

  async function submitTemplate(status) {
    setButtonLoading(true);

    const startNode = getNodes().find((n) => n.data.isStart);
    const connectedNodeIds = getConnectedNodes(startNode, getEdges());
    const connectedNodes = getNodes()
      .filter((n) => connectedNodeIds.has(n.id))
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

    const filteredWorkFlow = connectedNodes.map((item) => {
      const filteredItem = { ...item.data };

      if (!filteredItem.form) {
        delete filteredItem.formQuestions;
      }

      if (!filteredItem.notify) {
        delete filteredItem.notificationMessage;
      }

      return filteredItem;
    });

    let formDataObject = {
      name: workOrderDetails.name,
      description: workOrderDetails.description,
      workFlow: filteredWorkFlow,
    };
    const formData = convertToFormData(formDataObject);

    await api
      .post(`template?status=${status}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
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
        onClose();
        setButtonLoading(false);
      });
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
          <MdOutlineDriveFolderUpload />
        </Flex>
        <Flex>Save as template</Flex>
      </Button>

      <Modal
        closeOnOverlayClick={!buttonLoading}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"} overflow={"auto"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            <Flex flexDir={"column"}>
              <Flex>Save as template?</Flex>
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
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Save this workflow as a template for future projects?{" "}
                </Box>
                <Flex fontSize={"14px"} color={"#848484"}>
                  You can edit the template anytime through the template list
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={onClose}
              isLoading={buttonLoading}
            >
              Cancel
            </Button>
            <Button
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() => {
                submitTemplate("completed");
              }}
              isLoading={buttonLoading}
            >
              Save as template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
