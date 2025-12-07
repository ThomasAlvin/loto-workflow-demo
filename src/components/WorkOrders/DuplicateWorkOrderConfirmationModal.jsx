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

export default function DuplicateWorkOrderConfirmationModal({
  duplicateButtonLoading,
  duplicateWorkOrder,
  selectedDuplicateWorkOrderUID,
  onClose,
  isOpen,
}) {
  function handleCloseModal() {
    onClose();
  }
  return (
    <>
      <Modal
        closeOnOverlayClick={!duplicateButtonLoading}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg={"white"} minW={"500px"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            Duplicate Work order from worksite?
          </ModalHeader>
          <ModalCloseButton
            isDisabled={duplicateButtonLoading}
            color={"black"}
          />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"}>
              <Flex fontWeight={700}>
                Are you sure you want to duplicate this Work Order?
              </Flex>
              <Flex fontSize={"14px"} color={"#848484"}>
                This action will create a drafted copy of the Work Order.
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              isLoading={duplicateButtonLoading}
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              isLoading={duplicateButtonLoading}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() => {
                duplicateWorkOrder(selectedDuplicateWorkOrderUID);
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
