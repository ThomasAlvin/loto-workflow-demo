import {
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
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import tinycolor from "tinycolor2";
import SwalErrorMessages from "../SwalErrorMessages";

export default function NotificationMarkAllAsReadConfirmationModal({
  variant,
  fetchAndLoadNotifications,
  markAllAsRead,
  abortControllerRef,
  notificationLoading,
}) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [buttonLoading, setButtonLoading] = useState(false);

  async function markAllAsReadWithLoading() {
    try {
      setButtonLoading(true);
      const response = await markAllAsRead();
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
      fetchAndLoadNotifications();
    } catch (error) {
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
      console.log(error);
    } finally {
      onClose();
      setButtonLoading(false);
    }
  }

  return (
    <>
      {variant === "Text" ? (
        <Flex
          onClick={onOpen}
          cursor={"pointer"}
          _hover={{ textDecor: "underline" }}
          color={"#dc143c"}
          fontSize={"14px"}
        >
          Mark all as read
        </Flex>
      ) : variant === "Button" ? (
        <Button
          isLoading={notificationLoading}
          onClick={onOpen}
          _hover={{
            bg: tinycolor("#dc143c").darken(8).toString(),
          }}
          color={"white"}
          h={"28px"}
          py={"4px"}
          px={"8px"}
          bg={"#dc143c"}
        >
          <Flex fontSize={"14px"} alignItems={"center"} color={"white"}>
            <Flex fontSize={"20px"}>
              <IoCheckmarkDoneSharp />
            </Flex>
            &nbsp;Mark all as read
          </Flex>
        </Button>
      ) : (
        ""
      )}

      <Modal
        closeOnOverlayClick={!buttonLoading}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            Mark all as read?
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex fontWeight={700} flexDir={"column"} gap={"10px"}>
              <Flex>
                Are you sure you want to mark all notifications as read?
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              isLoading={buttonLoading}
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              isLoading={buttonLoading}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={markAllAsReadWithLoading}
            >
              Mark all as read
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
