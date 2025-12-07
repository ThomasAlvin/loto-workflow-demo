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

export default function CancelSubscriptionConfirmationModal({
  cancelSubscriptionAtPeriodEnd,
  buttonLoading,
  onClose,
  isOpen,
}) {
  return (
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
          Cancel subscription?
        </ModalHeader>
        <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
        <Divider m={0} />

        <ModalBody>
          <Flex flexDir={"column"}>
            <Flex fontWeight={700}>
              Are you sure you want to cancel your subscription?
            </Flex>

            <Flex
              fontSize={"12px"}
              gap={"5px"}
              color={"#848484"}
              alignItems={"center"}
            >
              Canceling will stop future billing and remove access to premium
              features at the end of your current billing cycle. You can
              reactivate anytime.
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
            onClick={() => cancelSubscriptionAtPeriodEnd()}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
