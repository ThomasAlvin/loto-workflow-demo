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

export default function DeleteMachineCategoryConfirmationModal({
  deleteButtonLoading,
  deleteMachineCategory,
  selectedDeleteMachineCategoryUID,
  onClose,
  isOpen,
}) {
  function handleCloseModal() {
    onClose();
  }
  return (
    <>
      <Modal
        closeOnOverlayClick={!deleteButtonLoading}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        closeOnEsc={!deleteButtonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"} minW={"500px"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            Delete Machine Category from worksite?
          </ModalHeader>
          <ModalCloseButton isDisabled={deleteButtonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"}>
              <Flex fontWeight={700}>
                Are you sure you want to delete this Machine Category?
              </Flex>
              <Flex fontSize={"14px"} color={"#848484"}>
                deleting this machine category is permanent and cannot be
                undone.
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              isLoading={deleteButtonLoading}
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              isLoading={deleteButtonLoading}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() => {
                deleteMachineCategory(selectedDeleteMachineCategoryUID);
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
