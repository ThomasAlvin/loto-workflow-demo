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

export default function RemoveMemberConfirmationModal({
  removeButtonLoading,
  removeMember,
  selectedRemoveMemberUID,
  onClose,
  isOpen,
}) {
  function handleCloseModal() {
    onClose();
  }
  return (
    <>
      <Modal
        closeOnOverlayClick={!removeButtonLoading}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        closeOnEsc={!removeButtonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            Remove member?
          </ModalHeader>
          <ModalCloseButton isDisabled={removeButtonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"}>
              <Flex fontWeight={700}>
                Are you sure you want to remove this member?
              </Flex>
              <Flex fontSize={"14px"} color={"#848484"}>
                removing this member is permanent and cannot be undone.
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              isLoading={removeButtonLoading}
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              isLoading={removeButtonLoading}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() => {
                removeMember(selectedRemoveMemberUID);
              }}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
