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

export default function SetToDefaultTFAConfirmationModal({
  setToDefaultTFADisclosure,
  selectedTFA,
  buttonLoading,
  closeSetToDefaultTFAModal,
  submitFn,
}) {
  return (
    <Modal
      closeOnOverlayClick={!buttonLoading}
      isOpen={setToDefaultTFADisclosure.isOpen}
      onClose={closeSetToDefaultTFAModal}
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
          Set to Default?
        </ModalHeader>
        <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
        <Divider m={0} />

        <ModalBody>
          <Flex flexDir={"column"} gap={"10px"}>
            <Flex fontWeight={700}>
              Do you want to set {selectedTFA.label} as your default two factor
              authentication method?
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
            onClick={closeSetToDefaultTFAModal}
          >
            Cancel
          </Button>
          <Button
            isLoading={buttonLoading}
            _hover={{ background: "#b51031" }}
            background={"#dc143c"}
            color={"white"}
            onClick={() => {
              submitFn(selectedTFA.value);
            }}
          >
            Set to Default
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
