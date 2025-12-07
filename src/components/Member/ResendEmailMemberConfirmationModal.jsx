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

export default function ResendEmailMemberConfirmationModal({
  resendEmailButtonLoading,
  resendEmailMember,
  selectedResendEmailMemberUID,
  onClose,
  isOpen,
}) {
  function handleCloseModal() {
    onClose();
  }
  return (
    <>
      <Modal
        closeOnOverlayClick={!resendEmailButtonLoading}
        isOpen={isOpen}
        onClose={handleCloseModal}
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
            Resend email for this member?
          </ModalHeader>
          <ModalCloseButton
            isDisabled={resendEmailButtonLoading}
            color={"black"}
          />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"}>
              <Flex fontWeight={700}>
                Are you sure you want to resend email to this member?
              </Flex>
              <Flex fontSize={"14px"} color={"#848484"}>
                the last sent mail will be invalidated if you proceed.
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              isLoading={resendEmailButtonLoading}
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              isLoading={resendEmailButtonLoading}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() => {
                resendEmailMember(selectedResendEmailMemberUID);
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
