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
} from "@chakra-ui/react";

export default function UnsavedChangesModal({
  modalUnsavedChanges,
  closeModal,
}) {
  return (
    <Modal
      isOpen={modalUnsavedChanges.isOpen}
      onClose={modalUnsavedChanges.onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent bg={"white"}>
        <ModalHeader
          display={"flex"}
          gap={"10px"}
          alignItems={"center"}
          color={"#dc143c"}
        >
          Leave unsaved changes?
        </ModalHeader>
        <ModalCloseButton color={"black"} />
        <Divider m={0} />

        <ModalBody>
          <Flex flexDir={"column"} gap={"10px"}>
            <Flex fontWeight={700}>
              Are you sure you want to discard the changes you've made?
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
            onClick={modalUnsavedChanges.onClose}
          >
            Keep Editing
          </Button>
          <Button
            _hover={{ background: "#b51031" }}
            background={"#dc143c"}
            color={"white"}
            onClick={closeModal}
          >
            Discard Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
