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
  Textarea,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { api } from "../../api/api";
import Swal from "sweetalert2";
import SwalErrorMessages from "../SwalErrorMessages";
import { FiCheckCircle } from "react-icons/fi";
import tinycolor from "tinycolor2";

export default function ReviewDetailsApproveModal({
  fetchReviewDetails,
  abortControllerRef,
  buttonLoading,
  setButtonLoading,
  workOrderReviewerUID,
  isDisabled,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reasonInput, setReasonInput] = useState("");
  function inputHandler(event) {
    setReasonInput(event.target.value);
  }
  function handleCloseModal() {
    onClose();
    setReasonInput("");
  }
  async function onSubmit() {
    setButtonLoading(true);
    await api
      .post(`work-order/${workOrderReviewerUID}/review/approve`, {
        reason: reasonInput,
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
        abortControllerRef.current.abort(); // Cancel any previous request
        abortControllerRef.current = new AbortController();
        fetchReviewDetails(true);
      })
      .catch((error) => {
        console.log(error);
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
      });
  }
  return (
    <>
      <Tooltip
        bg={"#dc143c"}
        hasArrow
        fontWeight={700}
        label={
          isDisabled ? (
            <Flex maxW={"240px"}>
              Work order deadline has passed and cannot be approved.
            </Flex>
          ) : (
            ""
          )
        }
      >
        <Button
          isDisabled={isDisabled}
          zIndex={"200"}
          px={"20px"}
          bg={"#3D9666"}
          color={"white"}
          alignItems={"center"}
          gap={"10px"}
          _hover={{
            bg: tinycolor("#3D9666").darken(5).toString(),
          }}
          onClick={() => {
            onOpen();
          }}
        >
          <FiCheckCircle fontSize={"20px"} />
          Approve Work Order
        </Button>
      </Tooltip>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
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
            <Flex color={"crimson"}>Approve Work Order</Flex>

            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>
                Provide a brief comment or summary explaining your approval.
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"20px"}>
              <Flex position={"relative"} flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Comment (
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
                    <Flex>
                      You can provide a brief comment or notes about the work
                      order.
                    </Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Textarea
                    id="description"
                    onChange={inputHandler}
                    placeholder="Ex: All required steps have been completed and verified. Proceeding with approval."
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
                  onClick={onSubmit}
                >
                  Approve
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
