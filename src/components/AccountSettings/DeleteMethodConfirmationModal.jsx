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
import { FaTrashAlt } from "react-icons/fa";
import tinycolor from "tinycolor2";

export default function DeleteMethodConfirmationModal({
  submitFn,
  buttonLoading,
}) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        _hover={{
          bg: tinycolor("#dc143c").darken(5).toString(),
        }}
        h={"auto"}
        borderRadius={"5px"}
        fontWeight={700}
        fontSize={"12px"}
        bg={"#dc143c"}
        color={"white"}
        px={"8px"}
        py={"5px"}
      >
        <Flex gap={"4px"} alignItems={"center"}>
          <Flex>
            <FaTrashAlt />
          </Flex>
          <Flex>Delete</Flex>
        </Flex>
      </Button>
      <Modal
        closeOnOverlayClick={!buttonLoading}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent maxW={"500px"} bg={"white"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            Delete Google Authenticator Connection?
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex fontWeight={700}>
                Are you sure you want to delete your Google Authenticator
                connection?
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
              onClick={submitFn}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
