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
} from "@chakra-ui/react";

export default function LeavePageConfirmationModal({
  handleLeavePageConfirmation,
  leavePageConfirmationModal,
}) {
  return (
    <>
      <Modal
        isOpen={leavePageConfirmationModal.isOpen}
        onClose={leavePageConfirmationModal.onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg={"white"} overflow={"auto"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            Leave Page?
          </ModalHeader>
          <ModalCloseButton color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Are you sure you want to leave you're current work?
                </Box>
                <Flex fontSize={"14px"} color={"#848484"}>
                  You're work will be saved as drafted if you proceed
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
              onClick={leavePageConfirmationModal.onClose}
            >
              Cancel
            </Button>
            <Button
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={handleLeavePageConfirmation}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
